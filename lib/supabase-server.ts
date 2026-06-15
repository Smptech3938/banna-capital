import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client.
 * Use this in:
 *   - Server Components (dashboard, profile pages)
 *   - Route Handlers (API routes)
 *
 * Do NOT use in middleware — middleware has its own cookie handling.
 * This is async because `cookies()` is async in Next.js 16.
 */
export async function createSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll can fail in Server Components (read-only context).
            // This is expected — middleware will handle cookie refreshes.
          }
        },
      },
    }
  );
}
