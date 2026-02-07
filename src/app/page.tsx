/**
 * Page d'accueil
 * Redirige vers le bon dashboard selon le rôle
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
// Mode démo temporaire (sans BDD)
// Pour utiliser avec la BDD, remplacer par : import { authConfig } from '@/config/auth.config'
import { authConfig } from '@/config/auth.config.demo'
import { HOME_ROUTES } from '@/config/constants'

export default async function HomePage() {
  const session = await getServerSession(authConfig)

  if (!session) {
    redirect('/connexion')
  }

  // Redirection selon le rôle
  const userRole = session.user.role as keyof typeof HOME_ROUTES
  redirect(HOME_ROUTES[userRole])
}