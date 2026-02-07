/**
 * Configuration NextAuth.js
 * Gestion de l'authentification pour 3 rôles : admin, formateur, élève
 */

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

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

        // Recherche utilisateur dans la BDD
        const utilisateur = await prisma.utilisateur.findUnique({
          where: { email: credentials.email }
        })

        if (!utilisateur || !utilisateur.motDePasseHash) {
          throw new Error('Identifiants incorrects')
        }

        // Vérification du mot de passe
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          utilisateur.motDePasseHash
        )

        if (!isPasswordValid) {
          throw new Error('Identifiants incorrects')
        }

        // Vérification compte actif
        if (utilisateur.statutCompte !== 'ACTIF') {
          throw new Error('Compte inactif ou suspendu')
        }

        // Mise à jour dernière connexion
        await prisma.utilisateur.update({
          where: { idUtilisateur: utilisateur.idUtilisateur },
          data: { dateDerniereConnexion: new Date() }
        })

        return {
          id: utilisateur.idUtilisateur,
          email: utilisateur.email,
          nom: utilisateur.nom || '',
          prenom: utilisateur.prenom || '',
          role: utilisateur.role
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
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