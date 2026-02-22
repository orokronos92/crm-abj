'use client'

import { useState } from 'react'
import { X, CheckCircle, AlertCircle, Loader2, User, Calendar, FileText, ClipboardCheck } from 'lucide-react'

export type EtapeType = 'entretienTelephonique' | 'rdvPresentiel' | 'testTechnique' | 'validationPedagogique'

const ETAPE_LABELS: Record<EtapeType, { label: string; icon: string }> = {
  entretienTelephonique: { label: 'Entretien téléphonique', icon: '📞' },
  rdvPresentiel:         { label: 'RDV présentiel',         icon: '🤝' },
  testTechnique:         { label: 'Test technique',         icon: '🔧' },
  validationPedagogique: { label: 'Validation pédagogique', icon: '🎓' },
}

interface ValiderEtapeModalProps {
  candidat: {
    idCandidat: number
    numeroDossier: string
    nom: string
    prenom: string
    formation?: string
  }
  etape: EtapeType
  onClose: () => void
  onSuccess: () => void
}

export function ValiderEtapeModal({ candidat, etape, onClose, onSuccess }: ValiderEtapeModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [actionStatus, setActionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const today = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    dateValidation: today,
    validePar: '',
    observation: '',
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.validePar.trim()) {
      alert('Veuillez indiquer le nom du validateur')
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/candidats/valider-etape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idCandidat: candidat.idCandidat,
          etape,
          dateValidation: formData.dateValidation,
          validePar: formData.validePar,
          observation: formData.observation,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setActionStatus('success')
        setTimeout(() => { onSuccess(); onClose() }, 4000)
      } else {
        setSubmitting(false)
        setActionStatus('error')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSubmitting(false)
      setActionStatus('error')
    }
  }

  const etapeInfo = ETAPE_LABELS[etape]

  // Succès
  if (actionStatus === 'success') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Étape validée
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              <strong>{etapeInfo.icon} {etapeInfo.label}</strong> a été validée pour{' '}
              <strong>{candidat.prenom} {candidat.nom}</strong>.
            </p>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full text-left space-y-1">
              <p className="text-sm text-[rgb(var(--foreground))]">
                ✅ Validé par : <strong>{formData.validePar}</strong>
              </p>
              <p className="text-sm text-[rgb(var(--foreground))]">
                📅 Date : <strong>{new Date(formData.dateValidation).toLocaleDateString('fr-FR')}</strong>
              </p>
              {formData.observation && (
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  💬 {formData.observation}
                </p>
              )}
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Fermeture automatique dans 4 secondes...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Erreur
  if (actionStatus === 'error') {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-full">
              <AlertCircle className="w-12 h-12 text-[rgb(var(--error))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Erreur de validation
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              La validation n'a pas pu être confirmée. Vérifiez les notifications pour plus de détails.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Formulaire principal
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <ClipboardCheck className="w-5 h-5 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[rgb(var(--foreground))]">
                Valider l'étape
              </h2>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">
                {etapeInfo.icon} {etapeInfo.label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Candidat info */}
        <div className="px-5 pt-4">
          <div className="flex items-center gap-2 p-3 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg">
            <User className="w-4 h-4 text-[rgb(var(--accent))] flex-shrink-0" />
            <span className="text-sm font-medium text-[rgb(var(--foreground))]">
              {candidat.prenom} {candidat.nom}
            </span>
            <span className="text-xs text-[rgb(var(--muted-foreground))] ml-auto">
              {candidat.numeroDossier}
            </span>
          </div>
        </div>

        {/* Formulaire */}
        <div className="p-5 space-y-4">
          {/* Date de validation (auto, readonly) */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
              Date de validation
            </label>
            <input
              type="date"
              value={formData.dateValidation}
              onChange={(e) => handleChange('dateValidation', e.target.value)}
              className="w-full px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] text-sm focus:border-[rgb(var(--accent))] focus:outline-none"
              disabled={submitting}
            />
          </div>

          {/* Validateur */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1.5" />
              Validé par <span className="text-[rgb(var(--error))]">*</span>
            </label>
            <input
              type="text"
              value={formData.validePar}
              onChange={(e) => handleChange('validePar', e.target.value)}
              placeholder="Nom du validateur (ex: Marie Dupont)"
              className="w-full px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] text-sm focus:border-[rgb(var(--accent))] focus:outline-none"
              disabled={submitting}
              required
              autoFocus
            />
          </div>

          {/* Observation */}
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-1.5">
              <FileText className="w-3.5 h-3.5 inline mr-1.5" />
              Observation
              <span className="text-xs text-[rgb(var(--muted-foreground))] ml-1">(optionnel)</span>
            </label>
            <textarea
              value={formData.observation}
              onChange={(e) => handleChange('observation', e.target.value)}
              placeholder="Notes sur l'étape, points importants, commentaires..."
              rows={3}
              className="w-full px-3 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] text-sm focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
              disabled={submitting}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))] rounded-b-lg">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg font-medium text-sm transition-all"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.validePar.trim()}
              className="px-5 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium text-sm hover:bg-[rgb(var(--accent-light))] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Valider
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
