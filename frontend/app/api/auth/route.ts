import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  const jar = await cookies();
  jar.set("rzp_demo", "true", { httpOnly: true, sameSite: "lax", maxAge: 604800 });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const jar = await cookies();
  jar.delete("rzp_demo");
  return NextResponse.json({ ok: true });
}
