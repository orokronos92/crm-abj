/**
 * Layout élève
 * Assure la protection des routes élève
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config.demo'

export default async function EleveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  // Vérifier l'authentification et le rôle
  if (!session) {
    redirect('/connexion')
  }

  if (session.user.role !== 'eleve') {
    // Rediriger vers le dashboard approprié selon le rôle
    if (session.user.role === 'admin') {
      redirect('/admin')
    } else if (session.user.role === 'professeur') {
      redirect('/formateur')
    }
    redirect('/connexion')
  }

  return <>{children}</>
}