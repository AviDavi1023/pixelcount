## PixelCount Project Overview

**Project**: Social Timer Platform - A web app for creating, customizing, and sharing visual countdowns/timers.

**Tech Stack**: 
- Frontend: Next.js 16, React, TypeScript, Tailwind CSS
- Backend: Next.js API Routes, NextAuth.js
- Database: PostgreSQL with Prisma 7 ORM
- Adapter: @prisma/adapter-pg
- Deployment: Vercel

## Project Structure

```
pixelcount/
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts    # NextAuth.js configuration
│   ├── lib/
│   │   └── prisma.ts                      # Prisma client with PG adapter
│   ├── layout.tsx                         # Root layout with metadata
│   ├── providers.tsx                      # SessionProvider wrapper
│   ├── page.tsx                           # Home page
│   └── globals.css                        # Global styles
├── prisma/
│   ├── schema.prisma                      # Database schema
│   └── migrations/                        # Database migrations
├── src/
│   ├── generated/prisma/                  # Prisma generated client
│   └── lib/                               # Utility functions
├── .env                                   # Environment variables
├── prisma.config.ts                       # Prisma configuration
├── next.config.ts                         # Next.js configuration
├── tsconfig.json                          # TypeScript configuration
└── package.json                           # Dependencies
```

## Database Schema

The following models are defined in `prisma/schema.prisma`:

- **User** - User accounts with email and profile info
- **Account** - OAuth connections (for NextAuth)
- **Session** - Authentication sessions
- **Timer** - Timer/countdown configurations
  - timerMode: "countdown" or "timer"
  - fillMode: "random", "linear", or "solid"
  - Colors: startColor, endColor
  - Sharing: isPublic, shareToken
- **Like** - User likes on public timers

## Current Status

✅ **Completed:**
- Project scaffolded with Next.js 16 (App Router)
- Prisma 7 configured with PostgreSQL adapter
- NextAuth.js configured (basic email login)
- SessionProvider set up correctly
- Home page created with navigation
- Project builds successfully without errors
- Dev server running on http://localhost:3000

⏳ **Next Priority:**
1. Set up PostgreSQL database (local dev or Vercel Postgres)
2. Run `npx prisma migrate dev --name init` to create tables
3. Create Timer component (port from original HTML/Canvas version)
4. Build gallery page with timer grid
5. Implement timer creation/editor
6. Add user dashboard
7. Implement sharing and embed functionality

## Key Files to Know

- `app/lib/prisma.ts` - Prisma client initialization with PG adapter
- `app/api/auth/[...nextauth]/route.ts` - Authentication endpoints
- `prisma/schema.prisma` - Database schema definitions
- `app/providers.tsx` - Client-side providers wrapper
- `app/layout.tsx` - Root layout with metadata

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma migrations
npx prisma migrate dev --name <migration_name>

# Open Prisma Studio
npx prisma studio

# Generate Prisma client (already done)
npx prisma generate
```

## Environment Variables

Required in `.env`:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Random secret for NextAuth
- `NEXTAUTH_URL` - Application URL (http://localhost:3000 for dev)

## Important Notes

- Using Prisma 7 with new PrismaPg adapter for direct PostgreSQL connections
- SessionProvider is wrapped in a separate client component (`providers.tsx`)
- TypeScript strict mode enabled
- Tailwind CSS configured for styling
- App Router (not Pages Router)
- ESLint configured with Next.js rules

