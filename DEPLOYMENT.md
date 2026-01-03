# Vercel Deployment Guide for PixelCount

## Quick Deployment Steps

### 1. Prepare Your Environment Variables

Before deploying, gather these values from your Supabase project:

**From Supabase Dashboard** (Settings → Database → Connection string):
- **Pooled Connection** (use this for production): `POSTGRES_PRISMA_URL`
  - Format: `postgresql://postgres.[ref]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true`

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 2. Push to GitHub

Your code is already pushed to: `https://github.com/AviDavi1023/pixelcount`

Verify with:
```bash
git remote -v
git log --oneline -1
```

### 3. Deploy to Vercel

1. **Go to Vercel Dashboard**:
   - Visit [vercel.com/new](https://vercel.com/new)
   - Click "Import Project"

2. **Import from GitHub**:
   - Select "Continue with GitHub"
   - Find and select `AviDavi1023/pixelcount`
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `next build` (default)
   - **Output Directory**: `.next` (default)

4. **Add Environment Variables** (in Vercel):
   Click "Environment Variables" and add:

   ```
   Name: DATABASE_URL
   Value: postgresql://postgres.[ref]:[password]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   
   Name: NEXTAUTH_SECRET
   Value: [your generated secret]
   
   Name: NEXTAUTH_URL
   Value: https://pixelcount.vercel.app (or your custom domain)
   ```

   **Important Notes**:
   - Use the **pooled connection URL** (port 6543) for production
   - Make sure `pgbouncer=true` is in the URL
   - Set environment variables for "Production", "Preview", and "Development"

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Visit your deployed site!

### 4. Post-Deployment

**Test Your Deployment**:
- ✅ Visit the home page
- ✅ Create a timer (works without login)
- ✅ Sign up for an account
- ✅ View gallery
- ✅ Access dashboard

**Auto-Deploy on Push**:
Every push to `main` branch will automatically trigger a new deployment.

### Troubleshooting

#### Build Fails: "Cannot connect to database"
- Verify `DATABASE_URL` is the **pooled connection** (port 6543)
- Check if Supabase project is active
- Ensure password has no special characters that need URL encoding

#### Build Fails: "Prisma Client not found"
This shouldn't happen with Prisma 7, but if it does:
- Add build command: `npx prisma generate && next build`

#### Runtime Error: "Invalid session"
- Check `NEXTAUTH_URL` matches your production domain exactly
- Ensure `NEXTAUTH_SECRET` is set and not exposed in git
- Verify environment variables are applied to "Production" environment

#### 500 Error on Auth Routes
- Go to Vercel Logs (Deployment → Runtime Logs)
- Look for specific error messages
- Common fix: regenerate and update `NEXTAUTH_SECRET`

### Custom Domain (Optional)

1. Go to Vercel Project Settings → Domains
2. Add your domain (e.g., `pixelcount.com`)
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` environment variable to use new domain
5. Redeploy

### Database Migrations on Vercel

Vercel doesn't run migrations automatically. For schema changes:

1. **Run migrations locally** with direct connection:
```bash
# .env.local
DATABASE_URL="[POSTGRES_URL_NON_POOLING - port 5432]"
npx prisma migrate dev
```

2. **Push changes to GitHub**:
```bash
git add prisma/migrations
git commit -m "Add database migration"
git push
```

3. **Migration runs automatically** during Vercel build via `prisma generate`

### Monitoring

**Check App Health**:
- Vercel Dashboard → Analytics
- Vercel Dashboard → Logs
- Supabase Dashboard → Database → Query Performance

**Set up Alerts**:
- Vercel → Project Settings → Notifications
- Get notified about failed deployments

---

## Quick Reference

**GitHub Repo**: `https://github.com/AviDavi1023/pixelcount`
**Vercel Project**: Import from above repo
**Database**: Supabase PostgreSQL (pooled connection for prod)

**Production Environment Variables**:
```
DATABASE_URL=[pooled connection - port 6543]
NEXTAUTH_SECRET=[openssl generated]
NEXTAUTH_URL=[https://your-app.vercel.app]
```

---

Ready to deploy? Visit [vercel.com/new](https://vercel.com/new) and import your GitHub repo!
