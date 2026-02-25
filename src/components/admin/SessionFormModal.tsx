/**
 * Modal orchestrateur du formulaire de création de session
 * Envoie le payload directement au webhook n8n — pas de système intermédiaire
 */

'use client'

import React, { useState } from 'react'
import { X, Loader2, CheckCircle } from 'lucide-react'
import { SessionTypeSelector } from './session-form/SessionTypeSelector'
import { FormationCourteForm } from './session-form/FormationCourteForm'
import { FormationCAPForm } from './session-form/FormationCAPForm'
import type { SessionType, SessionFormData } from './session-form/session-form.types'

interface SessionFormModalProps {
  onClose: () => void
  onSuccess: () => void
}

type Step = 'type' | 'form' | 'sending' | 'success'

export function SessionFormModal({ onClose, onSuccess }: SessionFormModalProps) {
  const [step, setStep] = useState<Step>('type')
  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleTypeSelected = (type: SessionType) => {
    setSessionType(type)
    setStep('form')
  }

  const handleBackToType = () => {
    setSessionType(null)
    setStep('type')
  }

  // Envoi direct au webhook n8n
  const handleFormSubmit = async (data: SessionFormData) => {
    setStep('sending')
    setError(null)

    try {
      const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
        || 'http://localhost:5678/webhook/crm-session'

      const payload = {
        sourceForm: 'creation_session',
        type: data.type,
        demandePar: 'admin',
        dateCreation: new Date().toISOString(),
        ...(data.type === 'COURTE' && data.dataCourte && {
          informationsGenerales: {
            codeFormation: data.dataCourte.codeFormation,
            dateDebut: data.dataCourte.dateDebut,
            dateFin: data.dataCourte.dateFin,
            dureeHeures: data.dataCourte.dureeHeures,
            nbParticipants: data.dataCourte.nbParticipants,
          },
          joursActifs: data.dataCourte.joursActifs,
          ressources: {
            salleId: data.dataCourte.salleId || null,
            formateurId: data.dataCourte.formateurId || null,
          },
          notesComplementaires: data.dataCourte.description || null,
        }),
        ...(data.type === 'CAP' && data.dataCAP && {
          informationsGenerales: {
            codeFormation: data.dataCAP.codeFormation,
            nomSession: data.dataCAP.nomSession,
            dateDebutGlobale: data.dataCAP.dateDebutGlobale,
            dureeMois: data.dataCAP.dureeMois,
            nbParticipants: data.dataCAP.nbParticipants,
          },
          plageHoraire: data.dataCAP.plageHoraire,
          joursActifs: data.dataCAP.joursActifs,
          periodesInterdites: data.dataCAP.periodesInterdites,
          programme: data.dataCAP.programme,
          ressources: {
            formateurs: data.dataCAP.formateurs,
            salles: data.dataCAP.salles,
            formateurMultiMatieresAutorise: data.dataCAP.formateurMultiMatieresAutorise,
            salleMultiMatieresAutorise: data.dataCAP.salleMultiMatieresAutorise,
            formateursPlanifierPlusTard: data.dataCAP.formateursPlanifierPlusTard,
            sallesPlanifierPlusTard: data.dataCAP.sallesPlanifierPlusTard,
          },
          contraintesPedagogiques: {
            matieresEnParallele: data.dataCAP.matieresEnParallele,
            notesComplementaires: data.dataCAP.notesComplementaires || null,
          },
        }),
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.NEXT_PUBLIC_N8N_API_KEY || '',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Erreur webhook n8n : ${response.status}`)
      }

      setStep('success')
      // Rafraîchir la liste après 2s puis fermer
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setStep('form')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full h-full md:h-[90vh] md:max-w-5xl flex flex-col relative overflow-hidden">

        {/* Bouton fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          disabled={step === 'sending'}
        >
          <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
        </button>

        {/* Contenu */}
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

          {/* Envoi en cours */}
          {step === 'sending' && (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-12">
              <Loader2 className="w-16 h-16 text-[rgb(var(--accent))] animate-spin" />
              <div className="text-center">
                <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-2">
                  Envoi à Marjorie...
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  Marjorie analyse le planning et prépare les séances
                </p>
              </div>
            </div>
          )}

          {/* Succès */}
          {step === 'success' && (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-12">
              <CheckCircle className="w-16 h-16 text-[rgb(var(--success))]" />
              <div className="text-center">
                <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-2">
                  Demande envoyée à Marjorie !
                </h3>
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  La session apparaîtra dans la liste une fois planifiée
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Erreur */}
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
