/**
 * Modal détaillé d'un formateur avec 6 onglets complets
 * Reprend toute la structure de la page compétences du formateur
 */

'use client'

import { useState, useEffect } from 'react'
import { X, User, Award, GraduationCap, BookOpen, BarChart, FolderOpen, Star, Calendar, Users, Clock, Mail } from 'lucide-react'
import { FormateurProfilTab } from './formateur-tabs/FormateurProfilTab'
import { FormateurCompetencesTab } from './formateur-tabs/FormateurCompetencesTab'
import { FormateurExpertiseTab } from './formateur-tabs/FormateurExpertiseTab'
import { FormateurMaintienTab } from './formateur-tabs/FormateurMaintienTab'
import { FormateurTracabiliteTab } from './formateur-tabs/FormateurTracabiliteTab'
import { FormateurDocumentsTab } from './formateur-tabs/FormateurDocumentsTab'
import { EnvoyerMessageFormateurModal } from './EnvoyerMessageFormateurModal'

interface FormateurDetailModalProps {
  formateurId: number
  onClose: () => void
}

type TabKey = 'profil' | 'competences' | 'expertise' | 'maintien' | 'tracabilite' | 'documents'

interface FormateurDetail {
  id: number
  nom: string
  prenom: string
  email: string
  telephone: string
  specialites: string[]
  statut: string
  bio: string | null
  cvUrl: string | null
  qualificationsResume: string | null
  dateValidationQualiopi: string | null
  dossierComplet: boolean
  anneesExperience: number | null
  anneesEnseignement: number | null
  methodesPedagogiques: string | null
  approchePedagogique: string | null
  outilsSupports: string[]
  competencesTechniques: string[]
  portfolio: any | null
  publicationsArticles: string[]
  satisfactionMoyenne: number | null
  tauxReussite: number | null
  nombreElevesFormes: number | null
  temoignagesEleves: any | null
  formationsContinues: any | null
  certifications: any | null
  languesParlees: string[]
  tarifJournalier: number
  elevesActifs: number
  sessionsActives: number
  heuresHebdo: number
  tauxHoraire: number
  conformeQualiopi: boolean
  documentsManquants: number
  sessions: Array<{
    id: number
    nomSession: string
    formation: string
    dateDebut: string
    dateFin: string
    nbEleves: number
    statut: string
  }>
  eleves: Array<{
    id: number
    nom: string
    prenom: string
    formation: string
    moyenne: number
    progression: number
    absences: number
  }>
  interventions: Array<{
    date: string
    duree: number
    session: string
    cout: number
    payee: boolean
  }>
  documents: Array<{
    id: number
    codeTypeDocument: string
    type: string
    libelle: string
    statut: string
    dateExpiration: string | null
    obligatoire: boolean
    typeDocument?: {
      libelle: string
      obligatoire: boolean
      description?: string
      categorie?: string
    }
    nomFichier?: string
    dateDocument?: string
    dateValidation?: string
    motifRejet?: string
    urlFichier?: string
  }>
  formationsEnseignees: number[]
  stats: {
    totalEleves: number
    heuresMois: number
    caMois: number
    tauxPresence: number
    documentsValides: number
    documentsTotal: number
  }
}

export function FormateurDetailModal({ formateurId, onClose }: FormateurDetailModalProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('profil')
  const [formateur, setFormateur] = useState<FormateurDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEnvoyerMessageModal, setShowEnvoyerMessageModal] = useState(false)

  useEffect(() => {
    fetchFormateurDetail()
  }, [formateurId])

  const fetchFormateurDetail = async () => {
    try {
      const response = await fetch(`/api/formateurs/${formateurId}`)
      if (!response.ok) throw new Error('Erreur lors de la récupération')
      const data = await response.json()
      setFormateur(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-[rgb(var(--card))] rounded-lg p-8">
          <div className="animate-pulse">Chargement...</div>
        </div>
      </div>
    )
  }

  if (error || !formateur) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-[rgb(var(--card))] rounded-lg p-8">
          <p className="text-[rgb(var(--error))]">{error}</p>
          <button onClick={onClose} className="mt-4 btn btn-secondary">
            Fermer
          </button>
        </div>
      </div>
    )
  }

  const tabs = [
    { key: 'profil' as TabKey, label: 'Profil', icon: User },
    { key: 'competences' as TabKey, label: 'Compétences & Qualifications', icon: Award },
    { key: 'expertise' as TabKey, label: 'Expertise & Méthodes', icon: GraduationCap },
    { key: 'maintien' as TabKey, label: 'Maintien des Compétences', icon: BookOpen },
    { key: 'tracabilite' as TabKey, label: 'Traçabilité Pédagogique', icon: BarChart },
    { key: 'documents' as TabKey, label: 'Documents & Justificatifs', icon: FolderOpen }
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-7xl h-[95vh] flex flex-col">
        {/* Header avec stats */}
        <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-6">
              {/* Placeholder photo - Rectangle pointillé */}
              <div className="w-20 h-20 rounded-lg border-2 border-dashed border-[rgba(var(--accent),0.4)] bg-[rgba(var(--accent),0.05)] flex items-center justify-center">
                <User className="w-8 h-8 text-[rgba(var(--accent),0.3)]" />
              </div>

              {/* Infos principales */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">
                  {formateur.prenom} {formateur.nom}
                </h2>
                <p className="text-[rgb(var(--muted-foreground))] mt-1">
                  {formateur.specialites?.join(' • ')}
                </p>
                <div className="flex items-center gap-4 mt-3">
                  <span className="text-sm text-[rgb(var(--text-tertiary))]">
                    <Users className="inline w-4 h-4 mr-1" />
                    {formateur.elevesActifs || 0} élèves actifs
                  </span>
                  <span className="text-sm text-[rgb(var(--text-tertiary))]">
                    <Calendar className="inline w-4 h-4 mr-1" />
                    {formateur.anneesEnseignement || 0} ans d'enseignement
                  </span>
                  <span className="text-sm text-[rgb(var(--text-tertiary))]">
                    <Star className="inline w-4 h-4 mr-1 text-[rgb(var(--accent))]" />
                    {formateur.satisfactionMoyenne || 0}/5
                  </span>
                </div>
              </div>
            </div>

            {/* Boutons actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEnvoyerMessageModal(true)}
                className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Envoyer un mail
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-3">
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Sessions actives</p>
              <p className="text-lg font-bold text-[rgb(var(--foreground))] mt-1">
                {formateur.sessionsActives || 0}
              </p>
            </div>
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-3">
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Heures/semaine</p>
              <p className="text-lg font-bold text-[rgb(var(--accent))] mt-1">
                {formateur.heuresHebdo || 0}h
              </p>
            </div>
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-3">
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Taux horaire</p>
              <p className="text-lg font-bold text-[rgb(var(--foreground))] mt-1">
                {(formateur.tauxHoraire || 0).toFixed(0)}€
              </p>
            </div>
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-3">
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Taux réussite</p>
              <p className="text-lg font-bold text-[rgb(var(--success))] mt-1">
                {formateur.tauxReussite || 0}%
              </p>
            </div>
            <div className="bg-[rgb(var(--secondary))] rounded-lg p-3">
              <p className="text-xs text-[rgb(var(--muted-foreground))]">Documents Qualiopi</p>
              <p className={`text-lg font-bold mt-1 ${formateur.conformeQualiopi ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'}`}>
                {formateur.documents ? `${formateur.documents.filter((d) => d.statut === 'VALIDE').length}/${formateur.documents.length}` : '0/0'}
              </p>
            </div>
          </div>

          {/* Onglets en forme de dossier */}
          <div className="flex gap-1 pt-4">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative px-6 py-3 rounded-t-lg font-medium text-sm transition-all
                    ${isActive
                      ? 'bg-[rgb(var(--card))] text-[rgb(var(--accent))] border-t-2 border-[rgb(var(--accent))] -mb-px'
                      : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))] hover:bg-[rgba(var(--accent),0.05)]'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[rgb(var(--accent))]' : ''}`} />
                    <span className="hidden lg:inline">{tab.label}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Contenu des onglets avec hauteur fixe */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'profil' && <FormateurProfilTab formateur={formateur} onRefresh={fetchFormateurDetail} />}
          {activeTab === 'competences' && <FormateurCompetencesTab formateur={formateur} />}
          {activeTab === 'expertise' && <FormateurExpertiseTab formateur={formateur} />}
          {activeTab === 'maintien' && <FormateurMaintienTab formateur={formateur} />}
          {activeTab === 'tracabilite' && <FormateurTracabiliteTab formateur={formateur} />}
          {activeTab === 'documents' && <FormateurDocumentsTab formateur={formateur} onDocumentUploaded={fetchFormateurDetail} />}
        </div>
      </div>

      {/* Modal Envoyer Message */}
      {showEnvoyerMessageModal && formateur && (
        <EnvoyerMessageFormateurModal
          formateur={{
            idFormateur: formateur.id,
            nom: formateur.nom,
            prenom: formateur.prenom,
            email: formateur.email,
            telephone: formateur.telephone
          }}
          onClose={() => setShowEnvoyerMessageModal(false)}
          onSuccess={() => {
            // Optionnel: recharger les données du formateur après envoi
            fetchFormateurDetail()
          }}
        />
      )}
    </div>
  )
}