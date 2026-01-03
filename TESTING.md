# Local Testing Guide

Quick checklist to verify everything works before deploying to production.

## Prerequisites
- ✅ Dev server running: `npm run dev`
- ✅ Database connected (Supabase)
- ✅ Environment variables set in `.env`

## Test Scenarios

### 1. Guest User Flow (No Authentication)
**Goal**: Verify users can create timers without signing up

1. Visit `http://localhost:3000`
2. Click "Create Timer"
3. Fill in the form:
   - Title: "Test Timer"
   - Mode: Countdown
   - Set end time to 5 minutes from now
   - Choose colors and fill pattern
4. Click "Create Timer"
5. Verify: Timer displays and animates correctly
6. Note: Timer is temporary (not saved to database)

**Expected**: Timer works, but shows message about signing in to save

---

### 2. User Registration & Login
**Goal**: Verify authentication works end-to-end

1. Visit `http://localhost:3000/login`
2. Toggle to "Sign Up"
3. Enter:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "password123"
4. Click "Create Account"
5. Verify: Auto-redirected to `/dashboard`
6. Check: Navbar shows "Dashboard" and "Sign Out"

**Expected**: User created, logged in, and redirected to dashboard

---

### 3. Create & Save Timer (Authenticated)
**Goal**: Verify logged-in users can save timers

1. Click "Create Timer" in nav
2. Fill in form:
   - Title: "My Saved Timer"
   - Description: "Testing database save"
   - Mode: Timer (duration 10 minutes)
   - Toggle "Make Public" ON
3. Click "Create Timer"
4. Verify: Redirected to timer view page
5. Check: Timer displays and URL has shareToken

**Expected**: Timer saved to database and accessible via unique URL

---

### 4. Dashboard Management
**Goal**: Verify users can manage their timers

1. Visit `http://localhost:3000/dashboard`
2. Verify: See stats (Total Timers, Views, Likes)
3. Find "My Saved Timer" in list
4. Test actions:
   - Click "View" → Opens timer page
   - Click "Make Private" → Updates status badge
   - Click "Delete" → Removes from list

**Expected**: All CRUD operations work correctly

---

### 5. Gallery & Search
**Goal**: Verify public timer discovery

1. Sign out (click "Sign Out")
2. Visit `http://localhost:3000/gallery`
3. Verify: See public timers
4. Test search: Type "Saved" in search box
5. Test sort: Change to "Most Viewed"
6. Click on a timer card
7. Verify: Opens timer view page

**Expected**: Only public timers shown, search/sort works

---

### 6. Timer Viewing & Sharing
**Goal**: Verify timer display and share features

1. Open any timer from gallery
2. Verify: PixelTimer animates correctly
3. Click "Customize" button
4. Change colors and fill mode
5. Verify: Changes apply in real-time (not saved)
6. Click "Share" button
7. Copy link and embed code
8. Open link in new incognito tab
9. Verify: Timer loads correctly

**Expected**: Timer displays, customization works, sharing works

---

## Common Issues & Fixes

### Issue: "Cannot connect to database"
**Fix**: Check `.env` has correct `DATABASE_URL`

### Issue: "Invalid credentials" when logging in
**Fix**: Make sure you registered first, or check password is correct

### Issue: Timer doesn't animate
**Fix**: 
- Check browser console for errors
- Verify end time is in the future
- Try refreshing the page

### Issue: Dashboard is empty
**Fix**: 
- Create a timer first while logged in
- Make sure timer has "Make Public" toggled if you want it in gallery

### Issue: Can't see timer in gallery
**Fix**: Timer must be:
- Created by authenticated user
- Set to "Public" (toggle on create form)
- Not expired (if countdown)

---

## Database Check (Optional)

If you want to verify database records directly:

```bash
# Open Prisma Studio
npx prisma studio
```

Visit `http://localhost:5555` to browse:
- **User** table: See registered users
- **Timer** table: See all created timers
- **Session** table: See active sessions

---

## Performance Check

### Page Load Speed
- Home: < 1s
- Gallery: < 2s (depends on # of timers)
- Timer View: < 1.5s
- Dashboard: < 2s (requires auth)

### Animation Smoothness
- Canvas should update at ~60 FPS
- No stuttering or lag
- Smooth color transitions

---

## Ready for Production?

If all test scenarios pass:
- ✅ Authentication works
- ✅ Timer CRUD operations work
- ✅ Gallery displays correctly
- ✅ Sharing works
- ✅ No console errors
- ✅ Database saves correctly

**You're ready to deploy to Vercel!**

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment steps.
