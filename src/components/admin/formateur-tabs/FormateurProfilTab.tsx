'use client'

import { useState } from 'react'
import { User, Mail, Phone, MapPin, Award, Calendar, Clock, Briefcase, RefreshCw, CheckCircle, XCircle } from 'lucide-react'

interface FormateurProfilTabProps {
  formateur: any
  onRefresh?: () => void
}

export function FormateurProfilTab({ formateur, onRefresh }: FormateurProfilTabProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleToggleStatut = async () => {
    setLoading(true)
    setMessage(null)

    // Déterminer le nouveau statut selon la logique demandée
    let nouveauStatut: string
    if (formateur.statut === 'EN_COURS_INTEGRATION') {
      nouveauStatut = 'ACTIF'
    } else if (formateur.statut === 'ACTIF') {
      nouveauStatut = 'INACTIF'
    } else {
      // Si INACTIF, on peut réactiver
      nouveauStatut = 'ACTIF'
    }

    // Utiliser l'ID correct (peut être id ou idFormateur)
    const formateurId = formateur.idFormateur || formateur.id

    try {
      const response = await fetch(`/api/formateurs/${formateurId}/statut`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nouveauStatut })
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: data.message })
        // Rafraîchir les données après 1 seconde
        setTimeout(() => {
          if (onRefresh) onRefresh()
          setMessage(null)
        }, 1500)
      } else {
        setMessage({ type: 'error', text: data.error || 'Erreur lors du changement de statut' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur réseau' })
    } finally {
      setLoading(false)
    }
  }

  // Déterminer le texte du bouton selon le statut actuel
  const getButtonText = () => {
    if (formateur.statut === 'EN_COURS_INTEGRATION') {
      return 'Activer le formateur'
    } else if (formateur.statut === 'ACTIF') {
      return 'Désactiver le formateur'
    } else {
      return 'Réactiver le formateur'
    }
  }

  const getButtonIcon = () => {
    if (formateur.statut === 'ACTIF') {
      return <XCircle className="w-5 h-5" />
    }
    return <CheckCircle className="w-5 h-5" />
  }

  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[rgb(var(--accent))]" />
          Informations personnelles
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Nom complet</p>
            <p className="font-medium">{formateur.prenom} {formateur.nom}</p>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Statut actuel</p>
            <span className={`badge ${formateur.statut === 'ACTIF' ? 'badge-success' : 'badge-warning'}`}>
              {formateur.statut}
            </span>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Email</p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
              {formateur.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Téléphone</p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
              {formateur.telephone || 'Non renseigné'}
            </p>
          </div>
        </div>

        {/* Gros bouton de gestion du statut */}
        <div className="mt-6 p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[rgb(var(--foreground))]">Gestion du statut du formateur</p>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                {formateur.statut === 'EN_COURS_INTEGRATION' && 'Activer ce formateur pour qu\'il puisse commencer à enseigner'}
                {formateur.statut === 'ACTIF' && 'Désactiver ce formateur s\'il n\'est plus disponible'}
                {formateur.statut === 'INACTIF' && 'Réactiver ce formateur pour qu\'il puisse à nouveau enseigner'}
              </p>
            </div>
            <button
              onClick={handleToggleStatut}
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-semibold text-base flex items-center gap-3 transition-all min-w-[240px] justify-center ${
                formateur.statut === 'ACTIF'
                  ? 'bg-[rgb(var(--error))] text-white hover:opacity-90'
                  : 'bg-[rgb(var(--success))] text-white hover:opacity-90'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                getButtonIcon()
              )}
              {getButtonText()}
            </button>
          </div>
          {message && (
            <div className={`mt-3 text-sm px-4 py-2 rounded-lg ${
              message.type === 'success'
                ? 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))] border border-[rgba(var(--success),0.3)]'
                : 'bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))] border border-[rgba(var(--error),0.3)]'
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </div>

      {/* Expérience */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
          Expérience professionnelle
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience métier</p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.anneesExperience || 0}
              <span className="text-sm ml-1">ans</span>
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience enseignement</p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.anneesEnseignement || 0}
              <span className="text-sm ml-1">ans</span>
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Élèves formés</p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
              {formateur.nombreElevesFormes || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {formateur.bio && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[rgb(var(--accent))]" />
            Biographie
          </h3>
          <p className="text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
            {formateur.bio}
          </p>
        </div>
      )}

      {/* Spécialités */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Spécialités</h3>
        <div className="flex flex-wrap gap-2">
          {formateur.specialites?.map((spec: string) => (
            <span key={spec} className="badge badge-info">
              {spec.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Langues parlées */}
      {formateur.languesParlees && formateur.languesParlees.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Langues parlées</h3>
          <div className="flex flex-wrap gap-2">
            {formateur.languesParlees.map((langue: string) => (
              <span key={langue} className="badge">
                {langue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tarification */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tarification</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Tarif journalier</p>
            <p className="text-xl font-bold">
              {formateur.tarifJournalier || 0}€
              <span className="text-sm font-normal ml-1">/jour</span>
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Taux horaire calculé</p>
            <p className="text-xl font-bold text-[rgb(var(--accent))]">
              {(formateur.tauxHoraire || 0).toFixed(0)}€
              <span className="text-sm font-normal ml-1">/heure</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}