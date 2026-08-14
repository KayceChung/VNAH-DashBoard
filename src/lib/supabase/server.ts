import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

/**
 * Request-scoped Supabase client, bound to the caller's session cookies.
 * All queries through this client are subject to RLS (current_staff_id() /
 * is_admin() / is_same_branch()) exactly as they would be for the logged-in
 * staff member — never use this for privileged reads, use lib/supabase/admin.ts.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Called from a Server Component render — middleware refreshes
            // the session cookie on the next request, safe to ignore here.
          }
        },
      },
    },
  );
}
