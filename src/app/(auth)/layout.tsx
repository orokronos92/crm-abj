/**
 * Layout pour les routes protégées
 * Vérifie l'authentification avant d'afficher le contenu
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config.demo'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  if (!session) {
    redirect('/connexion')
  }

  return <>{children}</>
}