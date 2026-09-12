import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase admin client using the service-role key.
 * BYPASSES RLS — use only for admin operations (user management, migrations).
 * Never expose this client to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
