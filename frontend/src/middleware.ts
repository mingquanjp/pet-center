import { NextRequest, NextResponse } from "next/server";

const routePermissions = {
  "/owner": ["OWNER"],
  "/staff": ["STAFF", "ADMIN"],
  "/doctor": ["DOCTOR", "ADMIN"],
  "/admin": ["ADMIN"],
} as const;

const roleHomePath: Record<string, string> = {
  OWNER: "/owner/dashboard",
  STAFF: "/staff/dashboard",
  DOCTOR: "/doctor/dashboard",
  ADMIN: "/admin/dashboard",
};

const authRoutes = ["/login", "/register"];
const roleAliases: Record<string, keyof typeof roleHomePath> = {
  owner: "OWNER",
  staff: "STAFF",
  doctor: "DOCTOR",
  admin: "ADMIN",
};

function normalizeRole(role?: string): keyof typeof roleHomePath | undefined {
  if (!role) return undefined;

  return roleAliases[role.trim().toLowerCase()];
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get("accessToken")?.value;
  const role = normalizeRole(req.cookies.get("userRole")?.value);

  const dashboardPath = role ? roleHomePath[role] : undefined;

  if (pathname === "/" && token && dashboardPath) {
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  if (authRoutes.includes(pathname) && token && dashboardPath) {
    return NextResponse.redirect(new URL(dashboardPath, req.url));
  }

  const matchedEntry = Object.entries(routePermissions).find(([prefix]) =>
    pathname.startsWith(prefix)
  );

  if (matchedEntry && !token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (matchedEntry && (!role || !matchedEntry[1].includes(role as never))) {
    return NextResponse.redirect(new URL(dashboardPath ?? "/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/owner/:path*",
    "/staff/:path*",
    "/doctor/:path*",
    "/admin/:path*",
  ],
};
