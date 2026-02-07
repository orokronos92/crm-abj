/**
 * Page racine admin
 * Redirige vers le dashboard
 */

import { redirect } from 'next/navigation'

export default function AdminPage() {
  redirect('/admin/dashboard')
}