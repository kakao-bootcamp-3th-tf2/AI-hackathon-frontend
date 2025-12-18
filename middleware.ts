import { NextRequest, NextResponse } from "next/server";

const AUTH_TOKEN_COOKIE = "ai-hackathon:auth-token";

const hasValidAuth = (request: NextRequest): boolean => {
  // Check if auth token cookie exists and is not empty
  const authCookie = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  return !!authCookie && authCookie.length > 0;
};

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isAppRoute = pathname === "/app" || pathname.startsWith("/app/");

  // Protect /app routes - redirect to login if not authenticated
  if (isAppRoute && !hasValidAuth(request)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"]
};
