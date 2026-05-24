import { NextRequest, NextResponse } from "next/server";

const routePermissions = {
  "/owner": ["OWNER"],
  "/staff": ["STAFF", "ADMIN"],
  "/doctor": ["DOCTOR", "ADMIN"],
  "/admin": ["ADMIN"],
} as const;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;
  const role = req.cookies.get("userRole")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const matchedEntry = Object.entries(routePermissions).find(([prefix]) => pathname.startsWith(prefix));

  if (matchedEntry && !matchedEntry[1].includes(role as never)) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/owner/:path*", "/staff/:path*", "/doctor/:path*", "/admin/:path*"],
};
