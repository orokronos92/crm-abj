/**
 * Types pour le Dashboard
 */

export interface ProspectStat {
  id: string
  nom: string
  email: string
  formation: string
  statut: string
  date: string
}

export interface FormationStat {
  nom: string
  count: number
  color: string
}

export interface ActivityItem {
  id: number
  type: 'prospect' | 'email' | 'document' | 'formation'
  message: string
  time: string
  icon?: any
}

export interface StatsCardData {
  title: string
  value: number | string
  variation?: number
  subtitle?: string
  icon?: any
  iconBgColor?: string
  iconColor?: string
}