/**
 * Middleware Next.js pour la gestion de l'authentification
 * Certaines routes sont publiques, d'autres nécessitent une auth
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes qui ne nécessitent PAS d'authentification
const publicRoutes = [
  '/connexion',
  '/api/auth',
  '/api/notifications', // Tous les endpoints de notifications (temporaire pour tests)
  '/api/salles', // API salles (temporaire pour tests)
  '/api/evenements', // API événements (temporaire pour tests)
  '/api/formateurs', // API formateurs (création rapide sans auth)
  '/api/sessions', // API sessions (temporaire pour tests)
  '/_next',
  '/favicon.ico'
]

// Middleware custom avec next-auth
export default withAuth(
  function middleware(req: NextRequest) {
    return NextResponse.next()
  },
  {
    pages: {
      signIn: '/connexion',
    },
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname

        // Vérifier si c'est une route publique
        const isPublicRoute = publicRoutes.some(route => path.startsWith(route))
        if (isPublicRoute) {
          return true // Autoriser sans auth
        }

        // Pour toutes les autres routes, exiger une authentification
        return !!token
      }
    }
  }
)

// Configuration du matcher - routes à protéger
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ]
}