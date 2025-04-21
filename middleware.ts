import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Chemins qui ne nécessitent pas d'authentification
const publicPaths = [
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/plans",
  "/auth/reset-password",
  "/api/webhooks/stripe",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Vérifier si le chemin est public
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path))

  // Vérifier si l'utilisateur est connecté (via le cookie de session Firebase)
  const authCookie = request.cookies.get("__session")
  const isAuthenticated = !!authCookie

  // Si l'utilisateur n'est pas connecté et tente d'accéder à une page protégée
  if (!isAuthenticated && !isPublicPath) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(url)
  }

  // Si l'utilisateur est connecté et tente d'accéder à une page d'authentification
  if (
    isAuthenticated &&
    (pathname.startsWith("/auth/login") || pathname.startsWith("/auth/register") || pathname === "/auth/plans")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configurer le middleware pour s'exécuter sur toutes les routes sauf les ressources statiques
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
