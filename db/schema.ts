import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  int,
  boolean,
  date,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  passwordHash: varchar("passwordHash", { length: 255 }),
  googleId: varchar("googleId", { length: 255 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  membershipStatus: mysqlEnum("membershipStatus", [
    "pending",
    "approved",
    "rejected",
  ])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const boats = mysqlTable("boats", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  boatClass: varchar("boatClass", { length: 50 }).notNull(), // e.g. "1x", "2x", "4x-", "8+"
  seats: int("seats").notNull(),
  coxed: boolean("coxed").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  notes: varchar("notes", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Boat = typeof boats.$inferSelect;
export type InsertBoat = typeof boats.$inferInsert;

export const bookings = mysqlTable("bookings", {
  id: serial("id").primaryKey(),
  boatId: bigint("boatId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => boats.id),
  userId: bigint("userId", { mode: "number", unsigned: true })
    .notNull()
    .references(() => users.id),
  outingDate: date("outingDate", { mode: "string" }).notNull(),
  startTime: varchar("startTime", { length: 5 }).notNull(), // "HH:MM"
  endTime: varchar("endTime", { length: 5 }).notNull(),
  sessionType: mysqlEnum("sessionType", ["outing", "racing"]).notNull(),
  direction: mysqlEnum("direction", ["yarm", "barrage"]).notNull(),
  signedOutBy: varchar("signedOutBy", { length: 255 }).notNull(),
  ledByCoach: boolean("ledByCoach").default(false).notNull(),
  coachName: varchar("coachName", { length: 255 }),
  crew: varchar("crew", { length: 500 }),
  notes: text("notes"),
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "out",
    "returned",
    "cancelled",
  ])
    .default("confirmed")
    .notNull(),
  checkOutPhoto: varchar("checkOutPhoto", { length: 500 }),
  checkOutAt: timestamp("checkOutAt"),
  checkInPhoto: varchar("checkInPhoto", { length: 500 }),
  checkInAt: timestamp("checkInAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

export const profiles = mysqlTable("profiles", {
  userId: bigint("userId", { mode: "number", unsigned: true })
    .primaryKey()
    .references(() => users.id),
  yearsRowing: int("yearsRowing"),
  joinedClubYear: int("joinedClubYear"),
  clubPosition: varchar("clubPosition", { length: 100 }),
  experienceLevel: mysqlEnum("experienceLevel", [
    "beginner",
    "improver",
    "intermediate",
    "experienced",
  ]),
  squad: varchar("squad", { length: 100 }),
  side: mysqlEnum("side", ["bow", "stroke", "either", "scull"]),
  preferredSeat: varchar("preferredSeat", { length: 50 }),
  heightCm: int("heightCm"),
  weightKg: int("weightKg"),
  awards: text("awards"),
  bio: text("bio"),
  canCox: boolean("canCox").default(false).notNull(),
  phone: varchar("phone", { length: 40 }),
  erg2k: varchar("erg2k", { length: 10 }),
  erg5k: varchar("erg5k", { length: 10 }),
  britishRowingNumber: varchar("britishRowingNumber", { length: 20 }),
  availability: varchar("availability", { length: 255 }),
  emergencyContactName: varchar("emergencyContactName", { length: 255 }),
  emergencyContactPhone: varchar("emergencyContactPhone", { length: 40 }),
  avatarPath: varchar("avatarPath", { length: 500 }),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// TODO: Add your tables here. See docs/Database.md for schema examples and patterns.
//
// Example:
// export const posts = mysqlTable("posts", {
//   id: serial("id").primaryKey(),
//   title: varchar("title", { length: 255 }).notNull(),
//   content: text("content"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });
//
// Note: FK columns referencing a serial() PK must use:
//   bigint("columnName", { mode: "number", unsigned: true }).notNull()
