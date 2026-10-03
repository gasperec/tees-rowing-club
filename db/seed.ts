import { getDb } from "../api/queries/connection";
import * as schema from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  const existing = await db.select().from(schema.boats);
  if (existing.length === 0) {
    await db.insert(schema.boats).values([
      { name: "Tees Falcon", boatClass: "1x", seats: 1 },
      { name: "Stockton Flyer", boatClass: "1x", seats: 1 },
      { name: "Infinity", boatClass: "2x", seats: 2 },
      { name: "Teesside Spirit", boatClass: "2-", seats: 2 },
      { name: "Barrage Runner", boatClass: "4x", seats: 4 },
      { name: "Yarm Endeavour", boatClass: "4x+", seats: 4, coxed: true },
      { name: "River Queen", boatClass: "4-", seats: 4 },
      { name: "1864", boatClass: "8+", seats: 8, coxed: true },
    ]);
    console.log("Seeded 8 boats.");
  } else {
    console.log(`Boats already present (${existing.length}), skipping.`);
  }

  console.log("Done.");
  process.exit(0); // close MySQL connection pool
}

seed();
