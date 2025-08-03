// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("token")?.value;
  console.log("Middleware triggered for path:", path);

  const publicRoutes = ["/login"];

  // Skip middleware for static assets and public files
  const isStaticAsset =
    path.startsWith("/_next") ||
    path === "/favicon.ico" ||
    path.startsWith("/static");
  path.startsWith("/logo");

  if (isStaticAsset) {
    return NextResponse.next();
  }

  // ✅ If user is authenticated and tries to access /login, redirect to /
  if (token && path === "/login") {
    console.log("User is authenticated, redirecting from /login to /");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ✅ If user is not authenticated and tries to access any non-public route, redirect to /login
  if (!token && !publicRoutes.includes(path)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Otherwise allow the request
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run middleware on all paths except API, static, and public files
    "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};
