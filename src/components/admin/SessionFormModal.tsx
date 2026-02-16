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
      const response = await fetch('/api/sessions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: sessionType,
          data: formData
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la génération du planning')
      }

      const proposalData: SessionProposal = await response.json()
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
  const handleValidateProposal = async () => {
    if (!proposal) return

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposal
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la création de la session')
      }

      // Succès
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      console.error('Erreur création session:', err)
    } finally {
      setIsSubmitting(false)
    }
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
