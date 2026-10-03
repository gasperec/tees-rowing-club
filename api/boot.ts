import { Hono } from "hono";
import type { Context } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import {
  authenticateRequest,
  handleRegister,
  handleLogin,
  handleGoogleStart,
  handleGoogleCallback,
} from "./auth-local";
import { setAvatarPath } from "./queries/profiles";
import { findBookingById, setCheckOut, setCheckIn } from "./queries/bookings";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
// Authentication (email/password + optional Google sign-in)
app.post("/api/auth/register", handleRegister);
app.post("/api/auth/login", handleLogin);
app.get("/api/auth/google", handleGoogleStart);
app.get("/api/auth/google/callback", handleGoogleCallback);

// Avatar upload (authenticated members)
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads/avatars");
const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

app.post("/api/upload/avatar", async (c) => {
  let user;
  try {
    user = await authenticateRequest(c.req.raw.headers);
  } catch {
    return c.json({ error: "Authentication required" }, 401);
  }

  const form = await c.req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return c.json({ error: "No file provided" }, 400);
  }
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return c.json({ error: "Only JPG, PNG or WebP images are allowed" }, 400);
  }
  if (file.size > 5 * 1024 * 1024) {
    return c.json({ error: "Image must be under 5 MB" }, 400);
  }

  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  const filename = `${user.id}-${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(
    path.join(UPLOADS_DIR, filename),
    Buffer.from(await file.arrayBuffer())
  );

  const urlPath = `/uploads/avatars/${filename}`;
  await setAvatarPath(user.id, urlPath);
  return c.json({ ok: true, avatarPath: urlPath });
});

// Boat check-out / check-in photos (booking owner or admin)
async function handleBoatPhoto(c: Context, kind: "out" | "in") {
  let user;
  try {
    user = await authenticateRequest(c.req.raw.headers);
  } catch {
    return c.json({ error: "Authentication required" }, 401);
  }

  const form = await c.req.formData();
  const file = form.get("file");
  const bookingId = Number(form.get("bookingId"));
  if (!(file instanceof File) || !Number.isInteger(bookingId) || bookingId <= 0) {
    return c.json({ error: "Photo and bookingId are required" }, 400);
  }
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) {
    return c.json({ error: "Only JPG, PNG or WebP images are allowed" }, 400);
  }
  if (file.size > 10 * 1024 * 1024) {
    return c.json({ error: "Photo must be under 10 MB" }, 400);
  }

  const booking = await findBookingById(bookingId);
  if (!booking) {
    return c.json({ error: "Booking not found" }, 404);
  }
  if (user.role !== "admin" && booking.userId !== user.id) {
    return c.json({ error: "You can only check your own bookings" }, 403);
  }
  if (kind === "out" && booking.status !== "confirmed") {
    return c.json({ error: "Only confirmed bookings can be checked out" }, 400);
  }
  if (kind === "in" && booking.status !== "out") {
    return c.json({ error: "This boat has not been checked out" }, 400);
  }

  const dir = path.resolve(process.cwd(), "uploads/boats");
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${bookingId}-${kind}-${crypto.randomUUID()}${ext}`;
  fs.writeFileSync(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));

  const urlPath = `/uploads/boats/${filename}`;
  if (kind === "out") {
    await setCheckOut(bookingId, urlPath);
  } else {
    await setCheckIn(bookingId, urlPath);
  }
  return c.json({ ok: true, photo: urlPath });
}

app.post("/api/upload/check-out", (c) => handleBoatPhoto(c, "out"));
app.post("/api/upload/check-in", (c) => handleBoatPhoto(c, "in"));

app.use("/uploads/*", serveStatic({ root: "./" }));
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
