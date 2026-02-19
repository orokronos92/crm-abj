/**
 * CandidatDetailModal
 * Modal avec onglets affichant les détails complets d'un candidat
 */

'use client'

import { useState, useEffect } from 'react'
import {
  X,
  FileText,
  Target,
  FolderOpen,
  Euro,
  Sparkles,
  Mail,
  Phone,
  MessageSquare,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Download,
  Send,
  User
} from 'lucide-react'
import { STATUT_DOSSIER_COLORS, STATUT_FINANCEMENT_COLORS } from '@/services/candidat.service'
import { EnvoyerMessageCandidatModal } from './EnvoyerMessageCandidatModal'
import { GenererDevisCandidatModal } from './GenererDevisCandidatModal'
import { useActionNotification } from '@/hooks/use-action-notification'

interface CandidatDetail {
  id: number
  numero_dossier: string
  nom: string
  prenom: string
  email: string
  telephone: string
  formation: string
  session: string
  statut_dossier: string
  statut_financement: string
  score: number
  nb_echanges: number
  date_candidature: string
  dernier_contact: string
  // Parcours
  entretien_telephonique: boolean
  date_entretien_tel: string | null
  rdv_presentiel: boolean
  date_rdv_presentiel: string | null
  test_technique: boolean
  date_test_technique: string | null
  validation_pedagogique: boolean
  date_validation_pedagogique: string | null
  // Financement
  mode_financement: string
  montant_total: number
  montant_pec: number
  reste_a_charge: number
  // Documents
  documents: Array<{
    id: number
    type: string
    statut: string
    nom_fichier: string
    obligatoire: boolean
  }>
  // Notes IA
  notes_ia: string
}

interface CandidatDetailModalProps {
  candidatId: number
  onClose: () => void
}

const STATUT_DOCUMENT_COLORS: Record<string, string> = {
  VALIDE: 'text-[rgb(var(--success))]',
  RECU: 'text-[rgb(var(--info))]',
  ATTENDU: 'text-[rgb(var(--warning))]',
  A_VALIDER: 'text-[rgb(var(--warning))]',
  REFUSE: 'text-[rgb(var(--error))]'
}

export function CandidatDetailModal({ candidatId, onClose }: CandidatDetailModalProps) {
  const [candidat, setCandidat] = useState<CandidatDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [showEnvoyerMessageModal, setShowEnvoyerMessageModal] = useState(false)
  const [showGenererDevisModal, setShowGenererDevisModal] = useState(false)
  const [validatingEtape, setValidatingEtape] = useState<string | null>(null)
  const { createActionNotification } = useActionNotification()

  useEffect(() => {
    async function fetchCandidat() {
      try {
        setLoading(true)
        const res = await fetch(`/api/candidats/${candidatId}`)
        if (!res.ok) throw new Error('Erreur chargement candidat')
        const data = await res.json()
        setCandidat(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidat()
  }, [candidatId])

  const handleEnvoyerMessageSuccess = async () => {
    // Recharger les données du candidat après envoi message
    const res = await fetch(`/api/candidats/${candidatId}`)
    if (res.ok) {
      const data = await res.json()
      setCandidat(data)
    }
  }

  const handleGenererDevisSuccess = async () => {
    // Recharger les données du candidat après génération devis
    const res = await fetch(`/api/candidats/${candidatId}`)
    if (res.ok) {
      const data = await res.json()
      setCandidat(data)
    }
  }

  const handleValiderEtape = async (etape: string) => {
    if (!candidat) return

    setValidatingEtape(etape)

    try {
      // 1. Créer vraie notification en BDD
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'CANDIDAT',
        type: 'VALIDATION_ETAPE',
        priorite: 'NORMALE',
        titre: `Étape ${etape} validée pour ${candidat.prenom} ${candidat.nom}`,
        message: `Validation étape ${etape} - Dossier ${candidat.numero_dossier}`,
        entiteType: 'candidat',
        entiteId: candidat.id.toString(),
        actionRequise: true,
        typeAction: 'VALIDER'
      })

      // 2. Construire le payload enrichi
      const payload = {
        // === IDENTIFICATION ACTION ===
        actionType: 'VALIDER_ETAPE_CANDIDAT',
        actionSource: 'admin.candidats.detail',
        actionButton: 'valider_etape',

        // === CONTEXTE MÉTIER ===
        entiteType: 'candidat',
        entiteId: candidat.id.toString(),
        entiteData: {
          idCandidat: candidat.id,
          numeroDossier: candidat.numero_dossier,
          nom: candidat.nom,
          prenom: candidat.prenom,
          email: candidat.email,
          telephone: candidat.telephone,
          formation: candidat.formation
        },

        // === DÉCISION UTILISATEUR ===
        decidePar: currentUserId,
        decisionType: 'validation_etape',
        commentaire: `Validation étape : ${etape}`,

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          etape: etape,
          numeroDossier: candidat.numero_dossier,
          statutDossier: candidat.statut_dossier
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          callbackUrl: `${window.location.origin}/api/webhook/callback`,
          updateNotification: true,
          expectedResponse: 'etape_validated',
          timeoutSeconds: 30
        }
      }

      const response = await fetch(`/api/notifications/${notificationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        // Recharger les données du candidat
        const res = await fetch(`/api/candidats/${candidatId}`)
        if (res.ok) {
          const data = await res.json()
          setCandidat(data)
        }
      } else {
        alert(result.error || 'Erreur lors de la validation de l\'étape')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la validation de l\'étape')
    } finally {
      setValidatingEtape(null)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[rgb(var(--success))]'
    if (score >= 60) return 'text-[rgb(var(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[rgb(var(--card))] rounded-xl p-12 shadow-2xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[rgb(var(--accent))] mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!candidat) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col border border-[rgba(var(--accent),0.2)]">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg border-2 border-dashed border-[rgba(var(--accent),0.4)] bg-[rgba(var(--accent),0.05)] flex items-center justify-center">
                <User className="w-8 h-8 text-[rgba(var(--accent),0.3)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">
                  {candidat.prenom} {candidat.nom}
                </h2>
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                  N° {candidat.numero_dossier}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
            >
              <X className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
            </button>
          </div>

          {/* Onglets en forme de dossier */}
          <div className="flex gap-1 mt-4 pt-4">
            {[
              { id: 'general', label: 'Général', icon: FileText },
              { id: 'parcours', label: 'Parcours', icon: Target },
              { id: 'documents', label: 'Documents', icon: FolderOpen },
              { id: 'financement', label: 'Financement', icon: Euro },
              { id: 'notes_ia', label: 'Notes IA', icon: Sparkles }
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                    {tab.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Tab Général */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Infos contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-[rgb(var(--accent))]" />
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Email</p>
                    <p className="text-base text-[rgb(var(--foreground))]">{candidat.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-[rgb(var(--accent))]" />
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Téléphone</p>
                    <p className="text-base text-[rgb(var(--foreground))]">{candidat.telephone}</p>
                  </div>
                </div>
              </div>

              {/* Badges statuts */}
              <div className="flex gap-3">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUT_DOSSIER_COLORS[candidat.statut_dossier as keyof typeof STATUT_DOSSIER_COLORS] || 'badge-info'}`}>
                  {candidat.statut_dossier.replace(/_/g, ' ')}
                </span>
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUT_FINANCEMENT_COLORS[candidat.statut_financement as keyof typeof STATUT_FINANCEMENT_COLORS] || 'badge-warning'}`}>
                  {candidat.statut_financement.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[rgb(var(--secondary))] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
                    <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))]" />
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Score</p>
                    <p className={`text-lg font-bold ${getScoreColor(candidat.score)}`}>
                      {candidat.score}/100
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
                    <MessageSquare className="w-5 h-5 text-[rgb(var(--accent))]" />
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Échanges</p>
                    <p className="text-lg font-bold text-[rgb(var(--foreground))]">
                      {candidat.nb_echanges}
                    </p>
                  </div>
                </div>
              </div>

              {/* Infos formation */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-[rgb(var(--secondary))] rounded-lg">
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formation</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {candidat.formation}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Session</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {candidat.session}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Date candidature</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {candidat.date_candidature}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab Parcours */}
          {activeTab === 'parcours' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">
                Parcours d'admission
              </h3>
              {[
                { key: 'entretien_telephonique', label: 'Entretien téléphonique', date: candidat.date_entretien_tel },
                { key: 'rdv_presentiel', label: 'RDV présentiel', date: candidat.date_rdv_presentiel },
                { key: 'test_technique', label: 'Test technique', date: candidat.date_test_technique },
                { key: 'validation_pedagogique', label: 'Validation pédagogique', date: candidat.date_validation_pedagogique }
              ].map((etape) => {
                const done = candidat[etape.key as keyof CandidatDetail] as boolean
                return (
                  <div
                    key={etape.key}
                    className="flex items-center justify-between p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]"
                  >
                    <div className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle className="w-5 h-5 text-[rgb(var(--success))]" />
                      ) : (
                        <Clock className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
                      )}
                      <div>
                        <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                          {etape.label}
                        </span>
                        {etape.date && (
                          <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))] mt-1">
                            <Calendar className="w-3 h-3" />
                            {etape.date}
                          </div>
                        )}
                      </div>
                    </div>

                    {done ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)]">
                        <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                        <span className="text-sm font-medium text-[rgb(var(--success))]">
                          Étape validée
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleValiderEtape(etape.key)}
                        disabled={validatingEtape === etape.key}
                        className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--accent-light))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {validatingEtape === etape.key ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
                            Validation...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Valider l'étape
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab Documents */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">
                Documents ({candidat.documents.length})
              </h3>
              {candidat.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]"
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {doc.type.replace(/_/g, ' ')}
                      {doc.obligatoire && <span className="text-[rgb(var(--error))] ml-1">*</span>}
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                      {doc.nom_fichier}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${STATUT_DOCUMENT_COLORS[doc.statut] || 'text-[rgb(var(--muted-foreground))]'}`}>
                    {doc.statut}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Tab Financement */}
          {activeTab === 'financement' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">
                Détail financier
              </h3>
              <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg space-y-4">
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Mode de financement</p>
                  <p className="text-base font-medium text-[rgb(var(--foreground))]">
                    {candidat.mode_financement}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[rgba(var(--border),0.3)]">
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Montant total</p>
                    <p className="text-lg font-bold text-[rgb(var(--foreground))]">
                      {candidat.montant_total.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Prise en charge</p>
                    <p className="text-lg font-bold text-[rgb(var(--success))]">
                      {candidat.montant_pec.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Reste à charge</p>
                    <p className="text-lg font-bold text-[rgb(var(--warning))]">
                      {candidat.reste_a_charge.toLocaleString('fr-FR')} €
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Notes IA */}
          {activeTab === 'notes_ia' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
                Analyse Marjorie
              </h3>
              <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
                <p className="text-sm text-[rgb(var(--foreground))] leading-relaxed">
                  {candidat.notes_ia || 'Aucune analyse disponible pour ce candidat.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowEnvoyerMessageModal(true)}
              className="px-4 py-2 bg-[rgb(var(--warning))] text-[rgb(var(--primary))] rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Envoyer un mail
            </button>
            <button
              onClick={() => setShowGenererDevisModal(true)}
              className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer devis
            </button>
          </div>
        </div>
      </div>

      {/* Modal Envoyer Message */}
      {showEnvoyerMessageModal && candidat && (
        <EnvoyerMessageCandidatModal
          candidat={{
            idCandidat: candidat.id,
            numeroDossier: candidat.numero_dossier,
            nom: candidat.nom,
            prenom: candidat.prenom,
            email: candidat.email,
            telephone: candidat.telephone,
            formation: candidat.formation
          }}
          onClose={() => setShowEnvoyerMessageModal(false)}
          onSuccess={handleEnvoyerMessageSuccess}
        />
      )}

      {/* Modal Générer Devis */}
      {showGenererDevisModal && candidat && (
        <GenererDevisCandidatModal
          candidat={{
            idCandidat: candidat.id,
            numeroDossier: candidat.numero_dossier,
            nom: candidat.nom,
            prenom: candidat.prenom,
            email: candidat.email,
            telephone: candidat.telephone,
            formation: candidat.formation
          }}
          onClose={() => setShowGenererDevisModal(false)}
          onSuccess={handleGenererDevisSuccess}
        />
      )}
    </div>
  )
}
