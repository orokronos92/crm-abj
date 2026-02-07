/**
 * Page racine formateur
 * Redirige vers le planning
 */

import { redirect } from 'next/navigation'

export default function FormateurPage() {
  redirect('/formateur/planning')
}