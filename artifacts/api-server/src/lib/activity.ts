import { db } from "@workspace/db";
import { activityTable } from "@workspace/db";

interface ActivityInput {
  type: string;
  description: string;
  entityName?: string;
  actorName?: string;
}

export async function logActivity(input: ActivityInput): Promise<void> {
  try {
    await db.insert(activityTable).values(input);
  } catch {
    // Best-effort activity logging — never throw
  }
}
