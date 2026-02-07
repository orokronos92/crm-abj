/**
 * Fonctions utilitaires générales
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine les classes Tailwind intelligemment
 * Gère les conflits et les conditionnels
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(d)
}

/**
 * Formate une date avec l'heure
 */
export function formatDateTime(date: Date | string | null): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(d)
}

/**
 * Formate un montant en euros
 */
export function formatCurrency(amount: number | null): string {
  if (amount === null) return '-'
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

/**
 * Formate un numéro de téléphone
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/)
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]} ${match[5]}`
  }
  return phone
}

/**
 * Génère des initiales à partir du nom/prénom
 */
export function getInitials(nom?: string | null, prenom?: string | null): string {
  const n = nom?.charAt(0)?.toUpperCase() || ''
  const p = prenom?.charAt(0)?.toUpperCase() || ''
  return p + n || '?'
}

/**
 * Couleur selon le statut
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Statuts candidature
    'NOUVEAU': 'bg-blue-100 text-blue-800',
    'EN_COURS': 'bg-yellow-100 text-yellow-800',
    'VALIDE': 'bg-green-100 text-green-800',
    'REFUSE': 'bg-red-100 text-red-800',
    'EN_ATTENTE': 'bg-orange-100 text-orange-800',

    // Statuts formation
    'INSCRIT': 'bg-indigo-100 text-indigo-800',
    'TERMINE': 'bg-gray-100 text-gray-800',
    'ABANDONNE': 'bg-red-100 text-red-800',

    // Statuts présence
    'PRESENT': 'bg-green-100 text-green-800',
    'ABSENT': 'bg-red-100 text-red-800',
    'ABSENT_JUSTIFIE': 'bg-orange-100 text-orange-800',
    'RETARD': 'bg-yellow-100 text-yellow-800',
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

/**
 * Débounce une fonction
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export function hasRole(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

/**
 * Extrait les erreurs d'un objet d'erreur
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') return error
  if (error?.message) return error.message
  if (error?.response?.data?.message) return error.response.data.message
  return 'Une erreur est survenue'
}