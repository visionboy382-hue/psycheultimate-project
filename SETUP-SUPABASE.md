# Psyche v21 — fresh Supabase project + Google/OTP sign-in

You're standing up a **new** Supabase project. Order matters: provision the DB,
then config.js, then auth providers, then deploy. The app's schema already
expects all of this — no code changes needed, only setup.

---

## Step 1 — Create the project + database

1. supabase.com → **New project**. Pick a name + region (closest to your users).
   Save the database password somewhere; you rarely need it again.
2. When it's ready: **Project Settings → API**. Copy two things:
   - **Project URL**  →  `https://<NEW-REF>.supabase.co`
   - **anon / publishable key**
3. **SQL Editor → New query** → paste all of `supabase/schema.sql` → **Run**.
   (Creates `readings`, `user_readings`, the `get_stats` function, and all RLS
   policies for both `anon` and `authenticated`.)
4. **SQL Editor → New query** → paste all of `supabase/seed.sql` → **Run**.
   This populates the readings table so rarity/percentile stats are meaningful
   immediately instead of empty. Skip only if you want stats to start at zero.

## Step 2 — Point the app at the new project

Open `config.js`, paste your two values from Step 1:
```js
window.PSYCHE_CONFIG = {
  SUPABASE_URL: "https://<NEW-REF>.supabase.co",
  SUPABASE_ANON_KEY: "<your-new-anon-key>"
};
```
Until this is done the app runs offline (Cloud · off).

## Step 3 — URL configuration

Supabase → **Authentication → URL Configuration**
- **Site URL:** `https://psyche-open-app.netlify.app`
- **Redirect URLs:** add `https://psyche-open-app.netlify.app` and `http://localhost:*`

## Step 4 — Email OTP as a 6-digit CODE (not a link)

Supabase → **Authentication → Providers → Email** → ensure Email is enabled.
Supabase → **Authentication → Email Templates → "Magic Link"** → the body must
contain the token, e.g.:
```
Your Psyche sign-in code is: {{ .Token }}
```
If it only has `{{ .ConfirmationURL }}`, users get a link and the 6-digit screen
has nothing to type. `signInWithOtp` + `verifyOtp` are already wired in the app.

## Step 5 — Google OAuth

**Google Cloud Console** (console.cloud.google.com):
1. Create/select a project → **APIs & Services → Credentials → Create
   Credentials → OAuth client ID → Web application**.
2. **Authorized redirect URIs** — add exactly (use your NEW ref):
   ```
   https://<NEW-REF>.supabase.co/auth/v1/callback
   ```
3. Create → copy **Client ID** + **Client Secret**.
4. Configure the consent screen ("External") and add your email as a test user.

**Supabase → Authentication → Providers → Google** → enable → paste Client ID +
Secret → Save.

## Step 6 — Deploy + verify

Deploy the files to Netlify (method-dependent — see chat). Then hard-refresh so
the service worker swaps v20→v21 and self-purges the old cache.

### Test checklist
- [ ] Header reads **v21**
- [ ] Settings → "Email me a sign-in code" → 6 digits arrive → verify → "Signed in"
- [ ] Settings → "Continue with Google" → returns signed in
- [ ] Reading made while signed in shows up after signing in on another device
- [ ] Signed out: anonymous reading + share link still work
- [ ] A reading's rarity stat shows a real % (confirms seed.sql ran)
