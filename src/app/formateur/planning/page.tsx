/**
 * Page Planning Formateur — Tableau de bord
 * Connecté à la BDD via /api/formateur/planning
 */

'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Calendar, Users, Clock, BookOpen, Award } from 'lucide-react'

interface SessionFormateur {
  id: number
  nomSession: string
  formation: string
  dateDebut: string
  dateFin: string
  salle: string
  nbInscrits: number
  capaciteMax: number | null
  statut: string
  filtre: 'EN_COURS' | 'A_VENIR' | 'TERMINE'
  dureeHeures: number | null
}

interface Stats {
  sessionsEnCours: number
  sessionsAVenir: number
  totalEleves: number
  heuresMois: number
}

export default function FormateurPlanning() {
  const [sessions, setSessions] = useState<SessionFormateur[]>([])
  const [stats, setStats] = useState<Stats>({ sessionsEnCours: 0, sessionsAVenir: 0, totalEleves: 0, heuresMois: 0 })
  const [filtreActif, setFiltreActif] = useState<'EN_COURS' | 'A_VENIR'>('EN_COURS')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/formateur/planning')
        const data = await res.json()
        if (data.success) {
          setSessions(data.sessions)
          setStats(data.stats)
        }
      } catch (error) {
        console.error('Erreur chargement planning:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const sessionsFiltrees = sessions.filter((s) => s.filtre === filtreActif)

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getStatutStyle = (statut: string) => {
    switch (statut) {
      case 'CONFIRMEE':
      case 'EN_COURS':
        return 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] border border-[rgba(var(--success),0.3)]'
      case 'PREVUE':
        return 'bg-[rgba(var(--info),0.1)] text-[rgb(var(--info))] border border-[rgba(var(--info),0.3)]'
      default:
        return 'bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))] border border-[rgba(var(--warning),0.3)]'
    }
  }

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      CONFIRMEE: 'Confirmée',
      EN_COURS: 'En cours',
      PREVUE: 'Prévue',
      EN_ATTENTE: 'En attente',
    }
    return labels[statut] || statut
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--foreground))] mb-2">
          Tableau de bord
        </h1>
        <p className="text-[rgb(var(--muted-foreground))]">
          Bienvenue dans votre espace formateur
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="w-8 h-8 text-[rgb(var(--accent))]" />
            <span className="text-xs text-[rgb(var(--success))]">En cours</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {loading ? '—' : stats.sessionsEnCours}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Sessions en cours</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-[rgb(var(--info))]" />
            <span className="text-xs text-[rgb(var(--accent))]">Actifs</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {loading ? '—' : stats.totalEleves}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Élèves totaux</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Award className="w-8 h-8 text-[rgb(var(--success))]" />
            <span className="text-xs text-[rgb(var(--warning))]">À venir</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {loading ? '—' : stats.sessionsAVenir}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Sessions à venir</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-[rgb(var(--warning))]" />
            <span className="text-xs text-[rgb(var(--muted-foreground))]">Ce mois</span>
          </div>
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
            {loading ? '—' : `${stats.heuresMois}h`}
          </p>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">Heures de formation</p>
        </div>
      </div>

      {/* Mes Sessions */}
      <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl">
        <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
          <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">Mes sessions</h2>
        </div>

        {/* Onglets */}
        <div className="p-4 border-b border-[rgba(var(--border),0.3)]">
          <div className="card p-1">
            <div className="flex gap-2">
              <button
                onClick={() => setFiltreActif('EN_COURS')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  filtreActif === 'EN_COURS'
                    ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                    : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Sessions en cours</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    filtreActif === 'EN_COURS'
                      ? 'bg-[rgba(var(--primary),0.2)] text-[rgb(var(--primary))]'
                      : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]'
                  }`}>
                    {stats.sessionsEnCours}
                  </span>
                </div>
              </button>
              <button
                onClick={() => setFiltreActif('A_VENIR')}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  filtreActif === 'A_VENIR'
                    ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))]'
                    : 'text-[rgb(var(--muted-foreground))] hover:bg-[rgb(var(--secondary))]'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Sessions à venir</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    filtreActif === 'A_VENIR'
                      ? 'bg-[rgba(var(--primary),0.2)] text-[rgb(var(--primary))]'
                      : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))]'
                  }`}>
                    {stats.sessionsAVenir}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Liste sessions */}
        <div className="p-6 space-y-4">
          {loading ? (
            <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
              <Calendar className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              <p className="text-sm">Chargement des sessions...</p>
            </div>
          ) : sessionsFiltrees.length === 0 ? (
            <div className="text-center py-8 text-[rgb(var(--muted-foreground))]">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">
                {filtreActif === 'EN_COURS' ? 'Aucune session en cours' : 'Aucune session à venir'}
              </p>
            </div>
          ) : (
            sessionsFiltrees.map((session) => (
              <div
                key={session.id}
                className="card p-6 hover:border-[rgb(var(--accent))] cursor-pointer transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-7 h-7 text-[rgb(var(--primary))]" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-1">
                          {session.nomSession}
                        </h3>
                        <p className="text-sm text-[rgb(var(--muted-foreground))]">
                          {formatDate(session.dateDebut)} → {formatDate(session.dateFin)}
                        </p>
                      </div>
                      <span className={`px-4 py-1.5 text-sm rounded-full ${getStatutStyle(session.statut)}`}>
                        {getStatutLabel(session.statut)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[rgb(var(--accent))]" />
                        <div>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Salle</p>
                          <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                            {session.salle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                        <div>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Élèves</p>
                          <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                            {session.nbInscrits}{session.capaciteMax ? ` / ${session.capaciteMax}` : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[rgb(var(--accent))]" />
                        <div>
                          <p className="text-xs text-[rgb(var(--muted-foreground))]">Durée</p>
                          <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                            {session.dureeHeures ? `${session.dureeHeures}h` : '—'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
