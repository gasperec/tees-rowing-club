import { eq, asc } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertProfile } from "@db/schema";
import { getDb } from "./connection";

export async function getProfileByUserId(userId: number) {
  const rows = await getDb()
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.userId, userId))
    .limit(1);
  return rows.at(0) ?? null;
}

export async function upsertProfile(data: InsertProfile) {
  await getDb()
    .insert(schema.profiles)
    .values(data)
    .onDuplicateKeyUpdate({ set: { ...data } });
}

export async function setAvatarPath(userId: number, avatarPath: string) {
  await getDb()
    .insert(schema.profiles)
    .values({ userId, avatarPath })
    .onDuplicateKeyUpdate({ set: { avatarPath } });
}

/** Member roster: every user, with their profile if they have one. */
export async function listMemberProfiles() {
  return getDb()
    .select({
      userId: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      loginAvatar: schema.users.avatar,
      role: schema.users.role,
      yearsRowing: schema.profiles.yearsRowing,
      joinedClubYear: schema.profiles.joinedClubYear,
      clubPosition: schema.profiles.clubPosition,
      experienceLevel: schema.profiles.experienceLevel,
      squad: schema.profiles.squad,
      side: schema.profiles.side,
      preferredSeat: schema.profiles.preferredSeat,
      heightCm: schema.profiles.heightCm,
      weightKg: schema.profiles.weightKg,
      awards: schema.profiles.awards,
      bio: schema.profiles.bio,
      canCox: schema.profiles.canCox,
      erg2k: schema.profiles.erg2k,
      erg5k: schema.profiles.erg5k,
      britishRowingNumber: schema.profiles.britishRowingNumber,
      availability: schema.profiles.availability,
      avatarPath: schema.profiles.avatarPath,
    })
    .from(schema.users)
    .leftJoin(schema.profiles, eq(schema.profiles.userId, schema.users.id))
    .orderBy(asc(schema.users.name));
}
