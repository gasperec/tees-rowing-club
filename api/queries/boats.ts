import { asc, eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertBoat } from "@db/schema";
import { getDb } from "./connection";

export async function listActiveBoats() {
  return getDb()
    .select()
    .from(schema.boats)
    .where(eq(schema.boats.active, true))
    .orderBy(asc(schema.boats.name));
}

export async function listAllBoats() {
  return getDb().select().from(schema.boats).orderBy(asc(schema.boats.name));
}

export async function findBoatById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.boats)
    .where(eq(schema.boats.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createBoat(data: InsertBoat) {
  await getDb().insert(schema.boats).values(data);
}

export async function setBoatActive(id: number, active: boolean) {
  await getDb()
    .update(schema.boats)
    .set({ active })
    .where(eq(schema.boats.id, id));
}
