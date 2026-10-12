# Gondar Traffic Bajaj Control System

One system, two front-ends, **one shared database**:

| Part | Folder | Used by |
| --- | --- | --- |
| ERP website (React + Vite) | `src/`, `server.ts` | HQ / supervisors |
| Mobile app (Flutter) | `flutter_app/` | Officers on the road |
| Database (Supabase / PostgreSQL + Realtime) | `flutter_app/supabase_schema.sql`, `supabase/migrations/` | Both |

Everything an officer does on a phone (inspection, violation report) is written to Supabase
and appears on the ERP dashboard **instantly** through Supabase Realtime. Reports made on the
website appear on every phone the same way.

```
 Phone app ──┐                       ┌── ERP website (dashboard, reports, officers)
             ├──► Supabase (Postgres) ◄┤
 Phone app ──┘     + Realtime push    └── live updates, no refresh needed
```

## 1. Database setup (one time)

In the Supabase dashboard → **SQL Editor**, run these two files **in order**:

1. `flutter_app/supabase_schema.sql` – tables + starter data (skip if already done)
2. `supabase/migrations/20261012000000_shared_realtime_backend.sql` – **required**: inspections log,
   realtime, secure login, website write access

Both scripts are safe to run more than once.

> ⚠️ The starter officers use the password `gondar2025`. Change it after setup:
> ```sql
> UPDATE officers SET password_hash = extensions.crypt('NEW-PASSWORD', extensions.gen_salt('bf'))
> WHERE username = 'inspector_abebe';
> ```
> New officers can be added from the website: **Officers & Workforce → Add Officer**.

## 2. Website

```bash
bun install          # or: npm install
bun run dev          # http://localhost:3000
bun run build && bun run start   # production
```

It connects to the same Supabase project as the app by default. To use another project,
copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`.

The top bar shows the live connection state:
**Live Sync** (realtime) · **Synced · auto-refresh** (realtime blocked by network, refreshes every minute) · **Offline**.

## 3. Mobile app

See `flutter_app/FLUTTER_INSTALL_GUIDE.md`. Short version:

```bash
cd flutter_app
flutter pub get
flutter run                  # or: flutter build apk --release
```

If the phone has no network, reports and inspections are stored on the phone and uploaded
automatically when the connection returns (shown as "Not synced yet" in the history list).

## CI

`.github/workflows/ci.yml` runs on every push:
- website: typecheck + production build
- mobile: `flutter analyze` + `flutter test`
- database: applies the schema and migrations to a real PostgreSQL (twice) and checks login,
  permissions and realtime settings

## Security notes

- Passwords are stored as bcrypt hashes and checked inside the database (`login_officer` RPC);
  the hash is never readable through the public API.
- The publishable key in the code is meant to be public; access is controlled by Row Level Security.
- Current RLS still allows anyone holding the app's key to insert vehicles/reports. The next
  hardening step is moving officers to **Supabase Auth** and restricting writes to signed-in users.
