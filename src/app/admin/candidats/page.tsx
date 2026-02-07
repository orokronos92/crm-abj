/**
 * Page Candidats
 * Gestion des candidatures avec parcours d'admission
 */

'use client'

import { useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Search,
  Filter,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Euro,
  GraduationCap,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  Eye,
  ChevronRight,
  PhoneCall,
  UserCheck,
  ClipboardCheck,
  Award,
  Sparkles,
  FileCheck,
  MessageSquare,
  TrendingUp,
} from 'lucide-react'

// Données mockées
const MOCK_CANDIDATS = [
  {
    id: 1,
    nom: 'Martin',
    prenom: 'Sophie',
    email: 'sophie.martin@email.fr',
    telephone: '06 12 34 56 78',
    numero_dossier: 'RELY15032001',
    formation: 'CAP Bijouterie-Joaillerie',
    session: 'Mars 2024',
    statut_dossier: 'EN_COURS',
    statut_financement: 'VALIDE',
    date_candidature: '2024-01-15',
    nb_echanges: 15,
    score: 75,
    // Parcours admission
    entretien_telephonique: true,
    rdv_presentiel: true,
    test_technique: false,
    validation_pedagogique: false,
    // Documents
    documents: [
      { type: 'CV', statut: 'VALIDE' },
      { type: 'Lettre de motivation', statut: 'VALIDE' },
      { type: 'CNI', statut: 'RECU' },
      { type: 'Diplômes', statut: 'MANQUANT' },
    ],
    // Financement
    montant_total: 8500,
    montant_pec: 6500,
    reste_a_charge: 2000,
    mode_financement: 'CPF + Personnel',
    // Notes IA
    notes_ia: 'Profil très prometteur. Forte motivation et expérience en design pertinente. Attention: diplôme manquant à récupérer.',
  },
  {
    id: 2,
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@email.fr',
    telephone: '06 98 76 54 32',
    numero_dossier: 'RELY15032002',
    formation: 'Initiation Bijouterie',
    session: 'Avril 2024',
    statut_dossier: 'COMPLET',
    statut_financement: 'EN_ATTENTE',
    date_candidature: '2024-01-20',
    nb_echanges: 8,
    score: 60,
    entretien_telephonique: true,
    rdv_presentiel: false,
    test_technique: false,
    validation_pedagogique: false,
    documents: [
      { type: 'CV', statut: 'VALIDE' },
      { type: 'Lettre de motivation', statut: 'VALIDE' },
      { type: 'CNI', statut: 'VALIDE' },
      { type: 'RIB', statut: 'VALIDE' },
    ],
    montant_total: 750,
    montant_pec: 0,
    reste_a_charge: 750,
    mode_financement: 'Personnel',
    notes_ia: 'Candidat motivé pour une initiation. Financement personnel confirmé.',
  },
]

const STATUT_DOSSIER_COLORS = {
  RECU: 'badge-info',
  EN_COURS: 'badge-warning',
  COMPLET: 'badge-success',
  REFUSE: 'badge-error',
}

const STATUT_FINANCEMENT_COLORS = {
  EN_ATTENTE: 'badge-warning',
  EN_COURS: 'badge-info',
  VALIDE: 'badge-success',
  REFUSE: 'badge-error',
}

const STATUT_DOCUMENT_COLORS = {
  VALIDE: 'text-[rgb(var(--success))]',
  RECU: 'text-[rgb(var(--info))]',
  MANQUANT: 'text-[rgb(var(--error))]',
}

export default function CandidatsPage() {
  const [selectedCandidat, setSelectedCandidat] = useState(MOCK_CANDIDATS[0])
  const [activeTab, setActiveTab] = useState('parcours')

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[rgb(var(--success))]'
    if (score >= 60) return 'text-[rgb(var(--warning))]'
    return 'text-[rgb(var(--error))]'
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-6rem)] gap-6">
        {/* Liste des candidats (gauche) */}
        <div className="w-96 flex flex-col">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
              Candidats
            </h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[rgb(var(--muted-foreground))]" />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full pl-10 pr-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.1)] rounded-lg text-[rgb(var(--foreground))] placeholder-[rgb(var(--muted-foreground))]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3">
            {MOCK_CANDIDATS.map((candidat) => (
              <div
                key={candidat.id}
                onClick={() => setSelectedCandidat(candidat)}
                className={`p-4 bg-[rgb(var(--card))] border rounded-xl cursor-pointer transition-all hover:border-[rgba(var(--accent),0.3)] ${
                  selectedCandidat?.id === candidat.id
                    ? 'border-[rgb(var(--accent))] shadow-lg'
                    : 'border-[rgba(var(--border),0.5)]'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold">
                      {candidat.prenom.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-[rgb(var(--foreground))]">
                        {candidat.prenom} {candidat.nom}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">
                        {candidat.numero_dossier}
                      </p>
                    </div>
                  </div>
                  <span className={`text-2xl font-bold ${getScoreColor(candidat.score)}`}>
                    {candidat.score}
                  </span>
                </div>

                <div className="space-y-1 text-sm">
                  <p className="text-[rgb(var(--foreground))]">
                    {candidat.formation}
                  </p>
                  <div className="flex gap-2">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUT_DOSSIER_COLORS[candidat.statut_dossier as keyof typeof STATUT_DOSSIER_COLORS]}`}>
                      {candidat.statut_dossier}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${STATUT_FINANCEMENT_COLORS[candidat.statut_financement as keyof typeof STATUT_FINANCEMENT_COLORS]}`}>
                      Finance: {candidat.statut_financement}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails du candidat (droite) */}
        {selectedCandidat && (
          <div className="flex-1 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl overflow-hidden flex flex-col">
            {/* Header candidat */}
            <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold text-xl">
                    {selectedCandidat.prenom.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[rgb(var(--foreground))]">
                      {selectedCandidat.prenom} {selectedCandidat.nom}
                    </h2>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="flex items-center gap-1 text-sm text-[rgb(var(--muted-foreground))]">
                        <Mail className="w-4 h-4" />
                        {selectedCandidat.email}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-[rgb(var(--muted-foreground))]">
                        <Phone className="w-4 h-4" />
                        {selectedCandidat.telephone}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-3 py-1 text-sm rounded-full ${STATUT_DOSSIER_COLORS[selectedCandidat.statut_dossier as keyof typeof STATUT_DOSSIER_COLORS]}`}>
                      Dossier: {selectedCandidat.statut_dossier}
                    </span>
                    <span className={`px-3 py-1 text-sm rounded-full ${STATUT_FINANCEMENT_COLORS[selectedCandidat.statut_financement as keyof typeof STATUT_FINANCEMENT_COLORS]}`}>
                      Finance: {selectedCandidat.statut_financement}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${getScoreColor(selectedCandidat.score)}`}>
                        {selectedCandidat.score}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Score</p>
                    </div>
                    <div className="text-center px-4 border-l border-[rgba(var(--border),0.3)]">
                      <p className="text-2xl font-bold text-[rgb(var(--accent))]">
                        {selectedCandidat.nb_echanges}
                      </p>
                      <p className="text-xs text-[rgb(var(--muted-foreground))]">Échanges</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Infos principales */}
              <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-[rgb(var(--secondary))] rounded-lg">
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">N° Dossier</p>
                  <p className="text-sm font-medium text-[rgb(var(--accent))]">
                    {selectedCandidat.numero_dossier}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formation</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {selectedCandidat.formation}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Session</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {selectedCandidat.session}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Candidature</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {selectedCandidat.date_candidature}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[rgba(var(--border),0.3)]">
              {['parcours', 'documents', 'financement', 'notes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium capitalize transition-all ${
                    activeTab === tab
                      ? 'text-[rgb(var(--accent))] border-b-2 border-[rgb(var(--accent))]'
                      : 'text-[rgb(var(--muted-foreground))] hover:text-[rgb(var(--foreground))]'
                  }`}
                >
                  {tab === 'parcours' && 'Parcours admission'}
                  {tab === 'documents' && 'Documents'}
                  {tab === 'financement' && 'Financement'}
                  {tab === 'notes' && 'Notes IA'}
                </button>
              ))}
            </div>

            {/* Contenu des tabs */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tab Parcours */}
              {activeTab === 'parcours' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">
                    Parcours d'admission - 4 étapes
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Entretien téléphonique */}
                    <div className={`p-4 rounded-xl border-2 ${
                      selectedCandidat.entretien_telephonique
                        ? 'bg-[rgba(var(--success),0.05)] border-[rgba(var(--success),0.3)]'
                        : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.3)]'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedCandidat.entretien_telephonique
                              ? 'bg-[rgba(var(--success),0.1)]'
                              : 'bg-[rgba(var(--muted),0.1)]'
                          }`}>
                            <PhoneCall className={`w-5 h-5 ${
                              selectedCandidat.entretien_telephonique
                                ? 'text-[rgb(var(--success))]'
                                : 'text-[rgb(var(--muted-foreground))]'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--foreground))]">
                              Entretien téléphonique
                            </p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              Étape 1/4
                            </p>
                          </div>
                        </div>
                        {selectedCandidat.entretien_telephonique ? (
                          <CheckCircle className="w-6 h-6 text-[rgb(var(--success))]" />
                        ) : (
                          <Clock className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
                        )}
                      </div>
                      <button className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCandidat.entretien_telephonique
                          ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]'
                          : 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] hover:bg-[rgb(var(--accent-light))]'
                      }`}>
                        {selectedCandidat.entretien_telephonique ? 'Complété' : 'Planifier'}
                      </button>
                    </div>

                    {/* RDV présentiel */}
                    <div className={`p-4 rounded-xl border-2 ${
                      selectedCandidat.rdv_presentiel
                        ? 'bg-[rgba(var(--success),0.05)] border-[rgba(var(--success),0.3)]'
                        : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.3)]'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedCandidat.rdv_presentiel
                              ? 'bg-[rgba(var(--success),0.1)]'
                              : 'bg-[rgba(var(--muted),0.1)]'
                          }`}>
                            <UserCheck className={`w-5 h-5 ${
                              selectedCandidat.rdv_presentiel
                                ? 'text-[rgb(var(--success))]'
                                : 'text-[rgb(var(--muted-foreground))]'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--foreground))]">
                              RDV présentiel
                            </p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              Étape 2/4
                            </p>
                          </div>
                        </div>
                        {selectedCandidat.rdv_presentiel ? (
                          <CheckCircle className="w-6 h-6 text-[rgb(var(--success))]" />
                        ) : (
                          <Clock className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
                        )}
                      </div>
                      <button className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCandidat.rdv_presentiel
                          ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]'
                          : 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] hover:bg-[rgb(var(--accent-light))]'
                      }`}>
                        {selectedCandidat.rdv_presentiel ? 'Complété' : 'Planifier'}
                      </button>
                    </div>

                    {/* Test technique */}
                    <div className={`p-4 rounded-xl border-2 ${
                      selectedCandidat.test_technique
                        ? 'bg-[rgba(var(--success),0.05)] border-[rgba(var(--success),0.3)]'
                        : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.3)]'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedCandidat.test_technique
                              ? 'bg-[rgba(var(--success),0.1)]'
                              : 'bg-[rgba(var(--muted),0.1)]'
                          }`}>
                            <ClipboardCheck className={`w-5 h-5 ${
                              selectedCandidat.test_technique
                                ? 'text-[rgb(var(--success))]'
                                : 'text-[rgb(var(--muted-foreground))]'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--foreground))]">
                              Test technique
                            </p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              Étape 3/4
                            </p>
                          </div>
                        </div>
                        {selectedCandidat.test_technique ? (
                          <CheckCircle className="w-6 h-6 text-[rgb(var(--success))]" />
                        ) : (
                          <Clock className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
                        )}
                      </div>
                      <button className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCandidat.test_technique
                          ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]'
                          : 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] hover:bg-[rgb(var(--accent-light))]'
                      }`}>
                        {selectedCandidat.test_technique ? 'Complété' : 'Planifier'}
                      </button>
                    </div>

                    {/* Validation pédagogique */}
                    <div className={`p-4 rounded-xl border-2 ${
                      selectedCandidat.validation_pedagogique
                        ? 'bg-[rgba(var(--success),0.05)] border-[rgba(var(--success),0.3)]'
                        : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.3)]'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            selectedCandidat.validation_pedagogique
                              ? 'bg-[rgba(var(--success),0.1)]'
                              : 'bg-[rgba(var(--muted),0.1)]'
                          }`}>
                            <Award className={`w-5 h-5 ${
                              selectedCandidat.validation_pedagogique
                                ? 'text-[rgb(var(--success))]'
                                : 'text-[rgb(var(--muted-foreground))]'
                            }`} />
                          </div>
                          <div>
                            <p className="font-medium text-[rgb(var(--foreground))]">
                              Validation pédagogique
                            </p>
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">
                              Étape 4/4
                            </p>
                          </div>
                        </div>
                        {selectedCandidat.validation_pedagogique ? (
                          <CheckCircle className="w-6 h-6 text-[rgb(var(--success))]" />
                        ) : (
                          <Clock className="w-6 h-6 text-[rgb(var(--muted-foreground))]" />
                        )}
                      </div>
                      <button className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        selectedCandidat.validation_pedagogique
                          ? 'bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))]'
                          : 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] hover:bg-[rgb(var(--accent-light))]'
                      }`}>
                        {selectedCandidat.validation_pedagogique ? 'Validé' : 'Valider'}
                      </button>
                    </div>
                  </div>

                  {/* Barre de progression globale */}
                  <div className="mt-6 p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[rgb(var(--muted-foreground))]">Progression du parcours</span>
                      <span className="font-medium text-[rgb(var(--accent))]">
                        {[
                          selectedCandidat.entretien_telephonique,
                          selectedCandidat.rdv_presentiel,
                          selectedCandidat.test_technique,
                          selectedCandidat.validation_pedagogique,
                        ].filter(Boolean).length}/4 étapes
                      </span>
                    </div>
                    <div className="h-2 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] transition-all duration-500"
                        style={{
                          width: `${([
                            selectedCandidat.entretien_telephonique,
                            selectedCandidat.rdv_presentiel,
                            selectedCandidat.test_technique,
                            selectedCandidat.validation_pedagogique,
                          ].filter(Boolean).length / 4) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Documents */}
              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">
                    Documents du dossier
                  </h3>

                  {selectedCandidat.documents.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-[rgb(var(--secondary))] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className={`w-5 h-5 ${STATUT_DOCUMENT_COLORS[doc.statut as keyof typeof STATUT_DOCUMENT_COLORS]}`} />
                        <div>
                          <p className="font-medium text-[rgb(var(--foreground))]">{doc.type}</p>
                          <p className="text-sm text-[rgb(var(--muted-foreground))]">
                            Statut: <span className={STATUT_DOCUMENT_COLORS[doc.statut as keyof typeof STATUT_DOCUMENT_COLORS]}>{doc.statut}</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {doc.statut === 'MANQUANT' ? (
                          <button className="px-3 py-1.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center gap-1">
                            <Upload className="w-4 h-4" />
                            Demander
                          </button>
                        ) : (
                          <>
                            <button className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                              <Eye className="w-4 h-4 text-[rgb(var(--accent))]" />
                            </button>
                            <button className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors">
                              <Download className="w-4 h-4 text-[rgb(var(--accent))]" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  <button className="w-full mt-4 px-4 py-3 bg-[rgb(var(--secondary))] border-2 border-dashed border-[rgba(var(--accent),0.3)] rounded-lg text-[rgb(var(--accent))] font-medium hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2">
                    <Upload className="w-5 h-5" />
                    Ajouter un document
                  </button>
                </div>
              )}

              {/* Tab Financement */}
              {activeTab === 'financement' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4">
                    Détails financiers
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Montant total formation</p>
                      <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
                        {selectedCandidat.montant_total.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Mode de financement</p>
                      <p className="text-lg font-medium text-[rgb(var(--accent))]">
                        {selectedCandidat.mode_financement}
                      </p>
                    </div>
                    <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
                      <p className="text-sm text-[rgb(var(--success))] mb-2">Montant prise en charge</p>
                      <p className="text-2xl font-bold text-[rgb(var(--success))]">
                        {selectedCandidat.montant_pec.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                    <div className="p-4 bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg">
                      <p className="text-sm text-[rgb(var(--warning))] mb-2">Reste à charge</p>
                      <p className="text-2xl font-bold text-[rgb(var(--warning))]">
                        {selectedCandidat.reste_a_charge.toLocaleString('fr-FR')} €
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-[rgb(var(--muted-foreground))]">Progression financement</span>
                      <span className="text-sm font-medium text-[rgb(var(--accent))]">
                        {Math.round((selectedCandidat.montant_pec / selectedCandidat.montant_total) * 100)}% financé
                      </span>
                    </div>
                    <div className="h-3 bg-[rgba(var(--muted),0.3)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[rgb(var(--success))] to-[rgb(var(--accent))] transition-all duration-500"
                        style={{
                          width: `${(selectedCandidat.montant_pec / selectedCandidat.montant_total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 px-4 py-3 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors">
                      Générer devis
                    </button>
                    <button className="flex-1 px-4 py-3 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg font-medium border border-[rgba(var(--border),0.5)] hover:bg-[rgba(var(--accent),0.05)] transition-colors">
                      Envoyer facture
                    </button>
                  </div>
                </div>
              )}

              {/* Tab Notes IA */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[rgb(var(--accent))]" />
                    <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                      Analyse Marjorie IA
                    </h3>
                  </div>

                  <div className="p-6 bg-gradient-to-br from-[rgba(var(--accent),0.03)] to-[rgba(var(--accent),0.01)] border border-[rgba(var(--accent),0.2)] rounded-xl">
                    <p className="text-[rgb(var(--foreground))] leading-relaxed italic">
                      "{selectedCandidat.notes_ia}"
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[rgb(var(--muted-foreground))]">Score global</span>
                        <TrendingUp className="w-4 h-4 text-[rgb(var(--accent))]" />
                      </div>
                      <p className={`text-3xl font-bold ${getScoreColor(selectedCandidat.score)}`}>
                        {selectedCandidat.score}/100
                      </p>
                    </div>
                    <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-[rgb(var(--muted-foreground))]">Recommandation</span>
                        <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                      </div>
                      <p className="text-lg font-medium text-[rgb(var(--success))]">
                        Accepter
                      </p>
                    </div>
                  </div>

                  <button className="w-full px-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--accent),0.2)] rounded-lg text-[rgb(var(--accent))] font-medium hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Demander une analyse approfondie à Marjorie
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}