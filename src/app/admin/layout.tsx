/**
 * Layout admin
 * Assure la protection des routes admin
 */

import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/config/auth.config.demo'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authConfig)

  // Vérifier l'authentification et le rôle
  if (!session) {
    redirect('/connexion')
  }

  if (session.user.role !== 'admin') {
    // Rediriger vers le dashboard approprié selon le rôle
    if (session.user.role === 'professeur') {
      redirect('/formateur')
    } else if (session.user.role === 'eleve') {
      redirect('/eleve')
    }
    redirect('/connexion')
  }

  return <>{children}</>
}