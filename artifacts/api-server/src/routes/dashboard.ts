import { Router, type IRouter } from "express";
import { db, projectsTable, tasksTable, membersTable, activityTable } from "@workspace/db";
import { lt } from "drizzle-orm";

const router: IRouter = Router();

router.get("/dashboard/summary", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable);
  const tasks = await db.select().from(tasksTable);
  const members = await db.select().from(membersTable);

  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "done").length;
  const now = new Date();
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== "done"
  ).length;
  const teamSize = members.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) / 100 : 0;

  res.json({
    totalProjects,
    activeProjects,
    totalTasks,
    completedTasks,
    overdueTasks,
    teamSize,
    completionRate,
  });
});

router.get("/dashboard/activity", async (_req, res): Promise<void> => {
  const activity = await db
    .select()
    .from(activityTable)
    .orderBy(activityTable.createdAt)
    .limit(20);

  res.json(
    activity.reverse().map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
    }))
  );
});

router.get("/dashboard/tasks-by-status", async (_req, res): Promise<void> => {
  const tasks = await db.select({ status: tasksTable.status }).from(tasksTable);
  const statusMap: Record<string, number> = {};
  for (const task of tasks) {
    statusMap[task.status] = (statusMap[task.status] ?? 0) + 1;
  }
  const result = Object.entries(statusMap).map(([status, count]) => ({ status, count }));
  res.json(result);
});

router.get("/dashboard/overdue-tasks", async (_req, res): Promise<void> => {
  const now = new Date();
  const tasks = await db.select().from(tasksTable);
  const overdue = tasks.filter(
    (t) => t.dueDate && t.dueDate < now && t.status !== "done"
  );

  const { projectsTable: pt, membersTable: mt } = await import("@workspace/db");
  const projects = await db.select().from(pt);
  const members = await db.select().from(mt);

  const result = overdue.map((task) => {
    const project = projects.find((p) => p.id === task.projectId);
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
