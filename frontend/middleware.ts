import { NextRequest, NextResponse } from "next/server";

export const config = { matcher: ["/app/:path*"] };

export function middleware(req: NextRequest) {
  if (!req.cookies.has("rzp_demo")) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}
