# Tilawah Tracker

A Quran reading (tilawah) progress tracking app for communities during Ramadan. Members log their reading position (surah:ayah), and a leaderboard keeps everyone motivated.

## Features

- **Username/Password Auth** — sign in with username and password; new accounts go into a pending state until an admin approves them
- **Progress tracking** — log your current position (surah:ayah), with full history of updates
- **Khatam tracking** — automatically computed from position progress (1x, 2x, etc khatam)
- **Leaderboard** — ranked by khatam completed, with top-3 podium cards, search, and pagination
- **Personal dashboard** — see your overall percentage, khatam count, current position in the Quran, and your rank
- **Admin panel** — approve/reject pending users, set target khatam, Ramadan year, and reset progress

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Node.js](https://nodejs.org) |
| Framework | [Hono](https://hono.dev) (JSX SSR) |
| Database | SQLite via `better-sqlite3` |
| Styling | TailwindCSS (CDN) |
| Auth | Username/Password (bcrypt) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v20+
- npm or yarn

### 1. Clone and install

```bash
git clone <repo-url>
cd ngaji
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
APP_NAME=Tilawah Tracker
APP_URL=http://localhost:3000
PORT=3000
```

### 3. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

The app will be available at `http://localhost:3000`.

> **No build step required.** Node.js executes TypeScript via tsx, and TailwindCSS is loaded from CDN.

## Deploying to Production

Deploy using Node.js with PM2 or similar process manager.

### Environment variables for production

```env
APP_NAME=Tilawah Tracker
APP_URL=https://your-domain.com
PORT=3000
NODE_ENV=production
```

### PM2 (Linux VPS)

```bash
npm install -g pm2

# Start using the ecosystem config
pm2 start ecosystem.config.cjs

# Auto-restart on server reboot
pm2 save
pm2 startup
```

Common PM2 commands:

```bash
pm2 status          # Check running processes
pm2 logs ngaji      # Tail logs
pm2 restart ngaji   # Restart
pm2 stop ngaji      # Stop
```

### Nginx (reverse proxy)

A sample config is provided in `nginx.conf.example`. Copy and adapt it:

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/ngaji
# Edit: replace your-domain.com, adjust PORT if needed
sudo ln -s /etc/nginx/sites-available/ngaji /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

The config handles HTTP → HTTPS redirect, SSL termination, and proxying to the Node.js app on `PORT`.

### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t tilawah-tracker .
docker run -d -p 3000:3000 --env-file .env -v $(pwd)/data:/app/data tilawah-tracker
```

> Mount the `data/` directory as a volume so the SQLite database persists across container restarts.

## User Roles

| Role | Description |
|---|---|
| `pending` | Newly registered; can only see the waiting page |
| `member` | Approved; can log progress and view the leaderboard |
| `admin` | Can approve/reject users and manage roles |

The **first user** to sign in is automatically granted the `admin` role.

## Project Structure

```
src/
├── index.tsx           # Entry point, route mounting
├── types.ts            # Shared TypeScript types
├── data/
│   └── quran-meta.ts   # Static data: 114 surahs, 30 juz boundaries
├── db/
│   ├── connection.ts   # SQLite connection
│   └── schema.ts       # Table definitions & initialization
├── lib/
│   ├── session.ts      # Session management
│   └── progress-calc.ts# Juz/ayah progress calculations
├── middleware/
│   └── auth.ts         # authMiddleware, memberMiddleware, adminMiddleware
├── routes/
│   ├── auth.ts         # Google OAuth flow & logout
│   ├── dashboard.tsx   # Personal stats page
│   ├── leaderboard.tsx # Community rankings
│   ├── progress.tsx    # Log & view memorization progress
│   └── admin.tsx       # User management
└── views/
    ├── Layout.tsx      # Base HTML layout with Tailwind config
    ├── components/     # Shared UI components
    └── pages/          # Full page components
data/
└── ngaji.db            # SQLite database (auto-created)
```

## Database Schema

- **`users`** — Google profile, role, timestamps
- **`sessions`** — session tokens with expiry (7-day TTL)
- **`progress_entries`** — latest `last_ayah` per user per surah (upserted on update)
- **`progress_log`** — append-only history of every progress change
