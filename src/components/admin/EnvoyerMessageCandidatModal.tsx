'use client'

import { useState, useRef } from 'react'
import { X, Mail, CheckCircle, AlertCircle, Loader2, User, FileText, GraduationCap } from 'lucide-react'
import { useCallbackListener } from '@/hooks/use-callback-listener'

interface EnvoyerMessageCandidatModalProps {
  candidat: {
    idCandidat: number
    numeroDossier: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    formation?: string
  }
  onClose: () => void
  onSuccess: () => void
}

export function EnvoyerMessageCandidatModal({
  candidat,
  onClose,
  onSuccess
}: EnvoyerMessageCandidatModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [actionStatus, setActionStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle')
  const correlationId = useRef(crypto.randomUUID())

  useCallbackListener({
    correlationId: correlationId.current,
    onCallback: (status) => {
      setSubmitting(false)
      setActionStatus(status)
      if (status === 'success') {
        setTimeout(() => { onSuccess(); onClose() }, 5000)
      }
    },
    timeoutSeconds: 60
  })

  const [formData, setFormData] = useState({
    objet: '',
    contenu: ''
  })

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.objet.trim() || !formData.contenu.trim()) {
      alert('Veuillez remplir l\'objet et le message')
      return
    }

    setSubmitting(true)
    // Passer en pending AVANT l'envoi pour afficher le spinner immédiatement
    setActionStatus('pending')

    try {
      const payload = {
        // === CORRÉLATION ===
        correlationId: correlationId.current,

        // === IDENTIFICATION ACTION ===
        actionType: 'ENVOYER_MESSAGE_CANDIDAT',
        actionSource: 'admin.candidats.detail',
        actionButton: 'envoyer_message',

        // === CONTEXTE MÉTIER ===
        entiteType: 'candidat',
        entiteId: candidat.idCandidat.toString(),
        entiteData: {
          idCandidat: candidat.idCandidat,
          numeroDossier: candidat.numeroDossier,
          nom: candidat.nom,
          prenom: candidat.prenom,
          email: candidat.email,
          telephone: candidat.telephone,
          formation: candidat.formation
        },

        // === DÉCISION UTILISATEUR ===
        decisionType: 'envoi_message',
        commentaire: formData.objet,

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          objet: formData.objet,
          contenu: formData.contenu,
          destinataire: candidat.email,
          numeroDossier: candidat.numeroDossier
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          expectedResponse: 'message_sent',
          timeoutSeconds: 30
        }
      }

      const response = await fetch('/api/actions/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Demande envoyée — on reste en pending, le callback SSE passera à success
      } else if (response.status === 409) {
        // Envoi déjà en cours
        alert(result.message || 'Un envoi de message est déjà en cours pour ce candidat')
        setSubmitting(false)
        onClose()
      } else {
        setSubmitting(false)
        alert(result.error || 'Erreur lors de l\'envoi du message')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSubmitting(false)
      alert('Erreur lors de l\'envoi du message')
    }
  }

  // En attente de confirmation n8n
  if (actionStatus === 'pending') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--accent),0.1)] rounded-full">
              <Loader2 className="w-12 h-12 text-[rgb(var(--accent))] animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Envoi en cours...
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Marjorie traite votre message pour <strong>{candidat.prenom} {candidat.nom}</strong>.
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              En attente de confirmation (max 60s)...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Message envoyé avec succès
  if (actionStatus === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Message envoyé
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Le message pour <strong>{candidat.prenom} {candidat.nom}</strong> a été envoyé avec succès.
            </p>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                📧 Email envoyé à <strong>{candidat.email}</strong>
              </p>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Fermeture automatique dans 5 secondes...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Erreur lors de l'envoi
  if (actionStatus === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-full">
              <AlertCircle className="w-12 h-12 text-[rgb(var(--error))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Erreur d'envoi
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              L'envoi du message n'a pas pu être confirmé. Vérifiez les notifications pour plus de détails.
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

  // Modal de composition de message
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-4xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <Mail className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Envoyer un message
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Composer un email personnalisé pour le candidat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Informations candidat */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                Destinataire
              </h3>
              <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    {candidat.prenom} {candidat.nom}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--foreground))]">
                    {candidat.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--muted-foreground))]">
                    N° Dossier : {candidat.numeroDossier}
                  </span>
                </div>
                {candidat.formation && (
                  <div className="flex items-center gap-3">
                    <GraduationCap className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      Formation : {candidat.formation}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Objet de l'email */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Objet du message *
              </label>
              <input
                type="text"
                value={formData.objet}
                onChange={(e) => handleChange('objet', e.target.value)}
                placeholder="Ex: Suivi de votre candidature - Documents manquants"
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                disabled={submitting}
                required
              />
            </div>

            {/* Contenu du message */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
                Message *
              </label>
              <textarea
                value={formData.contenu}
                onChange={(e) => handleChange('contenu', e.target.value)}
                placeholder="Ex: Bonjour,&#10;&#10;Nous avons bien reçu votre dossier de candidature. Cependant, nous constatons qu'il manque certains documents...&#10;&#10;Cordialement,&#10;L'équipe ABJ"
                rows={10}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
                disabled={submitting}
                required
              />
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                💡 Astuce : Soyez clair et professionnel. Marjorie conservera l'historique de cet échange dans le dossier candidat.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.05)] rounded-lg font-medium transition-all"
              disabled={submitting}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Envoyer le message
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
