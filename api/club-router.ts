import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, adminQuery } from "./middleware";
import type { TrpcContext } from "./context";
import * as boatQueries from "./queries/boats";
import * as bookingQueries from "./queries/bookings";
import * as memberQueries from "./queries/members";
import * as profileQueries from "./queries/profiles";

type AuthedCtx = TrpcContext & { user: NonNullable<TrpcContext["user"]> };

/** Coaches and admins have standing permission to book instantly. */
async function hasBookingPermission(ctx: AuthedCtx) {
  if (ctx.user.role === "admin") return true;
  const profile = await profileQueries.getProfileByUserId(ctx.user.id);
  const position = (profile?.clubPosition ?? "").toLowerCase();
  return (
    profile?.squad === "Cox / Coach" ||
    position.includes("coach") ||
    position.includes("captain")
  );
}

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const bookingInput = z.object({
  boatId: z.number().int().positive(),
  outingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  sessionType: z.enum(["outing", "racing"]),
  direction: z.enum(["yarm", "barrage"]),
  signedOutBy: z.string().min(1).max(255),
  ledByCoach: z.boolean(),
  coachName: z.string().max(255).optional(),
  crew: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
});

function toMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export const clubRouter = createRouter({
  // ---------- Boats ----------
  boats: createRouter({
    list: authedQuery.query(() => boatQueries.listActiveBoats()),

    listAll: adminQuery.query(() => boatQueries.listAllBoats()),

    create: adminQuery
      .input(
        z.object({
          name: z.string().min(1).max(255),
          boatClass: z.string().min(1).max(50),
          seats: z.number().int().min(1).max(8),
          coxed: z.boolean().default(false),
          notes: z.string().max(500).optional(),
        })
      )
      .mutation(({ input }) => boatQueries.createBoat(input)),

    setActive: adminQuery
      .input(z.object({ id: z.number().int().positive(), active: z.boolean() }))
      .mutation(({ input }) => boatQueries.setBoatActive(input.id, input.active)),
  }),

  // ---------- Bookings ----------
  bookings: createRouter({
    create: authedQuery.input(bookingInput).mutation(async ({ ctx, input }) => {
      const boat = await boatQueries.findBoatById(input.boatId);
      if (!boat || !boat.active) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Boat not available." });
      }
      if (toMinutes(input.endTime) <= toMinutes(input.startTime)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "End time must be after start time.",
        });
      }

      // Clash detection: same boat, same date, overlapping time window
      const existing = await bookingQueries.listBoatBookingsOnDate(
        input.boatId,
        input.outingDate
      );
      const clash = existing.find(
        (b) =>
          toMinutes(input.startTime) < toMinutes(b.endTime) &&
          toMinutes(input.endTime) > toMinutes(b.startTime)
      );
      if (clash) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `${boat.name} is already booked ${clash.startTime}–${clash.endTime} on that date.`,
        });
      }

      // Coaches/admins book instantly; other members submit a request
      const instant = await hasBookingPermission(ctx);
      await bookingQueries.createBooking({
        ...input,
        userId: ctx.user.id,
        status: instant ? "confirmed" : "pending",
      });
      return { ok: true, status: instant ? "confirmed" : "pending" };
    }),

    mine: authedQuery.query(({ ctx }) =>
      bookingQueries.listUserBookings(ctx.user.id)
    ),

    cancel: authedQuery
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await bookingQueries.findBookingById(input.id);
        if (!booking) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Booking not found." });
        }
        if (ctx.user.role !== "admin" && booking.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You can only cancel your own bookings.",
          });
        }
        await bookingQueries.setBookingStatus(input.id, "cancelled");
        return { ok: true };
      }),

    /** Requests awaiting approval — coaches and admins. */
    pending: authedQuery.query(async ({ ctx }) => {
      if (!(await hasBookingPermission(ctx))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Coaches and admins only." });
      }
      return bookingQueries.listPendingBookings();
    }),

    approve: authedQuery
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!(await hasBookingPermission(ctx))) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Coaches and admins only." });
        }
        await bookingQueries.setBookingStatus(input.id, "confirmed");
        return { ok: true };
      }),

    reject: authedQuery
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => {
        if (!(await hasBookingPermission(ctx))) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Coaches and admins only." });
        }
        await bookingQueries.setBookingStatus(input.id, "cancelled");
        return { ok: true };
      }),

    /** Boats currently out on the water — for the overdue dashboard. */
    boatsOut: authedQuery.query(async ({ ctx }) => {
      if (!(await hasBookingPermission(ctx))) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Coaches and admins only." });
      }
      return bookingQueries.listBoatsOut();
    }),

    /** Full club history — any signed-in member. Powers the CSV export. */
    history: authedQuery
      .input(
        z.object({
          from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        })
      )
      .query(({ input }) => bookingQueries.listBookingsInRange(input.from, input.to)),
  }),

  // ---------- Members (admin) ----------
  members: createRouter({
    pending: adminQuery.query(() => memberQueries.listPendingMembers()),
    listAll: adminQuery.query(() => memberQueries.listAllMembers()),
    setStatus: adminQuery
      .input(
        z.object({
          id: z.number().int().positive(),
          status: z.enum(["approved", "rejected", "pending"]),
        })
      )
      .mutation(({ input }) =>
        memberQueries.setMembershipStatus(input.id, input.status)
      ),
  }),
});
