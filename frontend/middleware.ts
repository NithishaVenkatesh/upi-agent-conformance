import { NextRequest, NextResponse } from "next/server";

// Allow checkout and showcase pages without authentication for demo purposes
export const config = { matcher: ["/app/:path*"] };

export function middleware(req: NextRequest) {
  // Allow /app/checkout and /app/showcase without auth for demo flow
  if (req.nextUrl.pathname === "/app/checkout" || req.nextUrl.pathname === "/app/showcase") {
    return NextResponse.next();
  }

  if (!req.cookies.has("rzp_demo")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
