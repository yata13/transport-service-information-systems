-- ====================================================================
-- GONDAR TRAFFIC - SHARED REAL-TIME BACKEND (App + ERP Website)
-- Self-contained: creates any missing base table, so it works on a fresh
-- project or one where only part of the old schema was run.
-- Safe to run more than once. Paste the WHOLE file and click Run.
--
-- What this does:
--   1. Adds an `inspections` log (every roadside check from the phone app)
--   2. Lets the website register vehicles, update reports and manage officers
--   3. Moves login into a secure RPC and hashes passwords (bcrypt)
--   4. Hides password hashes from the public API
--   5. Turns on Supabase Realtime for vehicles, reports and inspections
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- --------------------------------------------------------------------
-- 0. Base tables (skipped if they already exist)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bajaj_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    digital_id TEXT NOT NULL UNIQUE,
    plate_number TEXT NOT NULL UNIQUE,
    vin_chassis TEXT NOT NULL UNIQUE,
    vehicle_type TEXT NOT NULL DEFAULT 'Bajaj (ባጃጅ)',
    bajaj_model TEXT NOT NULL,
    bajaj_association TEXT NOT NULL,
    color TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    owner_phone TEXT,
    driver_name TEXT NOT NULL,
    driver_phone TEXT,
    driver_photo TEXT,
    kebele TEXT DEFAULT 'ቀበሌ 03 (Kebele 03)',
    address TEXT DEFAULT 'አራዳ መንገድ፣ ጎንደር',
    permit_number TEXT NOT NULL UNIQUE,
    issue_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    authorized_area TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'SUSPENDED', 'ILLEGAL', 'MISMATCH')),
    is_blacklisted BOOLEAN DEFAULT FALSE,
    blacklist_reason TEXT,
    notes TEXT,
    qr_code_value TEXT,
    registered_city TEXT DEFAULT 'Gondar / ጎንደር',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.officers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    badge_number TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'Field Traffic Inspector',
    phone_number TEXT,
    assigned_zone TEXT DEFAULT 'Gondar City',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.violation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_number TEXT NOT NULL UNIQUE,
    digital_id TEXT NOT NULL,
    vehicle_plate TEXT NOT NULL,
    registered_plate TEXT,
    reason TEXT NOT NULL,
    reason_am TEXT NOT NULL,
    action_taken TEXT NOT NULL,
    fine_amount NUMERIC DEFAULT 0,
    checked_on TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    checked_by TEXT NOT NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'PAID', 'IMPOUNDED', 'RESOLVED')),
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Older versions of the vehicles table may lack columns the apps use.
ALTER TABLE public.bajaj_vehicles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.violation_reports ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

ALTER TABLE public.bajaj_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.officers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violation_reports ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE ON public.bajaj_vehicles, public.violation_reports TO anon, authenticated;

DROP POLICY IF EXISTS "Allow public read access to vehicles" ON public.bajaj_vehicles;
CREATE POLICY "Allow public read access to vehicles"
ON public.bajaj_vehicles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public update to vehicles" ON public.bajaj_vehicles;
CREATE POLICY "Allow public update to vehicles"
ON public.bajaj_vehicles FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public read access to officers" ON public.officers;
CREATE POLICY "Allow public read access to officers"
ON public.officers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read access to violation reports" ON public.violation_reports;
CREATE POLICY "Allow public read access to violation reports"
ON public.violation_reports FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to violation reports" ON public.violation_reports;
CREATE POLICY "Allow public insert to violation reports"
ON public.violation_reports FOR INSERT WITH CHECK (true);

-- Starter officers (only if missing). Passwords get hashed in step 3 below.
INSERT INTO public.officers (username, password_hash, full_name, badge_number, role, phone_number, assigned_zone) VALUES
('inspector_abebe', 'gondar2025', 'ኢንስፔክተር አበበ ተሰማ', 'GD-TRF-042', 'Field Traffic Inspector', '+251 91 812 3456', 'ዞን 1: አራዳ - ፒያሳ - ፋሲል'),
('inspector_selemon', 'gondar2025', 'ረዳት ኢንስፔክተር ሰለሞን አለሙ', 'GD-TRF-019', 'Checkpoint Lead', '+251 92 114 9988', 'ዞን 2: ፒያሳ - አዘዞ - ኤርፖርት')
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------------------
-- 1. Inspections log (feeds "Today's inspections" on the dashboard)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    digital_id TEXT,
    plate_checked TEXT,
    registered_plate TEXT,
    result TEXT NOT NULL CHECK (result IN ('VALID', 'EXPIRED', 'SUSPENDED', 'MISMATCH', 'NOT_FOUND')),
    officer_name TEXT NOT NULL,
    badge_number TEXT,
    location TEXT,
    source TEXT NOT NULL DEFAULT 'mobile' CHECK (source IN ('mobile', 'web')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inspections_created_at_idx ON public.inspections (created_at DESC);
CREATE INDEX IF NOT EXISTS violation_reports_created_at_idx ON public.violation_reports (created_at DESC);

ALTER TABLE public.inspections ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.inspections TO anon, authenticated;

DROP POLICY IF EXISTS "Allow public read access to inspections" ON public.inspections;
CREATE POLICY "Allow public read access to inspections"
ON public.inspections FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert to inspections" ON public.inspections;
CREATE POLICY "Allow public insert to inspections"
ON public.inspections FOR INSERT WITH CHECK (true);

-- --------------------------------------------------------------------
-- 2. Write access the ERP website needs
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public insert to vehicles" ON public.bajaj_vehicles;
CREATE POLICY "Allow public insert to vehicles"
ON public.bajaj_vehicles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to violation reports" ON public.violation_reports;
CREATE POLICY "Allow public update to violation reports"
ON public.violation_reports FOR UPDATE USING (true);

-- Officers are written only through the SECURITY DEFINER functions below.

-- --------------------------------------------------------------------
-- 3. Hash any plain-text passwords that are still stored
-- --------------------------------------------------------------------
UPDATE public.officers
SET password_hash = extensions.crypt(password_hash, extensions.gen_salt('bf'))
WHERE password_hash NOT LIKE '$2%';

-- --------------------------------------------------------------------
-- 4. Hide password_hash from the public API (column-level grants)
-- --------------------------------------------------------------------
REVOKE SELECT ON public.officers FROM anon, authenticated;
GRANT SELECT (id, username, full_name, badge_number, role, phone_number, assigned_zone, is_active, created_at)
ON public.officers TO anon, authenticated;

-- --------------------------------------------------------------------
-- 5. Login RPC: checks the bcrypt hash server-side, never returns it
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.login_officer(p_username TEXT, p_password TEXT)
RETURNS TABLE (
    id UUID,
    username TEXT,
    full_name TEXT,
    badge_number TEXT,
    role TEXT,
    phone_number TEXT,
    assigned_zone TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    SELECT o.id, o.username, o.full_name, o.badge_number, o.role, o.phone_number, o.assigned_zone
    FROM public.officers o
    WHERE lower(o.username) = lower(trim(p_username))
      AND o.is_active
      AND o.password_hash = extensions.crypt(p_password, o.password_hash)
    LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.login_officer(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_officer(TEXT, TEXT) TO anon, authenticated;

-- --------------------------------------------------------------------
-- 6. Officer management RPCs used by the website "Officers" page
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_officer(
    p_username TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_badge_number TEXT,
    p_role TEXT,
    p_phone_number TEXT,
    p_assigned_zone TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    new_id UUID;
BEGIN
    IF length(coalesce(p_password, '')) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters';
    END IF;

    INSERT INTO public.officers (username, password_hash, full_name, badge_number, role, phone_number, assigned_zone)
    VALUES (
        lower(trim(p_username)),
        extensions.crypt(p_password, extensions.gen_salt('bf')),
        trim(p_full_name),
        upper(trim(p_badge_number)),
        coalesce(nullif(trim(p_role), ''), 'Field Traffic Inspector'),
        nullif(trim(p_phone_number), ''),
        coalesce(nullif(trim(p_assigned_zone), ''), 'Gondar City')
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_officer(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_officer(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_officer_active(p_id UUID, p_active BOOLEAN)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.officers SET is_active = p_active WHERE id = p_id;
$$;

REVOKE ALL ON FUNCTION public.set_officer_active(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_officer_active(UUID, BOOLEAN) TO anon, authenticated;

-- --------------------------------------------------------------------
-- 7. Realtime: push every change to the app and the website instantly
--    (officers is deliberately NOT published so password hashes never
--     travel over the realtime socket)
-- --------------------------------------------------------------------
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['bajaj_vehicles', 'violation_reports', 'inspections'] LOOP
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables
            WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
        ) THEN
            EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
        END IF;
    END LOOP;
END $$;
