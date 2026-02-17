'use client'

import { useState, useEffect } from 'react'
import { X, User, Calendar, GraduationCap, Loader2 } from 'lucide-react'

interface ConvertirCandidatModalProps {
  prospect: {
    idProspect: string
    nom: string
    prenom: string
    email: string
    formationPrincipale?: string
  }
  onClose: () => void
  onSuccess: () => void
}

interface Formation {
  idFormation: number
  codeFormation: string
  nom: string
  dureeHeures?: number
  tarifStandard?: number
}

interface Session {
  idSession: number
  nomSession: string
  dateDebut: string
  dateFin: string
  capaciteMax?: number
  nbInscrits: number
}

export function ConvertirCandidatModal({
  prospect,
  onClose,
  onSuccess
}: ConvertirCandidatModalProps) {
  const [formations, setFormations] = useState<Formation[]>([])
  const [sessions, setSessions] = useState<Session[]>([])
  const [loadingFormations, setLoadingFormations] = useState(true)
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    formationRetenue: prospect.formationPrincipale || '',
    sessionVisee: '',
    dateDebutSouhaitee: ''
  })

  // Charger les formations disponibles
  useEffect(() => {
    async function fetchFormations() {
      try {
        const response = await fetch('/api/formations?actif=true')
        if (response.ok) {
          const data = await response.json()
          setFormations(data.formations || [])
        }
      } catch (error) {
        console.error('Erreur chargement formations:', error)
      } finally {
        setLoadingFormations(false)
      }
    }

    fetchFormations()
  }, [])

  // Charger les sessions disponibles quand une formation est sélectionnée
  useEffect(() => {
    if (!formData.formationRetenue) {
      setSessions([])
      return
    }

    async function fetchSessions() {
      setLoadingSessions(true)
      try {
        const formation = formations.find(f => f.codeFormation === formData.formationRetenue)
        if (formation) {
          const response = await fetch(`/api/sessions?idFormation=${formation.idFormation}&statutSession=CONFIRMEE,PREVUE`)
          if (response.ok) {
            const data = await response.json()
            setSessions(data.sessions || [])
          }
        }
      } catch (error) {
        console.error('Erreur chargement sessions:', error)
      } finally {
        setLoadingSessions(false)
      }
    }

    fetchSessions()
  }, [formData.formationRetenue, formations])

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Reset session si on change de formation
    if (field === 'formationRetenue') {
      setFormData(prev => ({ ...prev, sessionVisee: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.formationRetenue) {
      alert('Veuillez sélectionner une formation')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/prospects/convertir-candidat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idProspect: prospect.idProspect,
          formationRetenue: formData.formationRetenue,
          sessionVisee: formData.sessionVisee || undefined,
          dateDebutSouhaitee: formData.dateDebutSouhaitee || undefined
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        onSuccess()
        onClose()
      } else {
        alert(result.error || 'Erreur lors de la conversion')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la conversion en candidat')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <User className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Convertir en candidat
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {prospect.prenom} {prospect.nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Formation */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <GraduationCap className="w-4 h-4" />
                Formation souhaitée *
              </label>

              {loadingFormations ? (
                <div className="flex items-center gap-2 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">
                    Chargement des formations...
                  </span>
                </div>
              ) : (
                <select
                  value={formData.formationRetenue}
                  onChange={(e) => handleChange('formationRetenue', e.target.value)}
                  required
                  disabled={submitting}
                  className="w-full px-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                >
                  <option value="">Sélectionner une formation</option>
                  {formations.map(formation => (
                    <option key={formation.idFormation} value={formation.codeFormation}>
                      {formation.nom}
                      {formation.dureeHeures && ` (${formation.dureeHeures}h)`}
                      {formation.tarifStandard && ` - ${formation.tarifStandard}€`}
                    </option>
                  ))}
                </select>
              )}

              {formData.formationRetenue && formations.length > 0 && (
                <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
                  Formation sélectionnée : {formations.find(f => f.codeFormation === formData.formationRetenue)?.nom}
                </p>
              )}
            </div>

            {/* Session */}
            {formData.formationRetenue && (
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                  <Calendar className="w-4 h-4" />
                  Session visée (optionnel)
                </label>

                {loadingSessions ? (
                  <div className="flex items-center gap-2 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      Chargement des sessions...
                    </span>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="p-3 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg">
                    <p className="text-sm text-[rgb(var(--warning))]">
                      Aucune session disponible pour cette formation
                    </p>
                  </div>
                ) : (
                  <select
                    value={formData.sessionVisee}
                    onChange={(e) => handleChange('sessionVisee', e.target.value)}
                    disabled={submitting}
                    className="w-full px-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  >
                    <option value="">Aucune session précise</option>
                    {sessions.map(session => {
                      const placesRestantes = (session.capaciteMax || 0) - session.nbInscrits
                      const complet = placesRestantes <= 0

                      return (
                        <option
                          key={session.idSession}
                          value={session.nomSession}
                          disabled={complet}
                        >
                          {session.nomSession} - {new Date(session.dateDebut).toLocaleDateString('fr-FR')}
                          {complet ? ' (COMPLET)' : ` (${placesRestantes} places)`}
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>
            )}

            {/* Date de début souhaitée */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <Calendar className="w-4 h-4" />
                Date de début souhaitée (optionnel)
              </label>
              <input
                type="date"
                value={formData.dateDebutSouhaitee}
                onChange={(e) => handleChange('dateDebutSouhaitee', e.target.value)}
                disabled={submitting}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              />
              <p className="mt-2 text-xs text-[rgb(var(--muted-foreground))]">
                Si vous ne sélectionnez pas de session, indiquez une période souhaitée
              </p>
            </div>

            {/* Information */}
            <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
              <p className="text-sm text-[rgb(var(--foreground))]">
                <strong>⚠️ Action importante :</strong> Cette action va :
              </p>
              <ul className="mt-2 space-y-1 text-sm text-[rgb(var(--muted-foreground))]">
                <li>• Créer un dossier candidat dans la base de données</li>
                <li>• Générer un numéro de dossier unique</li>
                <li>• Créer les dossiers Google Drive pour les documents</li>
                <li>• Changer le statut du prospect en "CANDIDAT"</li>
                <li>• Envoyer une notification à l'équipe admin</li>
              </ul>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg transition-colors text-[rgb(var(--foreground))]"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.formationRetenue}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conversion en cours...
                </>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  Convertir en candidat
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
