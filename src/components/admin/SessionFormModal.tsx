/**
 * Modal orchestrateur du formulaire de création de session
 * Envoie le payload directement au webhook n8n — pas de système intermédiaire
 */

'use client'

import React, { useState } from 'react'
import { X, Loader2, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react'
import { SessionTypeSelector } from './session-form/SessionTypeSelector'
import { FormationCourteForm } from './session-form/FormationCourteForm'
import { FormationCAPForm } from './session-form/FormationCAPForm'
import type { SessionType, SessionFormData } from './session-form/session-form.types'

interface SessionFormModalProps {
  onClose: () => void
  onSuccess: () => void
}

interface N8nError {
  titre: string
  message?: string
  erreurs?: string[]
  rapport?: string
  reseau?: boolean
}

type Step = 'type' | 'form' | 'sending' | 'success' | 'error'

export function SessionFormModal({ onClose, onSuccess }: SessionFormModalProps) {
  const [step, setStep] = useState<Step>('type')
  const [sessionType, setSessionType] = useState<SessionType | null>(null)
  const [n8nError, setN8nError] = useState<N8nError | null>(null)
  // Conserver les données du formulaire pour permettre le retour en arrière
  const [lastFormData, setLastFormData] = useState<SessionFormData | null>(null)

  const handleTypeSelected = (type: SessionType) => {
    setSessionType(type)
    setStep('form')
  }

  const handleBackToType = () => {
    setSessionType(null)
    setStep('type')
  }

  const handleRetourFormulaire = () => {
    setN8nError(null)
    setStep('form')
  }

  // Parse la réponse d'erreur n8n selon les formats connus
  const parseN8nError = (status: number, body: Record<string, unknown>): N8nError => {
    const bodyStatus = body.status as string | undefined

    // Format 1 : validation_failed (422) — erreurs métier avec rapport
    if (bodyStatus === 'validation_failed') {
      const erreurs = Array.isArray(body.erreurs) ? (body.erreurs as string[]) : []
      return {
        titre: 'Planification impossible',
        erreurs,
        rapport: typeof body.rapport === 'string' ? body.rapport : undefined,
      }
    }

    // Format 2 : refused (422) — refus avec message et détails
    if (bodyStatus === 'refused') {
      const details: string[] = []
      if (body.budgetDisponible) details.push(`Budget disponible : ${body.budgetDisponible}`)
      if (body.programmeRequis) details.push(`Programme requis : ${body.programmeRequis}`)
      if (body.codeFormation) details.push(`Code formation : ${body.codeFormation}`)
      return {
        titre: 'Demande refusée par Marjorie',
        message: typeof body.message === 'string' ? body.message : undefined,
        erreurs: details.length > 0 ? details : undefined,
      }
    }

    // Format 3 : error (400) — payload invalide
    if (bodyStatus === 'error') {
      const erreurs = Array.isArray(body.erreurs) ? (body.erreurs as string[]) : []
      return {
        titre: 'Données invalides',
        message: typeof body.message === 'string' ? body.message : undefined,
        erreurs: erreurs.length > 0 ? erreurs : undefined,
      }
    }

    // Fallback générique
    return {
      titre: `Erreur ${status}`,
      message: typeof body.message === 'string' ? body.message : 'Une erreur inattendue s\'est produite.',
    }
  }

  // Envoi direct au webhook n8n
  const handleFormSubmit = async (data: SessionFormData) => {
    setLastFormData(data)
    setStep('sending')
    setN8nError(null)

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
          plagesHoraires: data.dataCourte.plagesHoraires,
          heuresParJour: data.dataCourte.plagesHoraires.reduce((sum, p) => {
            if (!p.debut || !p.fin) return sum
            const [hd, md] = p.debut.split(':').map(Number)
            const [hf, mf] = p.fin.split(':').map(Number)
            const minutes = (hf * 60 + mf) - (hd * 60 + md)
            return sum + (minutes > 0 ? minutes / 60 : 0)
          }, 0),
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
            dateFinGlobale: data.dataCAP.dateFinGlobale,
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
        let errorBody: Record<string, unknown> = {}
        try {
          errorBody = await response.json()
        } catch {
          // Body non-JSON (ex: HTML nginx) — erreur réseau/serveur
          setN8nError({
            titre: 'Serveur inaccessible',
            message: `n8n a répondu avec une erreur ${response.status} sans détail. Vérifiez que le serveur est en ligne.`,
            reseau: true,
          })
          setStep('error')
          return
        }
        setN8nError(parseN8nError(response.status, errorBody))
        setStep('error')
        return
      }

      setStep('success')
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 2000)
    } catch {
      // Erreur réseau (fetch failed, CORS, timeout…)
      setN8nError({
        titre: 'Connexion impossible',
        message: 'Impossible de joindre le serveur n8n. Vérifiez votre connexion ou contactez l\'administrateur.',
        reseau: true,
      })
      setStep('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full h-full sm:h-[95vh] md:h-[90vh] sm:max-w-2xl md:max-w-5xl flex flex-col relative overflow-hidden">

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

          {/* Erreur n8n — écran dédié */}
          {step === 'error' && n8nError && (
            <div className="flex flex-col items-center justify-center h-full gap-6 p-8 md:p-12">

              {/* Icône */}
              <div className="w-16 h-16 rounded-full bg-[rgba(var(--error),0.1)] flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-[rgb(var(--error))]" />
              </div>

              {/* Titre */}
              <div className="text-center">
                <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-1">
                  {n8nError.titre}
                </h3>
                {n8nError.message && (
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {n8nError.message}
                  </p>
                )}
              </div>

              {/* Liste des erreurs métier */}
              {n8nError.erreurs && n8nError.erreurs.length > 0 && (
                <div className="w-full max-w-lg bg-[rgba(var(--error),0.08)] border border-[rgba(var(--error),0.25)] rounded-lg p-4">
                  <p className="text-xs font-semibold text-[rgb(var(--error))] uppercase tracking-wide mb-3">
                    Détail des problèmes
                  </p>
                  <ul className="space-y-2">
                    {n8nError.erreurs.map((err, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[rgb(var(--foreground))]">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[rgb(var(--error))] flex-shrink-0" />
                        {err}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rapport technique (repliable) */}
              {n8nError.rapport && (
                <details className="w-full max-w-lg">
                  <summary className="text-xs text-[rgb(var(--muted-foreground))] cursor-pointer hover:text-[rgb(var(--foreground))] transition-colors select-none">
                    Rapport technique complet
                  </summary>
                  <pre className="mt-2 p-3 bg-[rgb(var(--secondary))] rounded-lg text-xs text-[rgb(var(--muted-foreground))] whitespace-pre-wrap break-words leading-relaxed">
                    {n8nError.rapport}
                  </pre>
                </details>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-2">
                {!n8nError.reseau && lastFormData && (
                  <button
                    onClick={handleRetourFormulaire}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Modifier la demande
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg text-sm hover:bg-[rgba(var(--border),0.5)] transition-colors"
                >
                  Fermer
                </button>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  )
}
