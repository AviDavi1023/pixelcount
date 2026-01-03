# PixelCount - Social Timer Platform

A modern web application for creating, customizing, and sharing visual countdowns and timers with pixel-filling animations.

## Features

- **Create Timers & Countdowns** - Build custom timers without needing an account
- **Authentication** - Sign up to save, publish, and share timers
- **Gallery** - Browse publicly shared timers with search and sorting
- **Customization** - Choose from multiple fill patterns (random, linear, solid) and custom color gradients
- **Sharing** - Share timers via links, embed on websites, or share on social media
- **Responsive** - Works on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, NextAuth.js
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel

## Environment Variables

Create a `.env.local` file with:

```
DATABASE_URL="postgresql://user:password@localhost:5432/pixelcount?schema=public"
NEXTAUTH_SECRET="your-random-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
  ├── api/auth/[...nextauth]/       # Authentication routes
  ├── (pages)/
  │   ├── gallery/                   # Public timer gallery
  │   ├── create/                    # Timer creation
  │   ├── dashboard/                 # User dashboard
  │   ├── timer/[shareToken]/        # Shared timer view
  │   └── login/                     # Login page
  ├── layout.tsx                     # Root layout with SessionProvider
  └── page.tsx                       # Home page

src/
  ├── lib/
  │   └── prisma.ts                  # Prisma client
  └── components/                    # Reusable components
    ├── Timer.tsx                    # Timer visualization
    ├── TimerForm.tsx                # Timer creation form
    └── ...

prisma/
  └── schema.prisma                  # Database schema
```

## Database Schema

- **User** - User accounts and metadata
- **Account** - OAuth account connections
- **Session** - Auth sessions
- **Timer** - Timer/countdown configurations and metadata
- **Like** - User likes on public timers

## Database Migrations

```bash
# Create a new migration
npx prisma migrate dev --name <migration_name>

# Push schema to database
npx prisma db push

# Open Prisma Studio
npx prisma studio
```

## Build for Production

```bash
npm run build
npm start
```

## Planned Features

- [ ] OAuth authentication (GitHub, Google)
- [ ] Timer statistics and analytics
- [ ] Comments and discussions
- [ ] Collaborative timer creation
- [ ] Advanced embed customization
- [ ] Timer templates and presets

## License

MIT

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
