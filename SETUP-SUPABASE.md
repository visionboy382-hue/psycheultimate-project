# Psyche v21 — activating Google + Email-OTP sign-in

The code is done. These are the **dashboard toggles** that make it work. No schema
changes — your `readings.user_id` and `user_readings` table already exist with
correct RLS, so sign-in just starts populating them.

Project ref: `mqinktymjwsonqesazub`

---

## 1. URL configuration (do this first — both flows need it)

Supabase → **Authentication → URL Configuration**

- **Site URL:** `https://psyche-open-app.netlify.app`
- **Redirect URLs:** add both
  - `https://psyche-open-app.netlify.app`
  - `http://localhost:*`  (so it still works when you test locally)

If the Site URL is wrong, Google sends users to the wrong place after sign-in.

---

## 2. Email OTP — make it a 6-digit CODE (not a magic link)

Supabase → **Authentication → Providers → Email**
- Make sure **Email** is enabled.

Supabase → **Authentication → Email Templates → "Magic Link"**
- The template must contain the token, e.g.:
  ```
  Your Psyche sign-in code is: {{ .Token }}
  ```
- If it only has `{{ .ConfirmationURL }}`, users get a link, not a code, and the
  6-digit screen in the app will have nothing to type. `{{ .Token }}` is the fix.

That's it — `signInWithOtp` + `verifyOtp` are already wired in the app.

---

## 3. Google OAuth

### a) Google Cloud Console (one-time)
1. console.cloud.google.com → create/select a project.
2. **APIs & Services → Credentials → Create Credentials → OAuth client ID.**
3. Application type: **Web application**.
4. **Authorized redirect URIs** — add exactly:
   ```
   https://mqinktymjwsonqesazub.supabase.co/auth/v1/callback
   ```
5. Create → copy the **Client ID** and **Client Secret**.
6. (If prompted) configure the OAuth consent screen — "External", add your email
   as a test user so you can sign in before it's verified.

### b) Supabase
Supabase → **Authentication → Providers → Google**
- Enable it.
- Paste the **Client ID** and **Client Secret** from step a.
- Save.

Done. The "Continue with Google" button now redirects to Google and back.

---

## What did NOT change
- No SQL to run. `schema.sql` already had `user_id` + `user_readings` + RLS for
  both `anon` and `authenticated`. Anonymous readings, share links, and rarity
  stats keep working exactly as before — sign-in is purely additive.

## Quick test checklist
- [ ] Open the app → Settings → "Email me a sign-in code" → receive 6 digits → verify → "Signed in"
- [ ] Settings → "Continue with Google" → Google screen → returns signed in
- [ ] Take a reading while signed in → reload on another device signed in as same account → reading is there
- [ ] Sign out → anonymous reading + share link still works
