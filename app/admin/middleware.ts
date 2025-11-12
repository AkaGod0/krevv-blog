import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  // ✅ Protect all /admin routes except login
  if (req.nextUrl.pathname.startsWith("/admin") && req.nextUrl.pathname !== "/admin/login") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      // Verify JWT with your backend secret
      jwt.verify(token, process.env.NEXT_PUBLIC_JWT_SECRET || "mysecret"); // must match your backend JWT secret
    } catch (err) {
      // ❌ Token expired or invalid
      const loginUrl = new URL("/admin/login", req.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("token"); // clear invalid cookie
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
