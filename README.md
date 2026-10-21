# TaskFlow

Multi-tenant project management SaaS (Trello-style kanban) with team roles and subscription billing.

**Live demo:** https://taskflow-phi-sooty.vercel.app/ · **API:** https://taskflow-api-apjo.onrender.com/

> Free hosting: the API sleeps when idle, so the first request can take up to a minute.

**Demo accounts** (password for all: `Demo1234!`)

| Email | Role |
|---|---|
| demo-owner@taskflow.demo | Owner (can open Billing) |
| demo-admin@taskflow.demo | Admin |
| demo-member@taskflow.demo | Member |

Billing runs in Stripe **test mode**. Use card `4242 4242 4242 4242`, any future date, any CVC.

![alt text](21-10-2026-17-42-41.png)

## Features

- **Auth:** registration with email verification, 15-minute JWT access tokens, single-use refresh tokens (rotated, stored hashed, sent as an `httpOnly` cookie)
- **Organizations and roles:** Owner / Admin / Member, enforced on the server; invite links bound to the invited email
- **Projects and tasks:** kanban board with drag-and-drop (order updates run in a DB transaction), multiple assignees, per-project labels, soft delete
- **Billing:** Stripe Checkout subscriptions (Free / Pro / Enterprise), Customer Portal, webhooks keep the plan in sync, member limit per plan

## Engineering decisions

- **Tenant isolation:** every project and task lookup is scoped to its organization; other tenants' resources return `404`. The tests that cover this were written first and failed, exposing real access-control bugs that were then fixed
- **Server-side authorization:** hiding buttons in the UI is only UX; every route checks role and membership
- **Auth hygiene:** bcrypt hashing, identical error for unknown email and wrong password, refresh token rotation
- **Webhooks:** Stripe signature verification; events from stale subscriptions are ignored
- **Quality gate:** 25 integration tests (Jest + Supertest) against a real PostgreSQL; GitHub Actions runs type-check, migrations, tests and the frontend build on every push

## Tech stack

Node.js, Express 5, TypeScript, Prisma, PostgreSQL (Neon) · React, TypeScript, Vite, Tailwind CSS, dnd-kit · Stripe · Render, Vercel · GitHub Actions

## Run locally

```bash
# backend
npm install
# create .env with DATABASE_URL, JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
# STRIPE_PRICE_PRO, STRIPE_PRICE_ENTERPRISE
npx prisma migrate dev
npm run seed      # optional demo data
npm run dev

# frontend
cd frontend
# create .env with VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

Tests: create `.env.test` pointing at a separate test database, then `npm run db:test:migrate && npm test`.

## Known limitations

- No email provider yet: in production new accounts cannot verify their email, so use the demo accounts. Invite links are shown in the Settings page instead of being emailed
- Frontend and API are on different domains, so Safari and private windows block the refresh cookie and you are asked to log in again after 15 minutes
- Production migrations are run manually