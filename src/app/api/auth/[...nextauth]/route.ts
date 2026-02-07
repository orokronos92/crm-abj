/**
 * API Route NextAuth
 * Point d'entrée pour l'authentification
 */

import NextAuth from 'next-auth'
// Mode démo temporaire (sans BDD)
// Pour utiliser avec la BDD, remplacer par : import { authConfig } from '@/config/auth.config'
import { authConfig } from '@/config/auth.config.demo'

const handler = NextAuth(authConfig)

export { handler as GET, handler as POST }