import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserByUnionId(unionId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email.toLowerCase()))
    .limit(1);
  return rows.at(0);
}

export async function findUserByGoogleId(googleId: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.googleId, googleId))
    .limit(1);
  return rows.at(0);
}

export async function countAdmins() {
  const rows = await getDb()
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.role, "admin"))
    .limit(1);
  return rows.length;
}

export async function insertUser(data: InsertUser) {
  await getDb().insert(schema.users).values(data);
}

export async function touchSignIn(userId: number) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, userId));
}
