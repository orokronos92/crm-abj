'use client'

import { useState, useRef } from 'react'
import { X, FileText, CheckCircle, AlertCircle, Loader2, Euro, GraduationCap, CreditCard, User, MessageSquare } from 'lucide-react'
import { useCallbackListener } from '@/hooks/use-callback-listener'

import type { FormationCatalogue } from './GenererDevisModal'

interface GenererDevisCandidatModalProps {
  candidat: {
    idCandidat: number
    numeroDossier: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    formation?: string
  }
  formations: FormationCatalogue[]
  onClose: () => void
  onSuccess: () => void
}

const MODES_FINANCEMENT = [
  { code: 'CPF', nom: 'CPF (Compte Personnel de Formation)' },
  { code: 'OPCO', nom: 'OPCO (Opérateur de Compétences)' },
  { code: 'POLE_EMPLOI', nom: 'France Travail (Pôle Emploi)' },
  { code: 'PERSONNEL', nom: 'Financement personnel' },
  { code: 'ENTREPRISE', nom: 'Prise en charge entreprise' },
]

export function GenererDevisCandidatModal({
  candidat,
  formations,
  onClose,
  onSuccess
}: GenererDevisCandidatModalProps) {
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

  // Trouver la formation par défaut (correspondance avec la formation du candidat)
  const formationParDefaut = formations.find(f =>
    candidat.formation && (
      f.nom.toLowerCase().includes(candidat.formation.toLowerCase()) ||
      candidat.formation.toLowerCase().includes(f.nom.toLowerCase()) ||
      f.code.toLowerCase() === candidat.formation.toLowerCase()
    )
  ) || formations[0]

  const [formData, setFormData] = useState({
    formationCode: formationParDefaut?.code ?? '',
    modeFinancement: 'CPF',
    messageMarjorie: ''
  })

  const formationSelectionnee = formations.find(f => f.code === formData.formationCode) || formationParDefaut

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    // Passer en pending AVANT l'envoi pour afficher le spinner immédiatement
    setActionStatus('pending')

    try {
      const payload = {
        // === CORRÉLATION ===
        correlationId: correlationId.current,

        // === IDENTIFICATION ACTION ===
        actionType: 'GENERER_DEVIS_CANDIDAT',
        actionSource: 'admin.candidats.detail',
        actionButton: 'generer_devis',

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
        decisionType: 'generation_devis',
        commentaire: formData.messageMarjorie || `Génération devis pour ${formationSelectionnee.nom}`,

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          formationCode: formData.formationCode,
          formationNom: formationSelectionnee.nom,
          montant: formationSelectionnee.tarif,
          duree: formationSelectionnee.duree,
          modeFinancement: formData.modeFinancement,
          instructionsSpeciales: formData.messageMarjorie,
          numeroDossier: candidat.numeroDossier
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          expectedResponse: 'devis_generated',
          timeoutSeconds: 60 // Génération PDF peut prendre du temps
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
        // Génération déjà en cours
        alert(result.message || 'Une génération de devis est déjà en cours pour ce candidat')
        setSubmitting(false)
        onClose()
      } else {
        setSubmitting(false)
        alert(result.error || 'Erreur lors de la génération du devis')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setSubmitting(false)
      alert('Erreur lors de la génération du devis')
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
              Génération en cours...
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Marjorie génère le devis pour <strong>{candidat.prenom} {candidat.nom}</strong>.
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              En attente de confirmation (max 60s)...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Devis généré avec succès
  if (actionStatus === 'success') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Devis généré
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Le devis pour <strong>{candidat.prenom} {candidat.nom}</strong> a été généré et envoyé avec succès.
            </p>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                📄 Formation : <strong>{formationSelectionnee.nom}</strong>
              </p>
              <p className="text-sm text-[rgb(var(--foreground))] mt-1">
                💰 Montant : <strong>{formationSelectionnee.tarif}€</strong>
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

  // Erreur lors de la génération
  if (actionStatus === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-full">
              <AlertCircle className="w-12 h-12 text-[rgb(var(--error))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Erreur de génération
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              La génération du devis n&apos;a pas pu être confirmée. Vérifiez les notifications pour plus de détails.
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

  // Modal de génération de devis
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-full sm:max-w-2xl md:max-w-4xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <FileText className="w-6 h-6 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
                Générer un devis
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Créer et envoyer un devis personnalisé pour le candidat
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
                Candidat
              </h3>
              <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    {candidat.prenom} {candidat.nom}
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
                      Formation actuelle : {candidat.formation}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Sélection formation */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <GraduationCap className="w-4 h-4 inline mr-2" />
                Formation *
              </label>
              <select
                value={formData.formationCode}
                onChange={(e) => handleChange('formationCode', e.target.value)}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                disabled={submitting}
              >
                {formations.map(formation => (
                  <option key={formation.code} value={formation.code}>
                    {formation.nom} - {formation.tarif}€ ({formation.duree})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode de financement */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Mode de financement *
              </label>
              <select
                value={formData.modeFinancement}
                onChange={(e) => handleChange('modeFinancement', e.target.value)}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                disabled={submitting}
              >
                {MODES_FINANCEMENT.map(mode => (
                  <option key={mode.code} value={mode.code}>
                    {mode.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Aperçu montant */}
            <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Euro className="w-5 h-5 text-[rgb(var(--accent))]" />
                  <span className="text-sm font-medium text-[rgb(var(--foreground))]">
                    Montant du devis
                  </span>
                </div>
                <span className="text-2xl font-bold text-[rgb(var(--accent))]">
                  {formationSelectionnee.tarif}€
                </span>
              </div>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
                {formationSelectionnee.duree} de formation
              </p>
            </div>

            {/* Message pour Marjorie (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Instructions pour Marjorie (optionnel)
              </label>
              <textarea
                value={formData.messageMarjorie}
                onChange={(e) => handleChange('messageMarjorie', e.target.value)}
                placeholder="Ex: Appliquer une ristourne de 10% pour ce candidat, conditions particulières de paiement, etc."
                rows={3}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
                disabled={submitting}
              />
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                💡 Astuce : Indiquez ici toute condition particulière à appliquer au devis (remise, échelonnement, etc.)
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
                  Génération en cours...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Générer le devis
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
