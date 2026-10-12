import { createClient } from '@supabase/supabase-js';

// The website and the Flutter app MUST point at the same Supabase project,
// otherwise reports made on phones never reach the ERP dashboard.
// Defaults match flutter_app/lib/main.dart; override with VITE_* env vars.
// The publishable key is designed to be public: access is governed by RLS.
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://fvqmdcwvtreqkxsrgisi.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_LwXB0Bn1J3QkmwZCinCWkQ_gfVyzdpz';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } },
});
