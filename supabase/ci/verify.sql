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
