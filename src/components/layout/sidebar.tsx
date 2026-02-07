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
        {/* Header avec logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-[rgba(var(--accent),0.1)]">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setIsCollapsed(!isCollapsed)}>
            <DiamondLogo className="text-[rgb(var(--accent))] animate-pulse-gold" size={32} />
            {!isCollapsed && (
              <div>
                <div className="text-sm font-bold text-[rgb(var(--foreground))]">ABJ CRM</div>
                <div className="text-[9px] text-[rgb(var(--accent))] font-semibold uppercase tracking-wider">Joaillerie</div>
              </div>
            )}
          </div>
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

        {/* Footer avec profil utilisateur */}
        <div className="p-4 border-t border-[rgba(var(--accent),0.1)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex-shrink-0 bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              {userName ? (
                <span className="text-white text-xs font-bold">
                  {userName.charAt(0).toUpperCase()}
                </span>
              ) : (
                <LogOut className="w-4 h-4 text-white" />
              )}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-[rgb(var(--foreground))] truncate">
                  {userName || 'Utilisateur'}
                </div>
                <div className="text-[9px] text-[rgb(var(--muted-foreground))]">
                  {role === 'admin' ? 'Direction' :
                   role === 'professeur' ? 'Formateur' : 'Élève'}
                </div>
              </div>
            )}
          </div>
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