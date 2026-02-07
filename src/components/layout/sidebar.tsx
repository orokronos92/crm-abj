/**
 * Sidebar de navigation
 * Design noir & doré avec tous les menus
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  GraduationCap,
  Calendar,
  FileText,
  Mail,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  UserPlus,
  FolderOpen,
  Send,
  Bell,
  BookOpen,
  Award,
  ClipboardList,
  PenTool,
  Sparkles,
} from 'lucide-react'
import { DiamondLogo } from '@/components/ui/diamond-logo'

interface SidebarProps {
  role: 'admin' | 'professeur' | 'eleve'
  userName?: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  // Menus selon le rôle
  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { icon: Home, label: 'Tableau de bord', href: '/admin/dashboard' },
          { icon: Users, label: 'Prospects', href: '/admin/prospects' },
          { icon: UserPlus, label: 'Ajouter un prospect', href: '/admin/prospects/nouveau' },
          { icon: UserCheck, label: 'Candidats', href: '/admin/candidats' },
          { icon: GraduationCap, label: 'Élèves', href: '/admin/eleves' },
          { icon: Award, label: 'Formateurs', href: '/admin/formateurs' },
          { icon: Calendar, label: 'Planning & Sessions', href: '/admin/planning' },
          { icon: BarChart3, label: 'Statistiques', href: '/admin/stats' },
          { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
          { icon: MessageSquare, label: 'Chat Marjorie', href: '/admin/marjorie', special: true },
          { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
        ]

      case 'professeur':
        return [
          { icon: Home, label: 'Accueil', href: '/formateur/planning' },
          { icon: Calendar, label: 'Planning', href: '/formateur/planning' },
          { icon: Users, label: 'Mes élèves', href: '/formateur/eleves' },
          { icon: ClipboardList, label: 'Présences', href: '/formateur/presences' },
          { icon: Award, label: 'Évaluations', href: '/formateur/evaluations' },
          { icon: FileText, label: 'Documents', href: '/formateur/documents' },
          { icon: MessageSquare, label: 'Chat Marjorie', href: '/formateur/marjorie', special: true },
          { icon: Calendar, label: 'Disponibilités', href: '/formateur/disponibilites' },
        ]

      case 'eleve':
        return [
          { icon: Home, label: 'Ma formation', href: '/eleve/formation' },
          { icon: Calendar, label: 'Planning', href: '/eleve/planning' },
          { icon: Award, label: 'Mes notes', href: '/eleve/notes' },
          { icon: FileText, label: 'Documents', href: '/eleve/documents' },
          { icon: BookOpen, label: 'Cours', href: '/eleve/cours' },
          { icon: MessageSquare, label: 'Chat Marjorie', href: '/eleve/marjorie', special: true },
          { icon: Bell, label: 'Notifications', href: '/eleve/notifications' },
        ]

      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  return (
    <>
      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } sidebar flex flex-col`}
      >
        {/* Header avec logo et profil */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[rgba(var(--accent),0.1)]">
          <Link href="/" className="flex items-center gap-3">
            <DiamondLogo className="text-[rgb(var(--accent))] animate-pulse-gold" size={32} />
            {!isCollapsed && (
              <span className="text-xl font-bold text-gradient-gold">
                ABJ
              </span>
            )}
          </Link>

          {/* Profil + Déconnexion en haut à droite */}
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              {userName && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold text-xs">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <button
                onClick={() => signOut({ callbackUrl: '/connexion' })}
                className="p-1.5 rounded-lg hover:bg-[rgba(var(--error),0.1)] transition-colors"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4 text-[rgb(var(--error))]" />
              </button>
            </div>
          )}

          {/* Bouton collapse pour mode réduit */}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-[rgb(var(--accent))]" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg
                      transition-all duration-200 group relative
                      ${isActive ? 'sidebar-item active' : 'sidebar-item'}
                      ${item.special ? 'border border-[rgba(var(--accent),0.2)]' : ''}
                    `}
                  >
                    <Icon
                      className={`
                        w-5 h-5 flex-shrink-0
                        ${isActive ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--muted-foreground))]'}
                        group-hover:text-[rgb(var(--accent))]
                        ${item.special ? 'text-[rgb(var(--accent))]' : ''}
                      `}
                    />
                    {!isCollapsed && (
                      <span
                        className={`
                          text-sm font-medium
                          ${isActive ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--foreground))]'}
                          group-hover:text-[rgb(var(--accent))]
                        `}
                      >
                        {item.label}
                      </span>
                    )}
                    {item.special && !isCollapsed && (
                      <Sparkles className="w-3 h-3 text-[rgb(var(--accent))] ml-auto animate-pulse" />
                    )}

                    {/* Tooltip pour mode collapsed */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
                        <span className="text-xs text-[rgb(var(--foreground))]">
                          {item.label}
                        </span>
                      </div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer avec bouton collapse */}
        {!isCollapsed && (
          <div className="p-4 border-t border-[rgba(var(--accent),0.1)]">
            <button
              onClick={() => setIsCollapsed(true)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors group"
            >
              <ChevronLeft className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                Réduire le menu
              </span>
            </button>
          </div>
        )}
      </aside>

      {/* Overlay mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-30 lg:hidden ${
          isCollapsed ? 'hidden' : 'block'
        }`}
        onClick={() => setIsCollapsed(true)}
      />
    </>
  )
}