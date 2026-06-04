import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, projectsTable, tasksTable } from "@workspace/db";
import {
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
  ListProjectTasksParams,
  CreateProjectBody,
  UpdateProjectBody,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

router.get("/projects", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);

  const projectsWithCounts = await Promise.all(
    projects.map(async (project) => {
      const tasks = await db.select({ status: tasksTable.status }).from(tasksTable).where(eq(tasksTable.projectId, project.id));
      const taskCount = tasks.length;
      const completedTaskCount = tasks.filter((t) => t.status === "done").length;
      return {
        ...project,
        dueDate: project.dueDate?.toISOString() ?? null,
        createdAt: project.createdAt.toISOString(),
        taskCount,
        completedTaskCount,
      };
    })
  );

  res.json(projectsWithCounts);
});

router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dueDate, ...rest } = parsed.data;
  const [project] = await db
    .insert(projectsTable)
    .values({ ...rest, dueDate: dueDate ? new Date(dueDate) : undefined })
    .returning();

  await logActivity({
    type: "project_created",
    description: `Project "${project.name}" was created`,
    entityName: project.name,
  });

  res.status(201).json({
    ...project,
    dueDate: project.dueDate?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    taskCount: 0,
    completedTaskCount: 0,
  });
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const params = GetProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db.select().from(projectsTable).where(eq(projectsTable.id, params.data.id));
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const tasks = await db.select({ status: tasksTable.status }).from(tasksTable).where(eq(tasksTable.projectId, project.id));
  const taskCount = tasks.length;
  const completedTaskCount = tasks.filter((t) => t.status === "done").length;

  res.json({
    ...project,
    dueDate: project.dueDate?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    taskCount,
    completedTaskCount,
  });
});

router.patch("/projects/:id", async (req, res): Promise<void> => {
  const params = UpdateProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { dueDate, ...rest } = parsed.data;
  const [project] = await db
    .update(projectsTable)
    .set({ ...rest, ...(dueDate !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}) })
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const tasks = await db.select({ status: tasksTable.status }).from(tasksTable).where(eq(tasksTable.projectId, project.id));

  res.json({
    ...project,
    dueDate: project.dueDate?.toISOString() ?? null,
    createdAt: project.createdAt.toISOString(),
    taskCount: tasks.length,
    completedTaskCount: tasks.filter((t) => t.status === "done").length,
  });
});

router.delete("/projects/:id", async (req, res): Promise<void> => {
  const params = DeleteProjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [project] = await db.delete(projectsTable).where(eq(projectsTable.id, params.data.id)).returning();
  if (!project) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/projects/:id/tasks", async (req, res): Promise<void> => {
  const params = ListProjectTasksParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const tasks = await db
    .select({
      id: tasksTable.id,
      title: tasksTable.title,
      description: tasksTable.description,
      status: tasksTable.status,
      priority: tasksTable.priority,
      projectId: tasksTable.projectId,
      assigneeId: tasksTable.assigneeId,
      dueDate: tasksTable.dueDate,
      createdAt: tasksTable.createdAt,
    })
    .from(tasksTable)
    .where(eq(tasksTable.projectId, params.data.id));

  const { membersTable: mt } = await import("@workspace/db");
  const members = await db.select().from(mt);
  const { projectsTable: pt } = await import("@workspace/db");
  const [project] = await db.select().from(pt).where(eq(pt.id, params.data.id));

  const result = tasks.map((task) => {
    const assignee = task.assigneeId ? members.find((m) => m.id === task.assigneeId) : null;
    return {
      ...task,
      projectName: project?.name ?? null,
      assigneeName: assignee?.name ?? null,
      assigneeAvatar: assignee?.avatarUrl ?? null,
      dueDate: task.dueDate?.toISOString() ?? null,
      createdAt: task.createdAt.toISOString(),
    };
  });

  res.json(result);
});

export default router;
