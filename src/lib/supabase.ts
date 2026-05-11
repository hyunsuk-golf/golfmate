import { createBrowserClient } from "@supabase/ssr";
import { createClient as createJsClient } from "@supabase/supabase-js";

export const SESSION_ONLY_KEY = "sb_session_only";

export function createClient() {
  if (typeof window !== "undefined" && window.sessionStorage.getItem(SESSION_ONLY_KEY)) {
    return createJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          storage: window.sessionStorage,
          persistSession: true,
          detectSessionInUrl: true,
          autoRefreshToken: true,
        },
      }
    );
  }
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
