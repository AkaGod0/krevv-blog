import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const maintenance = req.cookies.get("maintenance")?.value === "true";
  const pathname = req.nextUrl.pathname;

  // 🔐 ALLOW ALL ADMIN ROUTES
  if (pathname.startsWith("/admin")) {
    // Allow admin login without token
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    // Require token for admin pages
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Validate token
    try {
      jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET || "mysecret");
    } catch (err) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      res.cookies.delete("token");
      return res;
    }

    // 🚀 IMPORTANT: Admin bypasses maintenance
    return NextResponse.next();
  }

  // 🌐 PUBLIC MAINTENANCE MODE
  if (maintenance && pathname !== "/maintenance") {
    return NextResponse.redirect(new URL("/maintenance", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next|.*\\..*).*)",
  ],
};
