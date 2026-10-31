import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "./features/auth/auth.action";

export default async function proxy(request: NextRequest) {
  const token = await getAccessToken();
  const authPage = request.nextUrl.pathname === "/";

  if (!token && !authPage)
    return NextResponse.redirect(new URL("/", request.url));
  else if (token && authPage) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/"],
};
