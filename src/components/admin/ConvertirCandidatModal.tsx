'use client'

import { useState, useEffect } from 'react'
import { X, User, Calendar, GraduationCap, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

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
  const [checkingConversion, setCheckingConversion] = useState(true)
  const [conversionEnCours, setConversionEnCours] = useState(false)
  const [conversionMessage, setConversionMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formData, setFormData] = useState({
    formationRetenue: prospect.formationPrincipale || '',
    sessionVisee: '',
    dateDebutSouhaitee: ''
  })

  // Vérifier si conversion déjà en cours au chargement
  useEffect(() => {
    async function checkConversionStatus() {
      try {
        const response = await fetch(`/api/prospects/${prospect.idProspect}/conversion-status`)
        if (response.ok) {
          const data = await response.json()
          if (data.enCours) {
            setConversionEnCours(true)
            setConversionMessage(data.message)
          }
        }
      } catch (error) {
        console.error('Erreur vérification conversion:', error)
      } finally {
        setCheckingConversion(false)
      }
    }

    checkConversionStatus()
  }, [prospect.idProspect])

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

  // Charger les sessions quand une formation est sélectionnée
  useEffect(() => {
    if (!formData.formationRetenue) {
      setSessions([])
      return
    }

    async function fetchSessions() {
      setLoadingSessions(true)
      try {
        // Trouver l'ID de la formation sélectionnée
        const formation = formations.find(f => f.codeFormation === formData.formationRetenue)
        if (!formation) return

        const response = await fetch(
          `/api/sessions?idFormation=${formation.idFormation}&statutSession=CONFIRMEE,PREVUE,EN_COURS`
        )
        if (response.ok) {
          const data = await response.json()
          setSessions(data.sessions || [])
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

      if (response.status === 202 && result.success) {
        // Conversion lancée avec succès (fire-and-forget)
        setSubmitted(true)
        // Auto-close après 3 secondes
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 3000)
      } else if (response.status === 409) {
        // Conversion déjà en cours
        setConversionEnCours(true)
        setConversionMessage(result.message || 'Une conversion est déjà en cours')
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

  // État de chargement initial
  if (checkingConversion) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--accent))]" />
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Vérification en cours...
          </p>
        </div>
      </div>
    )
  }

  // Conversion déjà en cours
  if (conversionEnCours) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgba(var(--warning),0.1)] rounded-lg">
                <AlertCircle className="w-6 h-6 text-[rgb(var(--warning))]" />
              </div>
              <h2 className="text-lg font-semibold">Conversion en cours</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-6">
            {conversionMessage}
          </p>

          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all"
          >
            Compris
          </button>
        </div>
      </div>
    )
  }

  // Demande envoyée avec succès
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Demande envoyée
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              La demande de conversion de <strong>{prospect.prenom} {prospect.nom}</strong> en candidat a été envoyée à Marjorie.
            </p>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                🔔 Vous serez averti par les notifications lorsque le traitement sera terminé.
              </p>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Fermeture automatique dans 3 secondes...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Formulaire de conversion
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
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Formation */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Formation retenue *
              </label>
              {loadingFormations ? (
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement des formations...
                </div>
              ) : (
                <select
                  value={formData.formationRetenue}
                  onChange={(e) => handleChange('formationRetenue', e.target.value)}
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                  required
                >
                  <option value="">Sélectionner une formation</option>
                  {formations.map((formation) => (
                    <option key={formation.idFormation} value={formation.codeFormation}>
                      {formation.nom}
                      {formation.dureeHeures && ` (${formation.dureeHeures}h)`}
                      {formation.tarifStandard && ` - ${formation.tarifStandard}€`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Session */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Session visée (optionnel)
              </label>
              {loadingSessions ? (
                <div className="flex items-center gap-2 text-sm text-[rgb(var(--muted-foreground))]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Chargement des sessions...
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  {formData.formationRetenue
                    ? 'Aucune session disponible pour cette formation'
                    : 'Sélectionnez une formation pour voir les sessions'}
                </p>
              ) : (
                <select
                  value={formData.sessionVisee}
                  onChange={(e) => handleChange('sessionVisee', e.target.value)}
                  className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                >
                  <option value="">Aucune session spécifique</option>
                  {sessions.map((session) => {
                    const placesRestantes = (session.capaciteMax || 0) - session.nbInscrits
                    const isComplet = placesRestantes <= 0
                    const statusText = isComplet ? ' (COMPLET)' : ` (${placesRestantes} place${placesRestantes > 1 ? 's' : ''})`
                    return (
                      <option key={session.idSession} value={session.nomSession}>
                        {session.nomSession} - {new Date(session.dateDebut).toLocaleDateString('fr-FR')}{statusText}
                      </option>
                    )
                  })}
                </select>
              )}
            </div>

            {/* Date début souhaitée */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de début souhaitée (optionnel)
              </label>
              <input
                type="date"
                value={formData.dateDebutSouhaitee}
                onChange={(e) => handleChange('dateDebutSouhaitee', e.target.value)}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg font-medium transition-all"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.formationRetenue}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours...
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
