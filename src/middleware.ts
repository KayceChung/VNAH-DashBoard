import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Web-dashboard-only session limits. Deliberately NOT configured on the
// Supabase project itself (supabase/config.toml's [auth.sessions]) because
// that project also backs the VNAH mobile app used by field staff — a
// project-wide timeout would sign THEM out mid-fieldwork. Enforcing it here
// instead means it only ever applies to browser access to /dashboard.
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 min without a request
const SESSION_TIMEBOX_MS = 12 * 60 * 60 * 1000; // 12h since login, regardless of activity

const LAST_ACTIVITY_COOKIE = "vnah_dash_last_activity";
const SESSION_STARTED_COOKIE = "vnah_dash_session_started";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login");
  const isDashboardRoute = request.nextUrl.pathname.startsWith("/dashboard");

  if (user && isDashboardRoute) {
    const now = Date.now();
    const lastActivity = Number(request.cookies.get(LAST_ACTIVITY_COOKIE)?.value ?? NaN);
    const sessionStarted = Number(request.cookies.get(SESSION_STARTED_COOKIE)?.value ?? NaN);

    const idleExpired = Number.isFinite(lastActivity) && now - lastActivity > INACTIVITY_TIMEOUT_MS;
    const timeboxExpired = Number.isFinite(sessionStarted) && now - sessionStarted > SESSION_TIMEBOX_MS;

    if (idleExpired || timeboxExpired) {
      // signOut() revokes the refresh token and calls the cookie adapter's
      // setAll to clear the sb- cookies, which reassigns `response` above —
      // carry those cleared cookies over onto the redirect we actually return.
      await supabase.auth.signOut();
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("next", request.nextUrl.pathname);
      redirectUrl.searchParams.set("reason", idleExpired ? "idle" : "timebox");
      const signedOutResponse = NextResponse.redirect(redirectUrl);
      response.cookies.getAll().forEach((cookie) => signedOutResponse.cookies.set(cookie));
      signedOutResponse.cookies.delete(LAST_ACTIVITY_COOKIE);
      signedOutResponse.cookies.delete(SESSION_STARTED_COOKIE);
      return signedOutResponse;
    }

    response.cookies.set(LAST_ACTIVITY_COOKIE, String(now), {
      httpOnly: true,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      path: "/",
    });
    if (!Number.isFinite(sessionStarted)) {
      response.cookies.set(SESSION_STARTED_COOKIE, String(now), {
        httpOnly: true,
        sameSite: "lax",
        secure: request.nextUrl.protocol === "https:",
        path: "/",
      });
    }
  }

  if (!user && isDashboardRoute) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAuthRoute) {
    // Landing on /login (manual sign-out, or a stale link) — clear any
    // leftover session-tracking cookies so the next login starts its own
    // fresh idle/timebox window instead of inheriting a stale timestamp.
    response.cookies.delete(LAST_ACTIVITY_COOKIE);
    response.cookies.delete(SESSION_STARTED_COOKIE);
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
