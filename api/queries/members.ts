import { asc, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

const memberFields = {
  id: schema.users.id,
  name: schema.users.name,
  email: schema.users.email,
  avatar: schema.users.avatar,
  role: schema.users.role,
  membershipStatus: schema.users.membershipStatus,
  createdAt: schema.users.createdAt,
  lastSignInAt: schema.users.lastSignInAt,
};

export async function listPendingMembers() {
  return getDb()
    .select(memberFields)
    .from(schema.users)
    .where(eq(schema.users.membershipStatus, "pending"))
    .orderBy(asc(schema.users.createdAt));
}

export async function listAllMembers() {
  return getDb()
    .select(memberFields)
    .from(schema.users)
    .orderBy(asc(schema.users.name));
}

export async function setMembershipStatus(
  id: number,
  status: "approved" | "rejected" | "pending"
) {
  await getDb()
    .update(schema.users)
    .set({ membershipStatus: status })
    .where(eq(schema.users.id, id));
}
