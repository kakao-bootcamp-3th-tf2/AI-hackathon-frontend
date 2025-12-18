import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE_NAME = "ai-hackathon:auth-token";
const protectedPrefixes = [
  "/api/actions",
  "/api/benefits",
  "/api/cards",
  "/profile",
  "/settings"
];

const hasAuthCookie = (request: NextRequest) =>
  request.cookies.get(AUTH_COOKIE_NAME)?.value === "true";

const shouldProtectPath = (pathname: string) =>
  protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

export function middleware(request: NextRequest) {
  // if (request.nextUrl.pathname === "/") {
  //   const rewriteUrl = request.nextUrl.clone();
  //   rewriteUrl.pathname = "/app";
  //   return NextResponse.rewrite(rewriteUrl);
  // }

  // if (shouldProtectPath(request.nextUrl.pathname) && !hasAuthCookie(request)) {
  //   const redirectUrl = request.nextUrl.clone();
  //   redirectUrl.pathname = "/";
  //   redirectUrl.search = "";
  //   return NextResponse.redirect(redirectUrl);
  // }

  return NextResponse.next();
}

// export const config = {
//   matcher: [
//     "/",
//     ...protectedPrefixes.map((prefix) => `${prefix}/:path*`),
//     ...protectedPrefixes
//   ]
// };
