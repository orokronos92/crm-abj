/**
 * Layout principal pour les dashboards
 * Intègre sidebar et header
 */

'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Sidebar } from './sidebar'
import { Bell, Search, Sun, Moon, LogOut } from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession()
  const [darkMode, setDarkMode] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)

  const userRole = session?.user?.role || 'admin'
  const userName = `${session?.user?.prenom || ''} ${session?.user?.nom || ''}`.trim()

  return (
    <>
      {/* Layout principal */}
      <div className="flex min-h-screen bg-[rgb(var(--background))]">
        {/* Sidebar */}
        <Sidebar role={userRole as any} userName={userName} />

        {/* Main content */}
        <div className="flex-1 lg:ml-64">
          {/* Header */}
          <header className="sticky top-0 z-30 h-16 bg-[rgb(var(--card))]/80 backdrop-blur-xl border-b border-[rgba(var(--accent),0.1)]">
            <div className="flex h-full items-center justify-between px-6">
              {/* Barre de recherche */}
              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))] focus:border-[rgb(var(--accent))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--accent),0.2)] transition-all"
                  />
                </div>
              </div>

              {/* Actions header */}
              <div className="flex items-center gap-4 ml-4">
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                  <Bell className="w-5 h-5 text-[rgb(var(--foreground))]" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-[rgb(var(--accent))] rounded-full animate-pulse" />
                </button>

                {/* Theme toggle */}
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5 text-[rgb(var(--foreground))]" />
                  ) : (
                    <Moon className="w-5 h-5 text-[rgb(var(--foreground))]" />
                  )}
                </button>

                {/* User menu avec déconnexion */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowUserMenu(!showUserMenu)
                    }}
                    className="flex items-center gap-3 pl-4 border-l border-[rgba(var(--border),0.3)] hover:bg-[rgba(var(--accent),0.05)] rounded-lg p-2 transition-colors"
                  >
                    <div className="text-right">
                      <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                        {userName || 'Utilisateur'}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {userRole === 'admin' ? 'Administrateur' :
                          userRole === 'professeur' ? 'Formateur' : 'Élève'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                      {userName?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  </button>

                  {/* Menu déroulant */}
                  {showUserMenu && session && (
                    <div className="absolute right-0 mt-2 w-64 bg-[rgb(var(--card))] border border-[rgba(var(--accent),0.2)] rounded-lg shadow-xl z-50 animate-fadeIn">
                      <div className="p-4 border-b border-[rgba(var(--border),0.3)]">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">{userName}</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))]">{session.user.email}</p>
                      </div>

                      {/* Info compte démo */}
                      <div className="p-3 bg-[rgba(var(--accent),0.05)] border-b border-[rgba(var(--border),0.3)]">
                        <p className="text-xs text-[rgb(var(--accent))]">Mode démo</p>
                        <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                          Comptes disponibles :
                        </p>
                        <ul className="text-xs text-[rgb(var(--muted-foreground))] mt-2 space-y-1">
                          <li>• admin@abj.fr (Admin)</li>
                          <li>• formateur@abj.fr (Formateur)</li>
                          <li>• eleve@abj.fr (Élève)</li>
                        </ul>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            sessionStorage.removeItem('hasSeenSplash')
                            signOut({ callbackUrl: '/connexion' })
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[rgba(var(--error),0.1)] transition-colors group"
                        >
                          <LogOut className="w-4 h-4 text-[rgb(var(--error))]" />
                          <span className="text-sm text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--error))]">
                            Se déconnecter
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="p-6">
            <div className="animate-fadeIn">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  )
}