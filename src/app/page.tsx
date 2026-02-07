/**
 * Page d'accueil
 * Redirige directement vers le dashboard admin (mode démo)
 */

import { redirect } from 'next/navigation'

export default async function HomePage() {
  // Redirection directe vers le dashboard admin en mode démo
  redirect('/admin/dashboard')
}