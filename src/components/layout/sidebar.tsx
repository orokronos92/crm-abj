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
  Diamond,
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
          {
            title: 'Tableau de bord',
            items: [
              { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
              { icon: BarChart3, label: 'Statistiques', href: '/admin/stats' },
            ]
          },
          {
            title: 'Gestion',
            items: [
              { icon: Users, label: 'Prospects', href: '/admin/prospects' },
              { icon: UserCheck, label: 'Candidats', href: '/admin/candidats' },
              { icon: GraduationCap, label: 'Élèves', href: '/admin/eleves' },
              { icon: UserPlus, label: 'Nouveau prospect', href: '/admin/prospects/nouveau' },
            ]
          },
          {
            title: 'Formations',
            items: [
              { icon: BookOpen, label: 'Catalogue', href: '/admin/formations' },
              { icon: Calendar, label: 'Sessions', href: '/admin/sessions' },
              { icon: ClipboardList, label: 'Présences', href: '/admin/presences' },
              { icon: Award, label: 'Évaluations', href: '/admin/evaluations' },
            ]
          },
          {
            title: 'Documents',
            items: [
              { icon: FileText, label: 'Documents', href: '/admin/documents' },
              { icon: PenTool, label: 'Générer devis', href: '/admin/documents/devis' },
              { icon: FolderOpen, label: 'Templates', href: '/admin/templates' },
            ]
          },
          {
            title: 'Communication',
            items: [
              { icon: Mail, label: 'Emails', href: '/admin/emails' },
              { icon: Send, label: 'Campagnes', href: '/admin/campagnes' },
              { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
              { icon: MessageSquare, label: 'Chat Marjorie', href: '/admin/marjorie', special: true },
            ]
          },
          {
            title: 'Système',
            items: [
              { icon: Settings, label: 'Paramètres', href: '/admin/settings' },
            ]
          }
        ]

      case 'professeur':
        return [
          {
            title: 'Espace formateur',
            items: [
              { icon: Home, label: 'Accueil', href: '/formateur/planning' },
              { icon: Calendar, label: 'Planning', href: '/formateur/planning' },
              { icon: Users, label: 'Mes élèves', href: '/formateur/eleves' },
            ]
          },
          {
            title: 'Pédagogie',
            items: [
              { icon: ClipboardList, label: 'Présences', href: '/formateur/presences' },
              { icon: Award, label: 'Évaluations', href: '/formateur/evaluations' },
              { icon: FileText, label: 'Documents', href: '/formateur/documents' },
            ]
          },
          {
            title: 'Outils',
            items: [
              { icon: MessageSquare, label: 'Chat Marjorie', href: '/formateur/marjorie', special: true },
              { icon: Calendar, label: 'Disponibilités', href: '/formateur/disponibilites' },
            ]
          }
        ]

      case 'eleve':
        return [
          {
            title: 'Mon espace',
            items: [
              { icon: Home, label: 'Ma formation', href: '/eleve/formation' },
              { icon: Calendar, label: 'Planning', href: '/eleve/planning' },
              { icon: Award, label: 'Mes notes', href: '/eleve/notes' },
            ]
          },
          {
            title: 'Ressources',
            items: [
              { icon: FileText, label: 'Documents', href: '/eleve/documents' },
              { icon: BookOpen, label: 'Cours', href: '/eleve/cours' },
            ]
          },
          {
            title: 'Support',
            items: [
              { icon: MessageSquare, label: 'Chat Marjorie', href: '/eleve/marjorie', special: true },
              { icon: Bell, label: 'Notifications', href: '/eleve/notifications' },
            ]
          }
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
        {/* Header avec logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[rgba(var(--accent),0.1)]">
          <Link href="/" className="flex items-center gap-3">
            <Diamond className="w-8 h-8 text-[rgb(var(--accent))] animate-pulse-gold" />
            {!isCollapsed && (
              <span className="text-xl font-bold text-gradient-gold">
                ABJ
              </span>
            )}
          </Link>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-[rgb(var(--accent))]" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-[rgb(var(--accent))]" />
            )}
          </button>
        </div>

        {/* User info */}
        {!isCollapsed && userName && (
          <div className="p-4 border-b border-[rgba(var(--accent),0.1)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                  {userName}
                </p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {role === 'admin' ? 'Administrateur' :
                   role === 'professeur' ? 'Formateur' : 'Élève'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className={sectionIndex > 0 ? 'mt-6' : ''}>
              {!isCollapsed && (
                <h3 className="text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
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
            </div>
          ))}
        </nav>

        {/* Footer avec déconnexion */}
        <div className="p-4 border-t border-[rgba(var(--accent),0.1)]">
          <button
            onClick={() => signOut({ callbackUrl: '/connexion' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[rgba(var(--error),0.1)] transition-colors group"
          >
            <LogOut className="w-5 h-5 text-[rgb(var(--error))] group-hover:text-[rgb(var(--error))]" />
            {!isCollapsed && (
              <span className="text-sm font-medium text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--error))]">
                Déconnexion
              </span>
            )}
          </button>
        </div>
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