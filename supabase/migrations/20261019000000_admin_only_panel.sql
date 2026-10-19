-- ====================================================================
-- ADMIN-ONLY WEBSITE PANEL + REGISTRATION TIMES
-- Safe to run more than once. Paste the WHOLE file and click Run.
--
-- What this does:
--   1. Records when every officer was registered (created_at)
--   2. Adds an `is_admin` flag; only admins can sign in to the website
--   3. Admin sign-in returns a session token; every officer-management
--      action (add officer, enable/disable, change password) checks it
--      on the server, so the public API key alone cannot do them
--   4. Creates a first admin account if there is none:
--        username: admin    password: ChangeMe@2026
--      SIGN IN AND CHANGE THIS PASSWORD IMMEDIATELY.
--
-- The phone app keeps using login_officer, unchanged.
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- --------------------------------------------------------------------
-- 1. New officer columns
-- --------------------------------------------------------------------
ALTER TABLE public.officers ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.officers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE;

GRANT SELECT (id, username, full_name, badge_number, role, phone_number, assigned_zone, is_active, is_admin, created_at)
ON public.officers TO anon, authenticated;

-- --------------------------------------------------------------------
-- 2. First admin (only when no admin exists yet)
-- --------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.officers WHERE is_admin) THEN
        IF EXISTS (SELECT 1 FROM public.officers WHERE username = 'admin') THEN
            UPDATE public.officers SET is_admin = TRUE, is_active = TRUE WHERE username = 'admin';
        ELSE
            INSERT INTO public.officers (username, password_hash, full_name, badge_number, role, assigned_zone, is_admin)
            VALUES (
                'admin',
                extensions.crypt('ChangeMe@2026', extensions.gen_salt('bf')),
                'System Administrator',
                'GD-ADMIN-001',
                'Administrator',
                'ዋና መምሪያ (Headquarters)',
                TRUE
            );
        END IF;
    END IF;
END $$;

-- --------------------------------------------------------------------
-- 3. Admin sessions (never readable through the public API)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    token_hash TEXT PRIMARY KEY,
    officer_id UUID NOT NULL REFERENCES public.officers (id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_sessions FROM anon, authenticated;

-- Returns the admin's id for a live session token, or raises.
CREATE OR REPLACE FUNCTION public.require_admin(p_token TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    admin_id UUID;
BEGIN
    SELECT o.id INTO admin_id
    FROM public.admin_sessions s
    JOIN public.officers o ON o.id = s.officer_id
    WHERE s.token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex')
      AND s.expires_at > now()
      AND o.is_admin
      AND o.is_active;

    IF admin_id IS NULL THEN
        RAISE EXCEPTION 'Admin session expired or not authorized' USING ERRCODE = '42501';
    END IF;
    RETURN admin_id;
END;
$$;

REVOKE ALL ON FUNCTION public.require_admin(TEXT) FROM PUBLIC, anon, authenticated;

-- --------------------------------------------------------------------
-- 4. Admin sign-in / session check / sign-out
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.login_admin(p_username TEXT, p_password TEXT)
RETURNS TABLE (token TEXT, full_name TEXT, badge_number TEXT, role TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    o public.officers%ROWTYPE;
    new_token TEXT;
BEGIN
    SELECT * INTO o
    FROM public.officers x
    WHERE lower(x.username) = lower(trim(p_username))
      AND x.is_active
      AND x.is_admin
      AND x.password_hash = extensions.crypt(p_password, x.password_hash)
    LIMIT 1;

    IF o.id IS NULL THEN
        RETURN;
    END IF;

    DELETE FROM public.admin_sessions WHERE expires_at <= now();

    new_token := encode(extensions.gen_random_bytes(32), 'hex');
    INSERT INTO public.admin_sessions (token_hash, officer_id, expires_at)
    VALUES (encode(extensions.digest(new_token, 'sha256'), 'hex'), o.id, now() + interval '12 hours');

    RETURN QUERY SELECT new_token, o.full_name, o.badge_number, o.role;
END;
$$;

REVOKE ALL ON FUNCTION public.login_admin(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.login_admin(TEXT, TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.check_admin_session(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    PERFORM public.require_admin(p_token);
    RETURN TRUE;
EXCEPTION WHEN insufficient_privilege THEN
    RETURN FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_admin_session(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_admin_session(TEXT) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.logout_admin(p_token TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
    DELETE FROM public.admin_sessions
    WHERE token_hash = encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
$$;

REVOKE ALL ON FUNCTION public.logout_admin(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.logout_admin(TEXT) TO anon, authenticated;

-- --------------------------------------------------------------------
-- 5. Officer management: admin token required
--    (the old token-less versions are removed so they cannot be called)
-- --------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.create_officer(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.set_officer_active(UUID, BOOLEAN);

CREATE OR REPLACE FUNCTION public.create_officer(
    p_token TEXT,
    p_username TEXT,
    p_password TEXT,
    p_full_name TEXT,
    p_badge_number TEXT,
    p_role TEXT,
    p_phone_number TEXT,
    p_assigned_zone TEXT,
    p_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    new_id UUID;
BEGIN
    PERFORM public.require_admin(p_token);

    IF length(coalesce(p_password, '')) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters';
    END IF;

    INSERT INTO public.officers (username, password_hash, full_name, badge_number, role, phone_number, assigned_zone, is_admin)
    VALUES (
        lower(trim(p_username)),
        extensions.crypt(p_password, extensions.gen_salt('bf')),
        trim(p_full_name),
        upper(trim(p_badge_number)),
        coalesce(nullif(trim(p_role), ''), 'Field Traffic Inspector'),
        nullif(trim(p_phone_number), ''),
        coalesce(nullif(trim(p_assigned_zone), ''), 'Gondar City'),
        coalesce(p_is_admin, FALSE)
    )
    RETURNING id INTO new_id;

    RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.create_officer(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_officer(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.set_officer_active(p_token TEXT, p_id UUID, p_active BOOLEAN)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
BEGIN
    IF public.require_admin(p_token) = p_id AND NOT p_active THEN
        RAISE EXCEPTION 'You cannot disable your own account';
    END IF;

    UPDATE public.officers SET is_active = p_active WHERE id = p_id;
    IF NOT p_active THEN
        DELETE FROM public.admin_sessions WHERE officer_id = p_id;
    END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.set_officer_active(TEXT, UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_officer_active(TEXT, UUID, BOOLEAN) TO anon, authenticated;

-- Only an admin can set a password, for any officer (themselves included).
CREATE OR REPLACE FUNCTION public.change_officer_password(p_token TEXT, p_id UUID, p_new_password TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
    admin_id UUID;
BEGIN
    admin_id := public.require_admin(p_token);

    IF length(coalesce(p_new_password, '')) < 6 THEN
        RAISE EXCEPTION 'Password must be at least 6 characters';
    END IF;

    UPDATE public.officers
    SET password_hash = extensions.crypt(p_new_password, extensions.gen_salt('bf'))
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Officer not found';
    END IF;

    -- Sign that officer out of every other website session.
    DELETE FROM public.admin_sessions
    WHERE officer_id = p_id
      AND token_hash <> encode(extensions.digest(coalesce(p_token, ''), 'sha256'), 'hex');
END;
$$;

REVOKE ALL ON FUNCTION public.change_officer_password(TEXT, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.change_officer_password(TEXT, UUID, TEXT) TO anon, authenticated;
