/**
 * Modal orchestrateur du formulaire de création de session
 * Gère la navigation entre les étapes et les appels API
 */

'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { SessionTypeSelector } from './session-form/SessionTypeSelector'
import { FormationCourteForm } from './session-form/FormationCourteForm'
import { FormationCAPForm } from './session-form/FormationCAPForm'
import { SessionReviewPanel } from './SessionReviewPanel'
import { SessionProposalReview } from './SessionProposalReview'
import type { SessionType, SessionFormData, SessionProposal } from './session-form/session-form.types'
import { useActionNotification } from '@/hooks/use-action-notification'

interface SessionFormModalProps {
  onClose: () => void
  onSuccess: () => void
}

type Step = 'type' | 'form' | 'review' | 'ai-proposal'

export function SessionFormModal({ onClose, onSuccess }: SessionFormModalProps) {
  // États principaux
  const [step, setStep] = useState<Step>('type')
  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [formData, setFormData] = useState<SessionFormData | null>(null)
  const [proposal, setProposal] = useState<SessionProposal | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { createActionNotification } = useActionNotification()

  // Navigation entre étapes
  const handleTypeSelected = (type: SessionType) => {
    setSessionType(type)
    setStep('form')
  }

  const handleFormSubmit = (data: SessionFormData) => {
    setFormData(data)
    setStep('review')
  }

  const handleBackToForm = () => {
    setStep('form')
  }

  const handleBackToType = () => {
    setSessionType(null)
    setFormData(null)
    setStep('type')
  }

  // Envoi à l'IA pour validation et génération planning
  const handleConfirmReview = async () => {
    if (!formData || !sessionType) return

    setIsSubmitting(true)
    setError(null)

    try {
      // 1. Créer vraie notification en BDD
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'SESSION',
        type: 'CREATION_SESSION',
        priorite: 'NORMALE',
        titre: `Nouvelle session ${sessionType} créée`,
        message: `Validation IA en cours pour ${sessionType === 'CAP' ? 'Formation CAP' : 'Formation courte'}`,
        entiteType: 'session',
        entiteId: 'NEW_SESSION', // Sera mis à jour avec l'ID réel après création
        actionRequise: true,
        typeAction: 'VALIDER'
      })

      // 2. Construire le payload enrichi
      const payload = {
        // === IDENTIFICATION ACTION ===
        actionType: 'CREER_SESSION',
        actionSource: 'admin.sessions.creation',
        actionButton: 'valider_session',

        // === CONTEXTE MÉTIER ===
        entiteType: 'session',
        entiteId: 'NEW_SESSION', // Sera remplacé par l'ID session créée après validation IA
        entiteData: {
          type: sessionType,
          formData: formData,
          typeSession: sessionType === 'CAP' ? 'Formation CAP' : 'Formation courte'
        },

        // === DÉCISION UTILISATEUR ===
        decidePar: currentUserId,
        decisionType: 'creation_session',
        commentaire: `Création session ${sessionType}`,

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          sessionType: sessionType,
          formData: formData
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          callbackUrl: `${window.location.origin}/api/webhook/callback`,
          updateNotification: true,
          expectedResponse: 'session_created',
          timeoutSeconds: 60 // Validation IA peut prendre du temps
        }
      }

      const response = await fetch(`/api/notifications/${notificationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la génération du planning')
      }

      const proposalData: SessionProposal = await response.json()
      console.log('📦 SessionFormModal - Données reçues de l\'API:', proposalData)
      setProposal(proposalData)
      setStep('ai-proposal')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur validation session:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Validation finale de la proposition IA
  const handleValidateProposal = () => {
    // NOTE: La session a déjà été créée en base avec statut EN_ANALYSE
    // lors de l'appel à /api/sessions/validate (ligne 62-84)
    // Pas besoin de faire un autre appel API, on ferme juste le modal
    // et on rafraîchit la liste pour voir la nouvelle session
    onSuccess()
    onClose()
  }

  // Rejet de la proposition
  const handleRejectProposal = () => {
    setProposal(null)
    setStep('review')
  }

  // Ajustement du planning (retour au formulaire)
  const handleAdjustProposal = () => {
    setProposal(null)
    setStep('form')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full h-full md:h-[90vh] md:max-w-5xl flex flex-col relative overflow-hidden">
        {/* Bouton fermeture (toujours visible) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
        </button>

        {/* Contenu selon l'étape - avec scroll */}
        <div className="flex-1 overflow-y-auto">
          {step === 'type' && (
            <SessionTypeSelector onSelect={handleTypeSelected} />
          )}

          {step === 'form' && sessionType === 'COURTE' && (
            <FormationCourteForm
              onSubmit={(data) => handleFormSubmit({ type: 'COURTE', dataCourte: data })}
              onBack={handleBackToType}
            />
          )}

          {step === 'form' && sessionType === 'CAP' && (
            <FormationCAPForm
              onSubmit={(data) => handleFormSubmit({ type: 'CAP', dataCAP: data })}
              onBack={handleBackToType}
            />
          )}

          {step === 'review' && formData && sessionType && (
            <SessionReviewPanel
              data={formData}
              type={sessionType}
              onBack={handleBackToForm}
              onConfirm={handleConfirmReview}
              isSubmitting={isSubmitting}
            />
          )}

          {step === 'ai-proposal' && proposal && (
            <SessionProposalReview
              proposal={proposal}
              onValidate={handleValidateProposal}
              onReject={handleRejectProposal}
              onAdjust={handleAdjustProposal}
            />
          )}
        </div>

        {/* Affichage erreurs */}
        {error && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 max-w-md w-full mx-4">
            <div className="bg-[rgb(var(--error))] text-white rounded-lg p-4 shadow-lg">
              <p className="text-sm font-medium mb-1">Erreur</p>
              <p className="text-sm opacity-90">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-xs underline hover:no-underline"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
