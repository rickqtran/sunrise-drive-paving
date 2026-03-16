# 🚧 Pave Sunrise Drive — Deployment Guide
### Go from files → live website in ~20 minutes, for free

---

## Architecture Overview

```
Your React App (Vite)
     │
     ├── Hosted on: Vercel (free)
     │   └── URL: yoursite.vercel.app
     │
     └── Database: Supabase (free)
         ├── pledges table (funding tracker)
         └── messages table (community board)
```

**Total monthly cost: $0** (Vercel free tier + Supabase free tier)

---

## STEP 1 — Install Node.js (if not already installed)

1. Go to https://nodejs.org
2. Download and install the **LTS** version
3. Verify: open Terminal and run `node --version`

---

## STEP 2 — Set Up Supabase (your free database)

Supabase gives you a hosted PostgreSQL database with a real-time API.

1. **Create account**: Go to https://supabase.com → "Start your project" → sign up with GitHub or email
2. **New project**: Click "New project" → name it `sunrise-drive` → pick a strong database password → choose **US West** region → click "Create new project" (takes ~2 min)
3. **Run the schema**:
   - In your Supabase dashboard, go to **SQL Editor** → **New query**
   - Copy the entire contents of `supabase-schema.sql` (in this folder)
   - Paste it and click **Run**
   - You should see "Success. No rows returned"
4. **Get your API keys**:
   - Go to **Project Settings** (gear icon) → **API**
   - Copy your **Project URL** (looks like `https://abcdef.supabase.co`)
   - Copy your **anon public** key (long string starting with `eyJ...`)

---

## STEP 3 — Configure Environment Variables

1. In the `sunrise-drive-paving` folder, copy `.env.example` to `.env`:
   ```
   cp .env.example .env
   ```
2. Open `.env` and fill in your Supabase values:
   ```
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...your_anon_key...
   ```

---

## STEP 4 — Test Locally

Open Terminal in the `sunrise-drive-paving` folder and run:

```bash
npm install
npm run dev
```

Visit http://localhost:5173 — your site should be live locally!

- Try submitting a pledge and see it appear in the tracker
- Try posting a community board message
- Confirm it shows up in your Supabase dashboard → Table Editor → pledges

---

## STEP 5 — Push to GitHub

Vercel deploys directly from GitHub, so you need to push your code there.

1. **Create GitHub account** (if needed): https://github.com
2. **Create a new repository**:
   - Go to https://github.com/new
   - Name: `sunrise-drive-paving`
   - Keep it **Public** or **Private** (either works)
   - Click "Create repository"
3. **Push your code** (run in the `sunrise-drive-paving` folder):
   ```bash
   git init
   git add .
   git commit -m "Initial commit — Pave Sunrise Drive website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/sunrise-drive-paving.git
   git push -u origin main
   ```

> ⚠️ Note: `.gitignore` already excludes your `.env` file so your keys won't be exposed.

---

## STEP 6 — Deploy to Vercel (go live!)

1. **Create Vercel account**: Go to https://vercel.com → "Sign up" → **Continue with GitHub**
2. **Import your project**:
   - Click "Add New..." → "Project"
   - Find `sunrise-drive-paving` and click **Import**
   - Framework preset should auto-detect as **Vite** ✓
3. **Add environment variables** (CRITICAL — Vercel needs your Supabase keys):
   - Under "Environment Variables", add:
     - `VITE_SUPABASE_URL` → paste your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` → paste your anon key
4. Click **Deploy** → wait ~60 seconds

🎉 **Your site is live!** Vercel gives you a URL like:
```
https://sunrise-drive-paving.vercel.app
```

---

## STEP 7 — Share with Neighbors!

Send your neighbors this link. The site works on mobile too — they can:
- View the funding progress
- Submit a pledge
- Post to the community board

---

## Optional: Custom Email Address

Set up a free email at your domain via Resend.com or Zoho Mail.
Update the contact email in `src/components/Footer.jsx`.

---

## Customization Checklist

- [ ] Replace placeholder Unsplash photos in `PhotoGallery.jsx` with real road photos
- [ ] Update the `$80,000` funding goal in `FundingTracker.jsx` (line with `const GOAL = 80000`)
- [ ] Update contact email in `Footer.jsx`
- [ ] After deploying, update the site URL in any emails to neighbors

---

## Making Updates Later

After changing any code:
```bash
git add .
git commit -m "Updated funding goal"
git push
```
Vercel automatically redeploys within ~30 seconds!

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Pledges/messages not saving | Double-check your `.env` Supabase keys |
| Build fails on Vercel | Make sure env vars are set in Vercel dashboard |
| "Row Level Security" errors | Re-run the full `supabase-schema.sql` |
| Site shows demo data | Supabase isn't connected yet — check env vars |

---

*Pave Sunrise Drive — Laveen, AZ community project.*
