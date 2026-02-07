/**
 * Configuration NextAuth.js - MODE DEMO
 * Authentification sans base de données pour tests
 */

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Types pour l'authentification
declare module 'next-auth' {
  interface Session {
    user: {
      id: number
      email: string
      nom: string
      prenom: string
      role: 'admin' | 'professeur' | 'eleve'
    }
  }

  interface User {
    id: number
    email: string
    nom: string
    prenom: string
    role: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number
    email: string
    nom: string
    prenom: string
    role: string
  }
}

// Utilisateurs de démo (sans BDD)
const DEMO_USERS = [
  {
    id: 1,
    email: 'admin@abj.fr',
    password: 'demo',
    nom: 'Admin',
    prenom: 'Système',
    role: 'admin'
  },
  {
    id: 2,
    email: 'formateur@abj.fr',
    password: 'demo',
    nom: 'Durand',
    prenom: 'Pierre',
    role: 'professeur'
  },
  {
    id: 3,
    email: 'eleve@abj.fr',
    password: 'demo',
    nom: 'Martin',
    prenom: 'Sophie',
    role: 'eleve'
  }
]

export const authConfig: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Identifiants',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis')
        }

        // Mode démo : vérification dans la liste en mémoire
        const user = DEMO_USERS.find(
          u => u.email === credentials.email && u.password === credentials.password
        )

        if (!user) {
          throw new Error('Identifiants incorrects')
        }

        return {
          id: user.id,
          email: user.email,
          nom: user.nom,
          prenom: user.prenom,
          role: user.role
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = Number(user.id)
        token.email = user.email
        token.nom = user.nom
        token.prenom = user.prenom
        token.role = user.role
      }
      return token
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as number
        session.user.email = token.email as string
        session.user.nom = token.nom as string
        session.user.prenom = token.prenom as string
        session.user.role = token.role as 'admin' | 'professeur' | 'eleve'
      }
      return session
    }
  },

  pages: {
    signIn: '/connexion',
    error: '/connexion',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  secret: process.env.NEXTAUTH_SECRET,
}