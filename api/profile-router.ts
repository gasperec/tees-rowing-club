import { z } from "zod";
import { createRouter, authedQuery } from "./middleware";
import * as profileQueries from "./queries/profiles";

const optionalInt = (min: number, max: number) =>
  z
    .union([z.number().int().min(min).max(max), z.null()])
    .optional()
    .transform((v) => v ?? null);

export const profileRouter = createRouter({
  mine: authedQuery.query(({ ctx }) =>
    profileQueries.getProfileByUserId(ctx.user.id)
  ),

  save: authedQuery
    .input(
      z.object({
        yearsRowing: optionalInt(0, 80),
        joinedClubYear: optionalInt(1864, 2100),
        clubPosition: z.string().max(100).nullable().optional(),
        experienceLevel: z
          .enum(["beginner", "improver", "intermediate", "experienced"])
          .nullable()
          .optional(),
        squad: z.string().max(100).nullable().optional(),
        side: z.enum(["bow", "stroke", "either", "scull"]).nullable().optional(),
        preferredSeat: z.string().max(50).nullable().optional(),
        heightCm: optionalInt(100, 230),
        weightKg: optionalInt(30, 200),
        awards: z.string().max(4000).nullable().optional(),
        bio: z.string().max(2000).nullable().optional(),
        canCox: z.boolean().optional(),
        phone: z.string().max(40).nullable().optional(),
        erg2k: z.string().max(10).nullable().optional(),
        erg5k: z.string().max(10).nullable().optional(),
        britishRowingNumber: z.string().max(20).nullable().optional(),
        availability: z.string().max(255).nullable().optional(),
        emergencyContactName: z.string().max(255).nullable().optional(),
        emergencyContactPhone: z.string().max(40).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await profileQueries.upsertProfile({
        userId: ctx.user.id,
        yearsRowing: input.yearsRowing,
        joinedClubYear: input.joinedClubYear,
        clubPosition: input.clubPosition ?? null,
        experienceLevel: input.experienceLevel ?? null,
        squad: input.squad ?? null,
        side: input.side ?? null,
        preferredSeat: input.preferredSeat ?? null,
        heightCm: input.heightCm,
        weightKg: input.weightKg,
        awards: input.awards ?? null,
        bio: input.bio ?? null,
        canCox: input.canCox ?? false,
        phone: input.phone ?? null,
        erg2k: input.erg2k ?? null,
        erg5k: input.erg5k ?? null,
        britishRowingNumber: input.britishRowingNumber ?? null,
        availability: input.availability ?? null,
        emergencyContactName: input.emergencyContactName ?? null,
        emergencyContactPhone: input.emergencyContactPhone ?? null,
      });
      return { ok: true };
    }),

  /** Club roster — any signed-in member can view member profiles. */
  roster: authedQuery.query(() => profileQueries.listMemberProfiles()),
});
