/**
 * Layout formateur
 * Assure la protection des routes formateur
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config.demo'

export default async function FormateurLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  // Vérifier l'authentification et le rôle
  if (!session || !session.user) {
    redirect('/connexion')
  }

  if (session.user.role !== 'professeur') {
    // Rediriger vers le dashboard approprié selon le rôle
    if (session.user.role === 'admin') {
      redirect('/admin')
    } else if (session.user.role === 'eleve') {
      redirect('/eleve')
    }
    redirect('/connexion')
  }

  return <>{children}</>
}