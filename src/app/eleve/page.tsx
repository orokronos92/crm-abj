/**
 * Page racine élève
 * Redirige vers la formation
 */

import { redirect } from 'next/navigation'

export default function ElevePage() {
  redirect('/eleve/formation')
}