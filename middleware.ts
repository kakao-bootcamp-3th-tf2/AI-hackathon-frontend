import { NextRequest, NextResponse } from "next/server";

const AUTH_TOKEN_COOKIE = "ai-hackathon:auth-token";

const hasValidAuth = (request: NextRequest): boolean => {
  const authCookie = request.cookies.get(AUTH_TOKEN_COOKIE)?.value;
  return !!authCookie && authCookie.length > 0;
};

export function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const isAppRoute = pathname === "/app" || pathname.startsWith("/app/");

  if (pathname === "/") {
    const redirectUrl = nextUrl.clone();
    redirectUrl.pathname = hasValidAuth(request) ? "/app" : "/auth/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  if (isAppRoute && !hasValidAuth(request)) {
    const redirectUrl = nextUrl.clone();
    redirectUrl.pathname = "/auth/login";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app/:path*"]
};
