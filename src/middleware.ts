/**
 * Middleware NextAuth
 * Protection des routes selon les rôles
 */

import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import { ROLES, HOME_ROUTES } from '@/config/constants'

export default withAuth(
  function middleware(req) {
    // MODE DEV : Bypass auth temporaire
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next()
    }

    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Si pas de token, redirection vers connexion
    if (!token) {
      return NextResponse.redirect(new URL('/connexion', req.url))
    }

    const userRole = token.role as string

    // Protection des routes admin
    if (path.startsWith('/admin') && userRole !== ROLES.ADMIN) {
      return NextResponse.redirect(new URL(HOME_ROUTES[userRole as keyof typeof HOME_ROUTES], req.url))
    }

    // Protection des routes formateur
    if (path.startsWith('/formateur') && userRole !== ROLES.PROFESSEUR) {
      return NextResponse.redirect(new URL(HOME_ROUTES[userRole as keyof typeof HOME_ROUTES], req.url))
    }

    // Protection des routes élève
    if (path.startsWith('/eleve') && userRole !== ROLES.ELEVE) {
      return NextResponse.redirect(new URL(HOME_ROUTES[userRole as keyof typeof HOME_ROUTES], req.url))
    }

    // Protection des API routes
    if (path.startsWith('/api') && !path.startsWith('/api/auth')) {
      // Vérifications spécifiques pour certaines API
      if (path.startsWith('/api/prospects') && userRole !== ROLES.ADMIN) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Laisser passer les webhooks n8n sans authentification
        // La sécurité est gérée par API Key dans la route elle-même
        const path = req.nextUrl.pathname
        const publicRoutes = [
          '/connexion',
          '/api/auth',
          '/api/notifications',
          '/api/salles',
          '/api/evenements',
          '/api/formateurs',
          '/api/sessions',
          '/api/webhook/callback',
          '/api/actions/trigger',
          '/_next',
          '/favicon.ico'
        ]
        if (publicRoutes.some(route => path.startsWith(route))) return true
        if (path.startsWith('/api/webhook/')) return true
        if (path.startsWith('/api/notifications/ingest')) return true
        return !!token
      }
    }
  }
)

// Configuration des routes à protéger
export const config = {
  matcher: [
    '/admin/:path*',
    '/formateur/:path*',
    '/eleve/:path*',
    '/api/:path*',
    '/((?!connexion|_next/static|_next/image|favicon.ico).*)'
  ]
}