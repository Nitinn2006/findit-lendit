# FindIt LendIt

A campus resource-sharing platform for reporting lost & found items, borrowing and lending between students, and coordinating handoffs through built-in chat.

## Features
- Lost & Found with automatic matching and secret-question ownership verification
- Borrow & Lend listings with request/accept/return lifecycle
- Real-time-ish notifications and student-to-student messaging
- Star ratings for trust after successful returns
- Admin moderation dashboard

## Tech Stack
Next.js · React 19 · Drizzle ORM · PostgreSQL (Supabase) · Tailwind CSS · Framer Motion

## Getting Started
1. Clone the repo
2. `npm install`
3. Add a `.env.local` with `DATABASE_URL` pointing to your Postgres instance
4. `npx drizzle-kit push` to sync the schema
5. `npm run dev`
