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
  User,
  GraduationCap
} from 'lucide-react'
import { STATUT_DOSSIER_COLORS, STATUT_FINANCEMENT_COLORS } from '@/services/candidat.service'
import { EnvoyerMessageCandidatModal } from './EnvoyerMessageCandidatModal'
import { GenererDevisCandidatModal } from './GenererDevisCandidatModal'
import type { FormationCatalogue } from './GenererDevisModal'
import { ValiderEtapeModal, type EtapeType } from './ValiderEtapeModal'
import { ConvertirEleveModal } from './ConvertirEleveModal'
import { RefuserCandidatModal } from './RefuserCandidatModal'
import { DocumentsOnglet } from './DocumentsOnglet'

interface SessionOption {
  idSession: number
  nomSession: string
  dateDebut: string
  dateFin: string
  capaciteMax: number
  nbInscrits: number
}

interface CandidatDetail {
  id: number
  id_prospect: string
  numero_dossier: string
  nom: string
  prenom: string
  email: string
  telephone: string
  formation: string
  formation_code: string
  formation_tarif: number
  id_formation: number | null
  id_session: number | null
  session: string | null
  statut_dossier: string
  statut_financement: string
  score: number
  nb_echanges: number
  date_candidature: string
  dernier_contact: string
  // Parcours
  entretien_telephonique: boolean
  date_entretien_tel: string | null
  valide_par_entretien_tel: string | null
  observation_entretien_tel: string | null
  exempt_entretien_telephonique: boolean
  rdv_presentiel: boolean
  date_rdv_presentiel: string | null
  valide_par_rdv_presentiel: string | null
  observation_rdv_presentiel: string | null
  exempt_rdv_presentiel: boolean
  test_technique: boolean
  date_test_technique: string | null
  valide_par_test_technique: string | null
  observation_test_technique: string | null
  exempt_test_technique: boolean
  validation_pedagogique: boolean
  date_validation_pedagogique: string | null
  valide_par_validation_pedagogique: string | null
  observation_validation_pedagogique: string | null
  exempt_validation_pedagogique: boolean
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
    nom_fichier: string | null
    obligatoire: boolean
    minio_key?: string | null
    mime_type?: string | null
  }>
  // Notes IA
}

interface CandidatDetailModalProps {
  candidatId: number
  formations: FormationCatalogue[]
  onClose: () => void
  onCandidatEjecte?: (candidatId: number) => void
}

const STATUT_DOCUMENT_COLORS: Record<string, string> = {
  VALIDE: 'text-[rgb(var(--success))]',
  RECU: 'text-[rgb(var(--info))]',
  ATTENDU: 'text-[rgb(var(--warning))]',
  A_VALIDER: 'text-[rgb(var(--warning))]',
  REFUSE: 'text-[rgb(var(--error))]'
}

// Statuts pour lesquels les actions Refuser/Convertir sont masquées
const STATUTS_TERMINES = ['REFUSE', 'INSCRIT']

export function CandidatDetailModal({ candidatId, formations, onClose, onCandidatEjecte }: CandidatDetailModalProps) {
  const [candidat, setCandidat] = useState<CandidatDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('general')
  const [showEnvoyerMessageModal, setShowEnvoyerMessageModal] = useState(false)
  const [showGenererDevisModal, setShowGenererDevisModal] = useState(false)
  const [showConvertirEleveModal, setShowConvertirEleveModal] = useState(false)
  const [showRefuserCandidatModal, setShowRefuserCandidatModal] = useState(false)
  const [etapeAValider, setEtapeAValider] = useState<EtapeType | null>(null)
  const [exemptEnCours, setExemptEnCours] = useState<EtapeType | null>(null)

  // États pour l'édition formation/session
  const [editFormationCode, setEditFormationCode] = useState<string>('')
  const [editSessionNom, setEditSessionNom] = useState<string>('')
  const [editMontantTotal, setEditMontantTotal] = useState<number>(0)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [sessionsDisponibles, setSessionsDisponibles] = useState<SessionOption[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [savingFormation, setSavingFormation] = useState(false)

  useEffect(() => {
    async function fetchCandidat() {
      try {
        setLoading(true)
        const res = await fetch(`/api/candidats/${candidatId}`)
        if (!res.ok) throw new Error('Erreur chargement candidat')
        const data = await res.json()
        setCandidat(data)
        setEditFormationCode(data.formation_code || '')
        setEditSessionNom(data.session || '')
        setEditMontantTotal(data.montant_total || 0)
        // Charger les sessions si une formation est déjà retenue
        if (data.id_formation) {
          chargerSessions(data.id_formation)
        }
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCandidat()
  }, [candidatId])

  const chargerSessions = async (idFormation: number) => {
    setLoadingSessions(true)
    try {
      const res = await fetch(`/api/sessions?idFormation=${idFormation}&statutSession=PREVUE,CONFIRMEE,EN_COURS`)
      if (res.ok) {
        const data = await res.json()
        setSessionsDisponibles(data.sessions || [])
      }
    } catch (err) {
      console.error('Erreur chargement sessions:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  const handleFormationChange = async (code: string) => {
    setEditFormationCode(code)
    setEditSessionNom('')
    setSessionsDisponibles([])
    if (!code) return

    // Récupérer tarif depuis le catalogue local
    const formation = formations.find(f => f.code === code)
    if (formation?.tarif) {
      setEditMontantTotal(Number(formation.tarif))
    }

    // Chercher l'idFormation via l'API formations pour charger les sessions
    const res = await fetch('/api/formations')
    if (res.ok) {
      const data = await res.json()
      const found = (data.formations || data).find(
        (f: { codeFormation: string; idFormation: number; tarifStandard?: number }) => f.codeFormation === code
      )
      if (found) {
        if (found.tarifStandard) setEditMontantTotal(Number(found.tarifStandard))
        chargerSessions(found.idFormation)
      }
    }
  }

  const handleSauvegarderFormation = async () => {
    if (!candidat) return
    setSavingFormation(true)
    try {
      const res = await fetch(`/api/candidats/${candidat.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formationCode: editFormationCode,
          sessionNom: editSessionNom,
          montantTotal: editMontantTotal
        })
      })
      if (res.ok) {
        await rechargerCandidat()
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      }
    } catch (err) {
      console.error('Erreur sauvegarde formation:', err)
    } finally {
      setSavingFormation(false)
    }
  }

  const rechargerCandidat = async () => {
    const res = await fetch(`/api/candidats/${candidatId}`)
    if (res.ok) {
      const data = await res.json()
      setCandidat(data)
    }
  }

  const handleEtapeSuccess = async () => {
    await rechargerCandidat()
  }

  const handleExempterEtape = async (etape: EtapeType) => {
    if (!candidat) return
    setExemptEnCours(etape)
    try {
      const res = await fetch('/api/candidats/valider-etape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCandidat: candidat.id,
          etape,
          dateValidation: new Date().toISOString().split('T')[0],
          exempt: true,
        }),
      })
      if (res.ok) {
        await rechargerCandidat()
      }
    } catch (err) {
      console.error('Erreur exemption:', err)
    } finally {
      setExemptEnCours(null)
    }
  }

  // Appelé quand la conversion ou le refus est confirmé → éjecter de la liste
  const handleActionSuccess = () => {
    if (onCandidatEjecte) {
      onCandidatEjecte(candidatId)
    }
    onClose()
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

  // Construire la liste des étapes avec leur état pour ConvertirEleveModal
  const etapesStatus = [
    {
      label: '📞 Entretien téléphonique',
      done: candidat.entretien_telephonique
    },
    {
      label: '🤝 RDV présentiel',
      done: candidat.rdv_presentiel
    },
    {
      label: '🔧 Test technique',
      done: candidat.test_technique
    },
    {
      label: '🎓 Validation pédagogique',
      done: candidat.validation_pedagogique
    }
  ]

  const statutTermine = STATUTS_TERMINES.includes(candidat.statut_dossier)

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

              {/* Infos formation — section éditable */}
              <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <p className="text-sm font-semibold text-[rgb(var(--foreground))]">Formation & Session</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Select formation */}
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formation retenue</p>
                    <select
                      value={editFormationCode}
                      onChange={(e) => handleFormationChange(e.target.value)}
                      className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    >
                      <option value="">— Non choisie —</option>
                      {formations.map((f) => (
                        <option key={f.code} value={f.code}>{f.nom}</option>
                      ))}
                    </select>
                  </div>

                  {/* Tarif */}
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Montant total (€)</p>
                    <input
                      type="number"
                      value={editMontantTotal}
                      onChange={(e) => setEditMontantTotal(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                      min={0}
                    />
                  </div>
                </div>

                {/* Select session */}
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Session visée</p>
                  {loadingSessions ? (
                    <p className="text-xs text-[rgb(var(--muted-foreground))] italic">Chargement sessions…</p>
                  ) : (
                    <select
                      value={editSessionNom}
                      onChange={(e) => setEditSessionNom(e.target.value)}
                      disabled={!editFormationCode}
                      className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none disabled:opacity-50"
                    >
                      <option value="">— Aucune session —</option>
                      {sessionsDisponibles.map((s) => (
                        <option key={s.idSession} value={s.nomSession}>
                          {s.nomSession} ({new Date(s.dateDebut).toLocaleDateString('fr-FR')} → {new Date(s.dateFin).toLocaleDateString('fr-FR')}) — {s.nbInscrits}/{s.capaciteMax} inscrits
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Bouton Enregistrer */}
                <div className="flex items-center justify-between pt-1">
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">
                    Candidature le {candidat.date_candidature}
                  </p>
                  <div className="flex items-center gap-3">
                    {saveSuccess && (
                      <span className="text-xs text-[rgb(var(--success))] flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Enregistré
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSauvegarderFormation}
                      disabled={savingFormation}
                      className="px-4 py-2 bg-[rgb(var(--accent))] text-black text-sm font-medium rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingFormation ? (
                        <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-black inline-block" />
                      ) : null}
                      {savingFormation ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                  </div>
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
              {([
                {
                  etapeType: 'entretienTelephonique' as EtapeType,
                  key: 'entretien_telephonique',
                  exemptKey: 'exempt_entretien_telephonique',
                  label: 'Entretien téléphonique',
                  icon: '📞',
                  date: candidat.date_entretien_tel,
                  validePar: candidat.valide_par_entretien_tel,
                  observation: candidat.observation_entretien_tel,
                  exempt: candidat.exempt_entretien_telephonique,
                },
                {
                  etapeType: 'rdvPresentiel' as EtapeType,
                  key: 'rdv_presentiel',
                  exemptKey: 'exempt_rdv_presentiel',
                  label: 'RDV présentiel',
                  icon: '🤝',
                  date: candidat.date_rdv_presentiel,
                  validePar: candidat.valide_par_rdv_presentiel,
                  observation: candidat.observation_rdv_presentiel,
                  exempt: candidat.exempt_rdv_presentiel,
                },
                {
                  etapeType: 'testTechnique' as EtapeType,
                  key: 'test_technique',
                  exemptKey: 'exempt_test_technique',
                  label: 'Test technique',
                  icon: '🔧',
                  date: candidat.date_test_technique,
                  validePar: candidat.valide_par_test_technique,
                  observation: candidat.observation_test_technique,
                  exempt: candidat.exempt_test_technique,
                },
                {
                  etapeType: 'validationPedagogique' as EtapeType,
                  key: 'validation_pedagogique',
                  exemptKey: 'exempt_validation_pedagogique',
                  label: 'Validation pédagogique',
                  icon: '🎓',
                  date: candidat.date_validation_pedagogique,
                  validePar: candidat.valide_par_validation_pedagogique,
                  observation: candidat.observation_validation_pedagogique,
                  exempt: candidat.exempt_validation_pedagogique,
                },
              ] as const).map((etape) => {
                const done = candidat[etape.key as keyof CandidatDetail] as boolean
                const isExempt = etape.exempt
                return (
                  <div
                    key={etape.key}
                    className="p-4 bg-[rgb(var(--secondary))] rounded-lg border border-[rgba(var(--border),0.3)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {done ? (
                          <CheckCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isExempt ? 'text-[rgb(var(--warning))]' : 'text-[rgb(var(--success))]'}`} />
                        ) : (
                          <Clock className="w-5 h-5 text-[rgb(var(--muted-foreground))] flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                            {etape.icon} {etape.label}
                          </span>
                          {etape.date && (
                            <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))] mt-1">
                              <Calendar className="w-3 h-3" />
                              {etape.date}
                            </div>
                          )}
                          {/* Validateur et observation */}
                          {done && etape.validePar && !isExempt && (
                            <div className="mt-2 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--foreground))]">
                                <User className="w-3 h-3 text-[rgb(var(--accent))]" />
                                <span>Validé par : <strong>{etape.validePar}</strong></span>
                              </div>
                              {etape.observation && (
                                <div className="flex items-start gap-1.5 text-xs text-[rgb(var(--muted-foreground))]">
                                  <Download className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                  <span>{etape.observation}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {done ? (
                        isExempt ? (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--warning),0.1)] rounded-lg border border-[rgba(var(--warning),0.3)] flex-shrink-0">
                            <XCircle className="w-4 h-4 text-[rgb(var(--warning))]" />
                            <span className="text-sm font-medium text-[rgb(var(--warning))]">
                              Exempté
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--success),0.1)] rounded-lg border border-[rgba(var(--success),0.3)] flex-shrink-0">
                            <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                            <span className="text-sm font-medium text-[rgb(var(--success))]">
                              Validée
                            </span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => handleExempterEtape(etape.etapeType)}
                            disabled={exemptEnCours === etape.etapeType}
                            className="px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--warning),0.5)] text-[rgb(var(--warning))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--warning),0.1)] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <XCircle className="w-4 h-4" />
                            {exemptEnCours === etape.etapeType ? '...' : 'Exempter'}
                          </button>
                          <button
                            onClick={() => setEtapeAValider(etape.etapeType)}
                            className="px-3 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-1.5"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Valider
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Tab Documents */}
          {activeTab === 'documents' && (
            <DocumentsOnglet
              documents={candidat.documents}
              numeroDossier={candidat.numero_dossier}
              onDocumentsUpdated={rechargerCandidat}
            />
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

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-between gap-2">
            {/* Gauche : Envoyer mail + Envoyer devis */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowEnvoyerMessageModal(true)}
                className="px-4 py-2 bg-[rgb(var(--warning))] text-[rgb(var(--primary))] rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Envoyer un mail
              </button>
              <button
                onClick={() => setShowGenererDevisModal(true)}
                className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] text-[rgb(var(--foreground))] rounded-lg font-medium hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Envoyer devis
              </button>
            </div>

            {/* Droite : Refuser + Convertir en élève (masqués si statut terminé) */}
            {!statutTermine && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowRefuserCandidatModal(true)}
                  className="px-4 py-2 bg-[rgb(var(--error))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Refuser
                </button>
                <button
                  onClick={() => setShowConvertirEleveModal(true)}
                  className="px-4 py-2 bg-[rgb(var(--success))] text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4" />
                  Convertir en élève
                </button>
              </div>
            )}
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
          onSuccess={rechargerCandidat}
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
          formations={formations}
          onClose={() => setShowGenererDevisModal(false)}
          onSuccess={rechargerCandidat}
        />
      )}

      {/* Modal Valider Étape */}
      {etapeAValider && candidat && (
        <ValiderEtapeModal
          candidat={{
            idCandidat: candidat.id,
            numeroDossier: candidat.numero_dossier,
            nom: candidat.nom,
            prenom: candidat.prenom,
            formation: candidat.formation
          }}
          etape={etapeAValider}
          onClose={() => setEtapeAValider(null)}
          onSuccess={handleEtapeSuccess}
        />
      )}

      {/* Modal Convertir en Élève */}
      {showConvertirEleveModal && candidat && (
        <ConvertirEleveModal
          candidat={{
            idCandidat: candidat.id,
            numeroDossier: candidat.numero_dossier,
            nom: candidat.nom,
            prenom: candidat.prenom,
            email: candidat.email,
            formation: candidat.formation,
            etapes: etapesStatus
          }}
          onClose={() => setShowConvertirEleveModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {/* Modal Refuser Candidat */}
      {showRefuserCandidatModal && candidat && (
        <RefuserCandidatModal
          candidat={{
            idCandidat: candidat.id,
            numeroDossier: candidat.numero_dossier,
            nom: candidat.nom,
            prenom: candidat.prenom,
            email: candidat.email,
            formation: candidat.formation,
            idProspect: candidat.id_prospect
          }}
          onClose={() => setShowRefuserCandidatModal(false)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  )
}
