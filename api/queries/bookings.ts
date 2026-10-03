import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertBooking } from "@db/schema";
import { getDb } from "./connection";

const bookingWithBoat = {
  id: schema.bookings.id,
  boatId: schema.bookings.boatId,
  boatName: schema.boats.name,
  boatClass: schema.boats.boatClass,
  userId: schema.bookings.userId,
  userName: schema.users.name,
  userEmail: schema.users.email,
  userPhone: schema.profiles.phone,
  outingDate: schema.bookings.outingDate,
  startTime: schema.bookings.startTime,
  endTime: schema.bookings.endTime,
  sessionType: schema.bookings.sessionType,
  direction: schema.bookings.direction,
  signedOutBy: schema.bookings.signedOutBy,
  ledByCoach: schema.bookings.ledByCoach,
  coachName: schema.bookings.coachName,
  crew: schema.bookings.crew,
  notes: schema.bookings.notes,
  status: schema.bookings.status,
  checkOutPhoto: schema.bookings.checkOutPhoto,
  checkOutAt: schema.bookings.checkOutAt,
  checkInPhoto: schema.bookings.checkInPhoto,
  checkInAt: schema.bookings.checkInAt,
  createdAt: schema.bookings.createdAt,
};

const baseJoin = () =>
  getDb()
    .select(bookingWithBoat)
    .from(schema.bookings)
    .innerJoin(schema.boats, eq(schema.bookings.boatId, schema.boats.id))
    .innerJoin(schema.users, eq(schema.bookings.userId, schema.users.id))
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id));

export async function createBooking(data: InsertBooking) {
  await getDb().insert(schema.bookings).values(data);
}

export async function findBookingById(id: number) {
  const rows = await baseJoin()
    .where(eq(schema.bookings.id, id))
    .limit(1);
  return rows.at(0);
}

export async function listUserBookings(userId: number) {
  return baseJoin()
    .where(eq(schema.bookings.userId, userId))
    .orderBy(desc(schema.bookings.outingDate), desc(schema.bookings.startTime));
}

export async function listBookingsInRange(from?: string, to?: string) {
  const conditions = [];
  if (from) conditions.push(gte(schema.bookings.outingDate, from));
  if (to) conditions.push(lte(schema.bookings.outingDate, to));
  const query = baseJoin().orderBy(
    desc(schema.bookings.outingDate),
    desc(schema.bookings.startTime)
  );
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  return query;
}

/** Live bookings (pending/confirmed/out) for a boat on a given date, for clash detection. */
export async function listBoatBookingsOnDate(boatId: number, date: string) {
  return getDb()
    .select()
    .from(schema.bookings)
    .where(
      and(
        eq(schema.bookings.boatId, boatId),
        eq(schema.bookings.outingDate, date),
        inArray(schema.bookings.status, ["pending", "confirmed", "out"])
      )
    );
}

export async function setBookingStatus(
  id: number,
  status: "pending" | "confirmed" | "out" | "returned" | "cancelled"
) {
  await getDb()
    .update(schema.bookings)
    .set({ status })
    .where(eq(schema.bookings.id, id));
}

export async function setCheckOut(id: number, photoPath: string) {
  await getDb()
    .update(schema.bookings)
    .set({ status: "out", checkOutPhoto: photoPath, checkOutAt: new Date() })
    .where(eq(schema.bookings.id, id));
}

export async function setCheckIn(id: number, photoPath: string) {
  await getDb()
    .update(schema.bookings)
    .set({ status: "returned", checkInPhoto: photoPath, checkInAt: new Date() })
    .where(eq(schema.bookings.id, id));
}

/** Boats currently out on the water (checked out, not yet returned). */
export async function listBoatsOut() {
  return baseJoin()
    .where(eq(schema.bookings.status, "out"))
    .orderBy(desc(schema.bookings.checkOutAt));
}

/** Bookings awaiting approval, oldest first. */
export async function listPendingBookings() {
  return baseJoin()
    .where(eq(schema.bookings.status, "pending"))
    .orderBy(asc(schema.bookings.createdAt));
}
