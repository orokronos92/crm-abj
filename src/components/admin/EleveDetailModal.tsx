'use client'

import { useState, useEffect } from 'react'
import {
  X, User, BarChart3, Award, Calendar, FolderOpen, History,
  Mail, Phone, FileText, MessageSquare, Download, Sparkles
} from 'lucide-react'
import { TabGeneral } from './eleve-tabs/TabGeneral'
import { TabSynthese } from './eleve-tabs/TabSynthese'
import { TabEvaluations } from './eleve-tabs/TabEvaluations'
import { TabPresences } from './eleve-tabs/TabPresences'
import { TabDocuments } from './eleve-tabs/TabDocuments'
import { TabHistorique } from './eleve-tabs/TabHistorique'
import { TabAnalyseIA } from './eleve-tabs/TabAnalyseIA'
import { EnvoyerMessageEleveModal } from './EnvoyerMessageEleveModal'
import { useActionNotification } from '@/hooks/use-action-notification'

interface EleveDetailModalProps {
  eleveId: number
  onClose: () => void
}

export function EleveDetailModal({ eleveId, onClose }: EleveDetailModalProps) {
  const [activeTab, setActiveTab] = useState('general')
  const [eleve, setEleve] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEnvoyerMessageModal, setShowEnvoyerMessageModal] = useState(false)
  const [demandingAnalyse, setDemandingAnalyse] = useState(false)
  const { createActionNotification } = useActionNotification()

  useEffect(() => {
    const fetchEleve = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/eleves/${eleveId}`)

        if (!response.ok) {
          throw new Error('Erreur lors du chargement des données')
        }

        const data = await response.json()
        setEleve(data)
      } catch (err) {
        console.error('Erreur:', err)
        setError(err instanceof Error ? err.message : 'Erreur inconnue')
      } finally {
        setLoading(false)
      }
    }

    fetchEleve()
  }, [eleveId])

  const handleEnvoyerMessageSuccess = async () => {
    // Recharger les données de l'élève après envoi message
    const res = await fetch(`/api/eleves/${eleveId}`)
    if (res.ok) {
      const data = await res.json()
      setEleve(data)
    }
  }

  const handleDemanderAnalyse = async () => {
    if (!eleve || demandingAnalyse) return

    setDemandingAnalyse(true)
    try {
      // 1. Créer vraie notification en BDD
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'ELEVE',
        type: 'DEMANDE_ANALYSE',
        priorite: 'NORMALE',
        titre: `Analyse IA demandée pour ${eleve.prenom} ${eleve.nom}`,
        message: `Demande d'analyse complète du profil - Dossier ${eleve.numeroDossier}`,
        entiteType: 'eleve',
        entiteId: eleve.id.toString(),
        actionRequise: true,
        typeAction: 'ANALYSER'
      })

      // 2. Construire le payload enrichi
      const payload = {
        // === IDENTIFICATION ACTION ===
        actionType: 'DEMANDER_ANALYSE_ELEVE',
        actionSource: 'admin.eleves.detail',
        actionButton: 'demander_analyse',

        // === CONTEXTE MÉTIER ===
        entiteType: 'eleve',
        entiteId: eleve.id.toString(),
        entiteData: {
          idEleve: eleve.id,
          numeroDossier: eleve.numeroDossier,
          nom: eleve.nom,
          prenom: eleve.prenom,
          email: eleve.email,
          telephone: eleve.telephone,
          formation: eleve.formation
        },

        // === DÉCISION UTILISATEUR ===
        decidePar: currentUserId,
        decisionType: 'demande_analyse',
        commentaire: `Demande d'analyse IA pour ${eleve.prenom} ${eleve.nom}`,

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          numeroDossier: eleve.numeroDossier,
          formation: eleve.formation,
          typeAnalyse: 'profil_complet'
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          callbackUrl: `${window.location.origin}/api/webhook/callback`,
          updateNotification: true,
          expectedResponse: 'analyse_generated',
          timeoutSeconds: 120 // Analyse IA peut prendre du temps
        }
      }

      const response = await fetch(`/api/notifications/${notificationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        alert('Analyse demandée à Marjorie ! Vous serez notifié lorsqu\'elle sera terminée.')
        // Optionnel : recharger après quelques secondes pour voir si l'analyse est déjà dispo
        setTimeout(async () => {
          const res = await fetch(`/api/eleves/${eleveId}`)
          if (res.ok) {
            const data = await res.json()
            setEleve(data)
          }
        }, 5000)
      } else if (response.status === 409) {
        alert(result.message || 'Une analyse est déjà en cours pour cet élève')
      } else {
        alert(result.error || 'Erreur lors de la demande d\'analyse')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la demande d\'analyse')
    } finally {
      setDemandingAnalyse(false)
    }
  }

  const tabs = [
    { id: 'general', label: 'Général', icon: User },
    { id: 'synthese', label: 'Synthèse', icon: BarChart3 },
    { id: 'evaluations', label: 'Évaluations', icon: Award },
    { id: 'presences', label: 'Présences', icon: Calendar },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'historique', label: 'Historique', icon: History },
    { id: 'analyse-ia', label: 'Analyse IA', icon: Sparkles },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-xl overflow-hidden flex flex-col max-w-6xl w-full h-[90vh]">
        {/* Onglets en forme de dossier */}
        <div className="relative flex gap-1 px-4 pt-4 bg-[rgb(var(--background))]">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative px-6 py-3 rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-[rgb(var(--card))] text-[rgb(var(--accent))] border-t-2 border-x-2 border-[rgba(var(--accent),0.5)] -mb-[2px]'
                    : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] hover:bg-[rgba(var(--accent),0.05)] hover:text-[rgb(var(--foreground))]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-[rgb(var(--accent))]' : ''}`} />
                  <span className="text-sm font-medium">{tab.label}</span>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-[rgb(var(--accent))] opacity-20 rounded-bl-lg" />
                )}
              </button>
            )
          })}

          {/* Bouton fermer */}
          <button
            onClick={onClose}
            className="absolute top-2 right-4 p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors z-10"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Contenu des onglets */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--accent))]" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-[rgb(var(--error))]">{error}</p>
            </div>
          ) : eleve ? (
            <>
              {activeTab === 'general' && <TabGeneral eleve={eleve} />}
              {activeTab === 'synthese' && <TabSynthese eleve={eleve} />}
              {activeTab === 'evaluations' && <TabEvaluations eleve={eleve} />}
              {activeTab === 'presences' && <TabPresences eleve={eleve} />}
              {activeTab === 'documents' && <TabDocuments eleve={eleve} />}
              {activeTab === 'historique' && <TabHistorique eleve={eleve} />}
              {activeTab === 'analyse-ia' && <TabAnalyseIA eleve={eleve} onDemanderAnalyse={handleDemanderAnalyse} />}
            </>
          ) : null}
        </div>

        {/* Footer avec actions */}
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
              onClick={handleDemanderAnalyse}
              disabled={demandingAnalyse}
              className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {demandingAnalyse ? (
                <>
                  <div className="w-4 h-4 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
                  Demande en cours...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Demander analyse Marjorie
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal Envoyer Message */}
      {showEnvoyerMessageModal && eleve && (
        <EnvoyerMessageEleveModal
          eleve={{
            idEleve: eleve.id,
            numeroDossier: eleve.numeroDossier,
            nom: eleve.nom,
            prenom: eleve.prenom,
            email: eleve.email,
            telephone: eleve.telephone,
            formation: eleve.formation
          }}
          onClose={() => setShowEnvoyerMessageModal(false)}
          onSuccess={handleEnvoyerMessageSuccess}
        />
      )}
    </div>
  )
}