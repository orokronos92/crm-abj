'use client'

import { useState } from 'react'
import { X, FileText, CheckCircle, Loader2, Euro, GraduationCap, CreditCard, User, MessageSquare } from 'lucide-react'

interface GenererDevisModalProps {
  prospect: {
    idProspect: string
    nom: string
    prenom: string
    email: string
    telephone?: string
    formationPrincipale?: string
  }
  onClose: () => void
  onSuccess: () => void
}

const FORMATIONS_TARIFS = [
  { code: 'CAP_BJ', nom: 'CAP Bijouterie-Joaillerie', tarif: 8500, duree: '800h' },
  { code: 'INIT_BJ', nom: 'Initiation Bijouterie', tarif: 1200, duree: '40h' },
  { code: 'PERF_SERTI', nom: 'Perfectionnement Sertissage', tarif: 3200, duree: '120h' },
  { code: 'CAO_DAO', nom: 'CAO/DAO Bijouterie', tarif: 2800, duree: '80h' },
  { code: 'GEMMO', nom: 'Gemmologie', tarif: 2400, duree: '60h' },
]

const MODES_FINANCEMENT = [
  { code: 'CPF', nom: 'CPF (Compte Personnel de Formation)' },
  { code: 'OPCO', nom: 'OPCO (Opérateur de Compétences)' },
  { code: 'POLE_EMPLOI', nom: 'France Travail (Pôle Emploi)' },
  { code: 'PERSONNEL', nom: 'Financement personnel' },
  { code: 'ENTREPRISE', nom: 'Prise en charge entreprise' },
]

export function GenererDevisModal({
  prospect,
  onClose,
  onSuccess
}: GenererDevisModalProps) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Trouver la formation par défaut
  const formationParDefaut = FORMATIONS_TARIFS.find(f =>
    prospect.formationPrincipale && (
      f.nom.toLowerCase().includes(prospect.formationPrincipale.toLowerCase()) ||
      prospect.formationPrincipale.toLowerCase().includes(f.nom.toLowerCase())
    )
  ) || FORMATIONS_TARIFS[0]

  const [formData, setFormData] = useState({
    formationCode: formationParDefaut.code,
    modeFinancement: 'CPF',
    messageMarjorie: ''
  })

  const formationSelectionnee = FORMATIONS_TARIFS.find(f => f.code === formData.formationCode) || formationParDefaut

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      const response = await fetch('/api/prospects/generer-devis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idProspect: prospect.idProspect,
          formationCode: formData.formationCode,
          montant: formationSelectionnee.tarif,
          modeFinancement: formData.modeFinancement,
          messageMarjorie: formData.messageMarjorie || undefined
        })
      })

      const result = await response.json()

      if (response.status === 202 && result.success) {
        // Demande envoyée avec succès
        setSubmitted(true)
        // Auto-close après 3 secondes
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 3000)
      } else if (response.status === 409) {
        // Génération déjà en cours
        alert(result.message || 'Une génération de devis est déjà en cours pour ce prospect')
        onClose()
      } else {
        alert(result.error || 'Erreur lors de la génération du devis')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la génération du devis')
    } finally {
      setSubmitting(false)
    }
  }

  // Demande envoyée avec succès
  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">
              Demande envoyée
            </h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              La demande de génération de devis pour <strong>{prospect.prenom} {prospect.nom}</strong> a été transmise à Marjorie.
            </p>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                📄 Le devis pour <strong>{formationSelectionnee.nom}</strong> ({formationSelectionnee.tarif}€) sera généré et envoyé sous peu.
              </p>
            </div>
            <div className="p-3 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.1)] w-full">
              <p className="text-sm text-[rgb(var(--foreground))]">
                🔔 Vous serez averti par les notifications lorsque le devis sera envoyé.
              </p>
            </div>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Fermeture automatique dans 3 secondes...
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Modal de confirmation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-4xl flex flex-col max-h-[90vh]">
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
                Sélectionner la formation et le mode de financement
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
            {/* Informations prospect */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                Prospect concerné
              </h3>
              <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.1)] rounded-lg space-y-2">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-[rgb(var(--accent))]" />
                  <span className="font-medium text-[rgb(var(--foreground))]">
                    {prospect.prenom} {prospect.nom}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
                  <span className="text-sm text-[rgb(var(--foreground))]">
                    {prospect.email}
                  </span>
                </div>
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
                {FORMATIONS_TARIFS.map((formation) => (
                  <option key={formation.code} value={formation.code}>
                    {formation.nom} ({formation.duree}) - {formation.tarif}€
                  </option>
                ))}
              </select>
            </div>

            {/* Sélection mode financement */}
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
                {MODES_FINANCEMENT.map((mode) => (
                  <option key={mode.code} value={mode.code}>
                    {mode.nom}
                  </option>
                ))}
              </select>
            </div>

            {/* Aperçu montant */}
            <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.3)] rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Euro className="w-5 h-5 text-[rgb(var(--success))]" />
                  <div>
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">Montant du devis</p>
                    <p className="text-2xl font-bold text-[rgb(var(--success))]">
                      {formationSelectionnee.tarif}€
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Durée</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {formationSelectionnee.duree}
                  </p>
                </div>
              </div>
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
                placeholder="Ex: Appliquer une ristourne de 10% pour ce prospect, conditions particulières de paiement, etc."
                rows={3}
                className="w-full px-4 py-2 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none text-sm"
                disabled={submitting}
              />
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                💡 Exemples : ristourne, facilités de paiement, tarif préférentiel, etc.
              </p>
            </div>

            {/* Ce qui va se passer */}
            <div>
              <h3 className="text-sm font-medium text-[rgb(var(--accent))] uppercase tracking-wider mb-3">
                Ce qui va se passer
              </h3>
              <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg space-y-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(var(--accent),0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[rgb(var(--accent))]">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Génération du devis personnalisé
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Marjorie crée un devis professionnel avec toutes les informations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(var(--accent),0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[rgb(var(--accent))]">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Envoi du devis par email
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Le devis est envoyé à {prospect.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(var(--accent),0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[rgb(var(--accent))]">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Suivi du devis
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Le statut du prospect sera mis à jour automatiquement
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[rgba(var(--accent),0.2)] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[rgb(var(--accent))]">4</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      Notification de confirmation
                    </p>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">
                      Vous recevrez une notification lorsque le devis sera envoyé
                    </p>
                  </div>
                </div>
              </div>
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
                  <FileText className="w-4 h-4" />
                  Générer et envoyer le devis
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
