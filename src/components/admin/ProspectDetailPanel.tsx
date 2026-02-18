/**
 * ProspectDetailPanel
 * Panel latéral avec détails prospect (Client Component)
 */

'use client'

import { useState, useEffect } from 'react'
import { HistoriqueEchangesModal } from './HistoriqueEchangesModal'
import { ConvertirCandidatModal } from './ConvertirCandidatModal'
import { EnvoyerDossierModal } from './EnvoyerDossierModal'
import {
  Mail,
  Phone,
  Calendar,
  MapPin,
  MessageSquare,
  Clock,
  Euro,
  GraduationCap,
  X,
  FileText,
  Send,
  User,
} from 'lucide-react'

interface ProspectDetailPanelProps {
  prospectId: string
  onClose: () => void
}

interface ProspectDetail {
  id: string
  nom: string
  prenom: string
  email: string
  telephone: string
  formationSouhaitee: string
  statut: string
  source: string
  financement: string
  nbEchanges: number
  dernierContact: string
  datePremierContact: string
  ville: string
  codePostal: string
  resumeIa: string
}

const STATUT_COLORS: Record<string, string> = {
  NOUVEAU: 'badge-info',
  EN_ATTENTE: 'badge-warning',
  CANDIDAT: 'badge-success',
  REFUSE: 'badge-error',
  TIEDE: 'badge-warning',
  CHAUD: 'badge-success',
  FROID: 'badge-info',
  PERDU: 'badge-error',
  INSCRIT: 'badge-success',
  CONTACT: 'badge-info',
  EN_ATTENTE_DOSSIER: 'badge-warning',
}

export function ProspectDetailPanel({ prospectId, onClose }: ProspectDetailPanelProps) {
  const [prospect, setProspect] = useState<ProspectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [showHistorique, setShowHistorique] = useState(false)
  const [showConvertirModal, setShowConvertirModal] = useState(false)
  const [showEnvoyerDossierModal, setShowEnvoyerDossierModal] = useState(false)

  useEffect(() => {
    async function fetchProspect() {
      try {
        setLoading(true)
        const res = await fetch(`/api/prospects/${prospectId}`)
        if (!res.ok) throw new Error('Erreur chargement prospect')
        const data = await res.json()
        setProspect(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProspect()
  }, [prospectId])

  const handleConversionSuccess = async () => {
    // Recharger les données du prospect après conversion
    const res = await fetch(`/api/prospects/${prospectId}`)
    if (res.ok) {
      const data = await res.json()
      setProspect(data)
    }
  }

  const handleEnvoiDossierSuccess = async () => {
    // Recharger les données du prospect après envoi dossier
    const res = await fetch(`/api/prospects/${prospectId}`)
    if (res.ok) {
      const data = await res.json()
      setProspect(data)
    }
  }

  if (loading) {
    return (
      <div className="fixed right-0 top-16 bottom-0 w-96 bg-[rgb(var(--card))] border-l border-[rgba(var(--accent),0.1)] shadow-xl animate-slideInRight overflow-y-auto">
        <div className="p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--accent))]"></div>
        </div>
      </div>
    )
  }

  if (!prospect) {
    return null
  }

  return (
    <div className="fixed right-0 top-16 bottom-0 w-96 bg-[rgb(var(--card))] border-l border-[rgba(var(--accent),0.1)] shadow-xl animate-slideInRight overflow-y-auto">
      {/* Header du panel */}
      <div className="sticky top-0 bg-[rgb(var(--card))] border-b border-[rgba(var(--border),0.3)] p-6 z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-dark))] flex items-center justify-center text-[rgb(var(--primary))] font-bold text-lg">
              {prospect.prenom.charAt(0)}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--foreground))]">
                {prospect.prenom} {prospect.nom}
              </h2>
              <span
                className={`px-2 py-0.5 text-xs rounded-full ${
                  STATUT_COLORS[prospect.statut] || 'badge-info'
                }`}
              >
                {prospect.statut}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Actions rapides */}
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[rgb(var(--accent-light))] transition-colors">
            <Mail className="w-4 h-4" />
            Envoyer email
          </button>
          <button className="flex-1 px-3 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[rgba(var(--accent),0.1)] transition-colors border border-[rgba(var(--border),0.5)]">
            <Phone className="w-4 h-4" />
            Appeler
          </button>
        </div>
      </div>

      {/* Contenu du panel */}
      <div className="p-6 space-y-6">
        {/* Informations de contact */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
            Contact
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm text-[rgb(var(--foreground))]">{prospect.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm text-[rgb(var(--foreground))]">{prospect.telephone}</span>
            </div>
            {prospect.ville && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                <span className="text-sm text-[rgb(var(--foreground))]">
                  {prospect.codePostal} {prospect.ville}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Formation souhaitée */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
            Formation
          </h3>
          <div className="p-3 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <GraduationCap className="w-4 h-4 text-[rgb(var(--accent))]" />
              <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                {prospect.formationSouhaitee}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Euro className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <span className="text-sm text-[rgb(var(--muted-foreground))]">
                Financement: {prospect.financement}
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
            Historique
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <div className="flex-1">
                <p className="text-sm text-[rgb(var(--foreground))]">Premier contact</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {prospect.datePremierContact}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
              <div className="flex-1">
                <p className="text-sm text-[rgb(var(--foreground))]">Dernier contact</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {prospect.dernierContact}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowHistorique(true)}
              className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors group cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-[rgb(var(--muted-foreground))] group-hover:text-[rgb(var(--accent))] transition-colors" />
              <div className="flex-1 text-left">
                <p className="text-sm text-[rgb(var(--foreground))] group-hover:text-[rgb(var(--accent))] transition-colors font-medium">
                  Nombre d'échanges
                </p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {prospect.nbEchanges} messages • Cliquer pour voir l'historique
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Actions */}
        <div>
          <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
            Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.1)] transition-colors border border-[rgba(var(--border),0.5)] flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Générer devis
            </button>
            <button
              onClick={() => setShowEnvoyerDossierModal(true)}
              className="w-full px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg text-sm font-medium hover:bg-[rgba(var(--accent),0.1)] transition-colors border border-[rgba(var(--border),0.5)] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Envoyer dossier
            </button>
            <button
              onClick={() => setShowConvertirModal(true)}
              className="w-full px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg text-sm font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center justify-center gap-2"
            >
              <User className="w-4 h-4" />
              Convertir en candidat
            </button>
          </div>
        </div>
      </div>

      {/* Modal Historique */}
      {showHistorique && prospect && (
        <HistoriqueEchangesModal
          prospectId={prospect.id}
          prospectName={`${prospect.prenom} ${prospect.nom}`}
          nbEchanges={prospect.nbEchanges}
          onClose={() => setShowHistorique(false)}
        />
      )}

      {/* Modal Conversion Candidat */}
      {showConvertirModal && prospect && (
        <ConvertirCandidatModal
          prospect={{
            idProspect: prospect.id,
            nom: prospect.nom,
            prenom: prospect.prenom,
            email: prospect.email,
            formationPrincipale: prospect.formationSouhaitee
          }}
          onClose={() => setShowConvertirModal(false)}
          onSuccess={handleConversionSuccess}
        />
      )}

      {/* Modal Envoyer Dossier */}
      {showEnvoyerDossierModal && prospect && (
        <EnvoyerDossierModal
          prospect={{
            idProspect: prospect.id,
            nom: prospect.nom,
            prenom: prospect.prenom,
            email: prospect.email,
            telephone: prospect.telephone,
            ville: prospect.ville,
            codePostal: prospect.codePostal,
            formationPrincipale: prospect.formationSouhaitee
          }}
          onClose={() => setShowEnvoyerDossierModal(false)}
          onSuccess={handleEnvoiDossierSuccess}
        />
      )}
    </div>
  )
}
