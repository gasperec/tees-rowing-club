# Tees Rowing Club Website — Deployment Guide

This guide takes the website from the project files to a live site on your own
domain and hosting, with **no dependence on Kimi**.

---

## What you need

| Thing | Where | Cost |
|---|---|---|
| VPS hosting (KVM 1 is enough) | Hostinger VPS, or any VPS (DigitalOcean, Hetzner…) | ~£4–8/month |
| Your domain | Already have it | — |
| Google sign-in credentials (optional) | Google Cloud Console | Free |

> ⚠️ Ordinary "web hosting" / shared hosting plans **will not work** — this site
> runs a Node.js server and needs a VPS.

---

## Step 1 — Set up the VPS

1. Order a Hostinger VPS (Ubuntu 24.04).
2. SSH in (Hostinger shows the IP and root password in the panel):
   ```bash
   ssh root@YOUR_SERVER_IP
   ```
3. Install Node.js 20, MySQL and a process manager:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs mysql-server
   npm install -g pm2
   ```

## Step 2 — Create the database

```bash
mysql
```
```sql
CREATE DATABASE teesrc CHARACTER SET utf8mb4;
CREATE USER 'teesrc'@'localhost' IDENTIFIED BY 'PICK-A-STRONG-PASSWORD';
GRANT ALL PRIVILEGES ON teesrc.* TO 'teesrc'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3 — Upload the project

On your computer, zip the project folder (you can exclude `node_modules` and
`dist` to make it smaller), then:

```bash
scp teesrc.zip root@YOUR_SERVER_IP:/var/www/
ssh root@YOUR_SERVER_IP
cd /var/www && apt install -y unzip && unzip teesrc.zip -d teesrc && cd teesrc
npm install
```

## Step 4 — Configure `.env`

Edit `/var/www/teesrc/.env`:

```ini
APP_SECRET=<any long random string, e.g. run: openssl rand -hex 32>
DATABASE_URL=mysql://teesrc:PICK-A-STRONG-PASSWORD@localhost:3306/teesrc
GOOGLE_CLIENT_ID=          # optional, see Step 7
GOOGLE_CLIENT_SECRET=      # optional, see Step 7
ADMIN_EMAIL=you@your-email.com   # your email — your account becomes admin
```

## Step 5 — Create tables and start

```bash
npm run db:push     # creates all database tables
npm run build       # builds the site
pm2 start "npm start" --name teesrc
pm2 save && pm2 startup   # auto-restart on reboot
```

The site now runs on port 3000.

## Step 6 — Point your domain + HTTPS

Easiest option — install Caddy (automatic free HTTPS):

```bash
apt install -y caddy
```

Edit `/etc/caddy/Caddyfile`:

```
yourdomain.com {
    reverse_proxy localhost:3000
}
```

```bash
systemctl reload caddy
```

In your domain's DNS settings (wherever you bought the domain), create an
**A record** pointing `@` (and `www`) to your server IP. Within a few minutes
https://yourdomain.com is live.

## Step 7 — (Optional) Enable "Sign in with Google"

1. Go to https://console.cloud.google.com → create a project (free).
2. **APIs & Services → OAuth consent screen** → External → fill in the app name
   ("Tees Rowing Club") and your email → save.
3. **Credentials → Create Credentials → OAuth client ID** → Web application.
   - Authorised redirect URI: `https://yourdomain.com/api/auth/google/callback`
4. Copy the **Client ID** and **Client Secret** into `.env`, then:
   ```bash
   pm2 restart teesrc
   ```

Until you do this, members simply use email + password — everything works
without Google.

## Step 8 — Your first login

1. Open https://yourdomain.com/login
2. Register with the email you put in `ADMIN_EMAIL` — you automatically become
   the **club admin** (approved instantly).
3. Members register the same way; they appear under **Admin → Members** as
   "pending" until you approve them.
4. To give a member instant booking permission, set their position to
   "Coach" on their profile (or make them admin).

---

## Everyday operations

| Task | Command / Where |
|---|---|
| Restart the site | `pm2 restart teesrc` |
| View logs | `pm2 logs teesrc` |
| Update the site | upload new files, `npm install && npm run build && pm2 restart teesrc` |
| Backup the database | `mysqldump teesrc > backup.sql` |
| Uploaded photos | stored in `uploads/` — include in backups |

## What's stored where

- **Accounts, profiles, bookings, boats** → MySQL database (your server)
- **Profile & boat check-out photos** → `uploads/` folder (your server)
- **Sessions** → signed tokens using your `APP_SECRET` — nothing leaves your server
