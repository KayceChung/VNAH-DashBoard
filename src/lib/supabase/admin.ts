import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * Service-role Supabase client. Bypasses RLS entirely — never import this
 * from a Client Component and never send SUPABASE_SERVICE_ROLE_KEY to the
 * browser. Reserved for operations that must run after RLS has already
 * authorized the request (e.g. minting a short-lived signed URL for a
 * storage path the caller was just proven able to read).
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
