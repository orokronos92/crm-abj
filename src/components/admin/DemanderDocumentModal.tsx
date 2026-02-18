/**
 * Modal pour demander un document à un formateur
 * Workflow: CRM → n8n → Email envoyé demandant le document
 * Pattern: Fire-and-forget (202 Accepted)
 */

'use client'

import { useState } from 'react'
import { X, FileText, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface DemanderDocumentModalProps {
  formateur: {
    idFormateur: number
    nom: string
    prenom: string
    email: string
  }
  document: {
    codeTypeDocument: string
    libelle: string
    statut?: string
  }
  onClose: () => void
  onSuccess?: () => void
}

const MOTIFS = [
  { value: 'ABSENT', label: 'Document absent', icon: AlertCircle },
  { value: 'PERIME', label: 'Document périmé à mettre à jour', icon: AlertCircle },
  { value: 'INCOMPLET', label: 'Document incomplet ou illisible', icon: AlertCircle },
  { value: 'NON_CONFORME', label: 'Document non conforme aux exigences', icon: AlertCircle },
]

export function DemanderDocumentModal({
  formateur,
  document,
  onClose,
  onSuccess
}: DemanderDocumentModalProps) {
  const [motifSelectionne, setMotifSelectionne] = useState<string>('ABSENT')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!motifSelectionne) {
      setError('Veuillez sélectionner un motif')
      return
    }

    setSending(true)
    setError(null)

    try {
      const response = await fetch('/api/formateurs/demander-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idFormateur: formateur.idFormateur,
          destinataire: formateur.email,
          codeTypeDocument: document.codeTypeDocument,
          libelleDocument: document.libelle,
          motif: motifSelectionne
        })
      })

      const result = await response.json()

      if (response.status === 202 && result.success) {
        // Succès : 202 Accepted (traitement en arrière-plan)
        setSent(true)

        // Appeler le callback de succès si fourni
        if (onSuccess) {
          onSuccess()
        }

        // Fermer automatiquement après 2 secondes
        setTimeout(() => {
          onClose()
        }, 2000)
      } else if (response.status === 409) {
        // Conflit : demande déjà en cours
        setError(result.message || 'Une demande est déjà en cours pour ce document')
      } else {
        // Autre erreur
        setError(result.error || 'Erreur lors de l\'envoi de la demande')
      }
    } catch (err) {
      console.error('Erreur:', err)
      setError('Erreur lors de l\'envoi de la demande')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-lg flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <FileText className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Demander un document
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {formateur.prenom} {formateur.nom}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={sending}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 p-6">
          <div className="space-y-4">
            {/* Document concerné */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Document concerné
              </label>
              <div className="px-4 py-3 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg">
                <p className="font-medium text-[rgb(var(--foreground))]">{document.libelle}</p>
                {document.statut && (
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    Statut actuel : {document.statut}
                  </p>
                )}
              </div>
            </div>

            {/* Motif de la demande */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                Motif de la demande <span className="text-[rgb(var(--error))]">*</span>
              </label>
              <div className="space-y-2">
                {MOTIFS.map((motif) => {
                  const Icon = motif.icon
                  const isSelected = motifSelectionne === motif.value
                  return (
                    <label
                      key={motif.value}
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                        ${isSelected
                          ? 'border-[rgb(var(--accent))] bg-[rgba(var(--accent),0.1)]'
                          : 'border-[rgba(var(--border),0.5)] hover:border-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)]'
                        }
                      `}
                    >
                      <input
                        type="radio"
                        name="motif"
                        value={motif.value}
                        checked={isSelected}
                        onChange={(e) => setMotifSelectionne(e.target.value)}
                        className="w-4 h-4 text-[rgb(var(--accent))] focus:ring-[rgb(var(--accent))]"
                      />
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-[rgb(var(--accent))]' : 'text-[rgb(var(--muted-foreground))]'}`} />
                      <span className={`text-sm ${isSelected ? 'text-[rgb(var(--foreground))] font-medium' : 'text-[rgb(var(--muted-foreground))]'}`}>
                        {motif.label}
                      </span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="p-4 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg">
                <p className="text-sm text-[rgb(var(--error))]">{error}</p>
              </div>
            )}

            {/* Message de succès */}
            {sent && (
              <div className="p-4 bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.3)] rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-[rgb(var(--success))]" />
                  <p className="text-sm text-[rgb(var(--success))]">
                    Demande transmise à Marjorie pour envoi
                  </p>
                </div>
              </div>
            )}
          </div>
        </form>

        {/* Footer avec boutons */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="px-4 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={sending || sent}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : sent ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Envoyé
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Envoyer la demande
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
