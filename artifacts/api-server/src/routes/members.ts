import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import { db, membersTable, tasksTable } from "@workspace/db";
import {
  UpdateMemberParams,
  DeleteMemberParams,
  CreateMemberBody,
  UpdateMemberBody,
} from "@workspace/api-zod";
import { logActivity } from "../lib/activity";

const router: IRouter = Router();

async function enrichMember(member: typeof membersTable.$inferSelect) {
  const tasks = await db.select({ id: tasksTable.id }).from(tasksTable).where(eq(tasksTable.assigneeId, member.id));
  return {
    ...member,
    createdAt: member.createdAt.toISOString(),
    taskCount: tasks.length,
  };
}

router.get("/members", async (_req, res): Promise<void> => {
  const members = await db.select().from(membersTable).orderBy(membersTable.createdAt);
  const enriched = await Promise.all(members.map(enrichMember));
  res.json(enriched);
});

router.post("/members", async (req, res): Promise<void> => {
  const parsed = CreateMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db.insert(membersTable).values(parsed.data).returning();

  await logActivity({
    type: "member_added",
    description: `${member.name} joined the team`,
    entityName: member.name,
  });

  res.status(201).json(await enrichMember(member));
});

router.patch("/members/:id", async (req, res): Promise<void> => {
  const params = UpdateMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [member] = await db
    .update(membersTable)
    .set(parsed.data)
    .where(eq(membersTable.id, params.data.id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  res.json(await enrichMember(member));
});

router.delete("/members/:id", async (req, res): Promise<void> => {
  const params = DeleteMemberParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [member] = await db.delete(membersTable).where(eq(membersTable.id, params.data.id)).returning();
  if (!member) {
    res.status(404).json({ error: "Member not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
