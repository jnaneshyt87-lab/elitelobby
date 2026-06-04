import { Router, type IRouter } from "express";
import { eq, and, isNull, isNotNull } from "drizzle-orm";
import { db, tasksTable, projectsTable, membersTable } from "@workspace/db";
import {
  GetTaskParams,
  UpdateTaskParams,
  DeleteTaskParams,
  ListTasksQueryParams,
  CreateTaskBody,
  UpdateTaskBody,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

async function enrichTask(task: typeof tasksTable.$inferSelect) {
  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, task.projectId));
  const assignee = task.assigneeId
    ? (await db.select().from(membersTable).where(eq(membersTable.id, task.assigneeId)))[0]
    : null;
  return {
    ...task,
    projectName: project?.name ?? null,
    assigneeName: assignee?.name ?? null,
    assigneeAvatar: assignee?.avatarUrl ?? null,
    dueDate: task.dueDate?.toISOString() ?? null,
    createdAt: task.createdAt.toISOString(),
  };
}

router.get("/tasks", async (req, res): Promise<void> => {
  const query = ListTasksQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  let tasks = await db.select().from(tasksTable).orderBy(tasksTable.createdAt);

  if (query.data.status) {
    tasks = tasks.filter((t) => t.status === query.data.status);
  }
  if (query.data.assigneeId) {
    tasks = tasks.filter((t) => t.assigneeId === query.data.assigneeId);
  }
  if (query.data.projectId) {
    tasks = tasks.filter((t) => t.projectId === query.data.projectId);
  }

  const enriched = await Promise.all(tasks.map(enrichTask));
  res.json(enriched);
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dueDate, ...rest } = parsed.data;
  const [task] = await db
    .insert(tasksTable)
    .values({ ...rest, dueDate: dueDate ? new Date(dueDate) : undefined })
    .returning();

  await logActivity({
    type: "task_created",
    description: `Task "${task.title}" was created`,
    entityName: task.title,
  });

  const enriched = await enrichTask(task);
  res.status(201).json(enriched);
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db.select().from(tasksTable).where(eq(tasksTable.id, params.data.id));
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(await enrichTask(task));
});

router.patch("/tasks/:id", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dueDate, assigneeId, ...rest } = parsed.data;
  const updateData: Record<string, unknown> = { ...rest };
  if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
  if (assigneeId !== undefined) updateData.assigneeId = assigneeId;

  const [task] = await db
    .update(tasksTable)
    .set(updateData)
    .where(eq(tasksTable.id, params.data.id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  if (parsed.data.status === "done") {
    await logActivity({
      type: "task_completed",
      description: `Task "${task.title}" was completed`,
      entityName: task.title,
    });
  } else {
    await logActivity({
      type: "task_updated",
      description: `Task "${task.title}" was updated`,
      entityName: task.title,
    });
  }

  res.json(await enrichTask(task));
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db.delete(tasksTable).where(eq(tasksTable.id, params.data.id)).returning();
  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
