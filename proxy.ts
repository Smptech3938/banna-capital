import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 "proxy" — replaces the deprecated "middleware" convention.
 *
 * Protected routes — unauthenticated users get redirected to /login.
 * Auth routes     — authenticated users get redirected to /dashboard.
 */
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/investments", "/admin"];
const AUTH_ROUTES = ["/login", "/register"];

export async function proxy(request: NextRequest) {
  // 1. Create a response we can modify (pass cookies through)
  let supabaseResponse = NextResponse.next({ request });

  // 2. Create Supabase client with cookie bridge
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request cookies (for downstream server components)
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          // Re-create response so it carries the updated request
          supabaseResponse = NextResponse.next({ request });
          // Set cookies on the response (sent to the browser)
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Refresh session — IMPORTANT: always call getUser() so
  //    expired tokens get refreshed via the cookie bridge above.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 4. Protected route + no user → redirect to /login
  if (!user && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 5. Auth route + already logged in → redirect to /dashboard
  if (user && AUTH_ROUTES.some((route) => pathname.startsWith(route))) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

/**
 * Only run proxy on app routes, skip static assets & API internals.
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
