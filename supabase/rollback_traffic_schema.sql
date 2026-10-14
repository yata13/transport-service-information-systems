-- ====================================================================
-- UNDO the Gondar Traffic schema in a project where it was run by mistake
-- (removes what migrations/20261012000000_shared_realtime_backend.sql and
--  flutter_app/supabase_schema.sql created).
--
-- !! Run this ONLY in the WRONG project (e.g. "visit gondar form"),
-- !! NEVER in the real traffic project: it deletes the traffic data.
--
-- STEP 1: run only the "CHECK" query below and read the result.
-- STEP 2: run the whole file.
--
-- A table is dropped only when its columns match the traffic table, so a
-- table of the other app that happens to share a name is left alone.
-- The pgcrypto extension is kept: the other app may use it too.
-- ====================================================================

-- CHECK: what traffic objects exist in this project (nothing is changed)
SELECT 'table' AS kind, c.relname AS name,
       (SELECT count(*) FROM pg_attribute a WHERE a.attrelid = c.oid AND a.attnum > 0) AS columns
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r'
  AND c.relname IN ('bajaj_vehicles', 'officers', 'violation_reports', 'inspections')
UNION ALL
SELECT 'function', p.proname, NULL
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('login_officer', 'create_officer', 'set_officer_active');

-- --------------------------------------------------------------------
-- REMOVE
-- --------------------------------------------------------------------
BEGIN;

DROP FUNCTION IF EXISTS public.login_officer(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.create_officer(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.set_officer_active(UUID, BOOLEAN);

DO $$
DECLARE
    -- table name => a column only the traffic version of that table has
    t RECORD;
BEGIN
    FOR t IN
        SELECT * FROM (VALUES
            ('inspections',       'plate_checked'),
            ('violation_reports', 'report_number'),
            ('bajaj_vehicles',    'bajaj_association'),
            ('officers',          'badge_number')
        ) AS v(tbl, marker)
    LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = t.tbl AND column_name = t.marker
        ) THEN
            -- Dropping the table also removes its policies, indexes and
            -- its entry in the supabase_realtime publication.
            EXECUTE format('DROP TABLE public.%I', t.tbl);
            RAISE NOTICE 'Dropped traffic table %', t.tbl;
        ELSIF EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = t.tbl
        ) THEN
            RAISE NOTICE 'KEPT %: it is not the traffic table (belongs to the other app)', t.tbl;
        END IF;
    END LOOP;
END $$;

COMMIT;
