-- Behaviour checks for the shared backend, run as the public (anon) role.
SET ROLE anon;

DO $$
BEGIN
  IF (SELECT count(*) FROM public.login_officer('inspector_abebe', 'gondar2025')) <> 1 THEN
    RAISE EXCEPTION 'login with the right password must succeed';
  END IF;
  IF (SELECT count(*) FROM public.login_officer('inspector_abebe', 'wrong-password')) <> 0 THEN
    RAISE EXCEPTION 'login with a wrong password must fail';
  END IF;
END $$;

INSERT INTO public.inspections (result, officer_name, source) VALUES ('VALID', 'CI Officer', 'mobile');
INSERT INTO public.violation_reports (report_number, digital_id, vehicle_plate, reason, reason_am, action_taken, checked_by, location)
VALUES ('RPT-GD-CI-000001', 'DID-CI', '3-AM-CI', 'r', 'r', 'a', 'CI Officer', 'CI');
UPDATE public.violation_reports SET status = 'PAID' WHERE report_number = 'RPT-GD-CI-000001';

-- Password hashes must not be readable by the public API.
DO $$
BEGIN
  PERFORM password_hash FROM public.officers;
  RAISE EXCEPTION 'anon must not be able to read password_hash';
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END $$;

RESET ROLE;
DO $$
BEGIN
  IF (SELECT count(*) FROM pg_publication_tables WHERE pubname = 'supabase_realtime') <> 3 THEN
    RAISE EXCEPTION 'realtime must be enabled for vehicles, reports and inspections';
  END IF;
END $$;

-- Website panel: admins only, and officer management needs an admin token.
SET ROLE anon;
DO $$
DECLARE
  tok TEXT;
  new_id UUID;
BEGIN
  IF (SELECT count(*) FROM public.login_admin('inspector_abebe', 'gondar2025')) <> 0 THEN
    RAISE EXCEPTION 'a non-admin officer must not be able to sign in to the website';
  END IF;

  SELECT token INTO tok FROM public.login_admin('admin', 'ChangeMe@2026');
  IF tok IS NULL OR NOT public.check_admin_session(tok) THEN
    RAISE EXCEPTION 'the admin must be able to sign in';
  END IF;
  IF public.check_admin_session('not-a-token') THEN
    RAISE EXCEPTION 'a made-up token must not pass';
  END IF;

  BEGIN
    PERFORM public.create_officer('not-a-token', 'ci_hacker', 'secret123', 'X', 'GD-TRF-999', '', '', '');
    RAISE EXCEPTION 'create_officer must reject a bad token';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  BEGIN
    PERFORM public.change_officer_password('not-a-token', (SELECT id FROM public.officers WHERE username = 'inspector_abebe'), 'hacked123');
    RAISE EXCEPTION 'change_officer_password must reject a bad token';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;

  new_id := public.create_officer(tok, 'ci_officer', 'secret123', 'CI Officer', 'GD-TRF-998', '', '', '');
  PERFORM public.change_officer_password(tok, new_id, 'newpass123');
  IF (SELECT count(*) FROM public.login_officer('ci_officer', 'newpass123')) <> 1 THEN
    RAISE EXCEPTION 'the admin must be able to change an officer password';
  END IF;
  IF (SELECT created_at FROM public.officers WHERE id = new_id) IS NULL THEN
    RAISE EXCEPTION 'officers must record when they were registered';
  END IF;

  PERFORM public.logout_admin(tok);
  IF public.check_admin_session(tok) THEN
    RAISE EXCEPTION 'a signed-out token must stop working';
  END IF;
END $$;

DO $$
BEGIN
  PERFORM token_hash FROM public.admin_sessions;
  RAISE EXCEPTION 'anon must not be able to read admin sessions';
EXCEPTION WHEN insufficient_privilege THEN
  NULL;
END $$;
RESET ROLE;
