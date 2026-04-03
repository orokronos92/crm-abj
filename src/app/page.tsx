/**
 * Page d'accueil
 * Redirige vers le dashboard selon le rôle, ou vers la connexion si non authentifié
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config'

export default async function HomePage() {
  const session = await getServerSession(authConfig)
  if (!session) {
    redirect('/connexion')
  }
  redirect('/admin/dashboard')
}