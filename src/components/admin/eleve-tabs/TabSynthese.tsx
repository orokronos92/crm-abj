'use client'

import { useState } from 'react'
import { GraduationCap, Euro, AlertTriangle, Send, CheckCircle } from 'lucide-react'
import { useActionNotification } from '@/hooks/use-action-notification'

interface TabSyntheseProps {
  eleve: any
}

export function TabSynthese({ eleve }: TabSyntheseProps) {
  const hasAlert = eleve.alertes && eleve.alertes.length > 0
  const [sendingRappel, setSendingRappel] = useState(false)
  const [rappelSent, setRappelSent] = useState(false)
  const { createActionNotification } = useActionNotification()

  const handleEnvoyerRappel = async () => {
    if (!eleve) return

    setSendingRappel(true)
    try {
      // 1. Créer vraie notification en BDD
      const { notificationId, userId: currentUserId } = await createActionNotification({
        categorie: 'ELEVE',
        type: 'RAPPEL_PAIEMENT',
        priorite: 'HAUTE',
        titre: `Rappel de paiement envoyé à ${eleve.prenom} ${eleve.nom}`,
        message: `Reste à payer: ${eleve.reste_a_payer.toLocaleString('fr-FR')}€ - Dossier ${eleve.numero_dossier}`,
        entiteType: 'eleve',
        entiteId: eleve.id.toString(),
        actionRequise: true,
        typeAction: 'RELANCER'
      })

      // 2. Construire le payload enrichi
      const payload = {
        // === IDENTIFICATION ACTION ===
        actionType: 'ENVOYER_RAPPEL_PAIEMENT_ELEVE',
        actionSource: 'admin.eleves.synthese',
        actionButton: 'envoyer_rappel_paiement',

        // === CONTEXTE MÉTIER ===
        entiteType: 'eleve',
        entiteId: eleve.id.toString(),
        entiteData: {
          idEleve: eleve.id,
          numeroDossier: eleve.numero_dossier,
          nom: eleve.nom,
          prenom: eleve.prenom,
          email: eleve.email,
          telephone: eleve.telephone,
          formation: eleve.formation
        },

        // === DÉCISION UTILISATEUR ===
        decidePar: currentUserId,
        decisionType: 'relance_paiement',
        commentaire: `Rappel de paiement pour ${eleve.prenom} ${eleve.nom}`,

        // === MÉTADONNÉES SPÉCIFIQUES ===
        metadonnees: {
          numeroDossier: eleve.numero_dossier,
          montantTotal: eleve.montant_total,
          montantPaye: eleve.montant_paye,
          resteAPayer: eleve.reste_a_payer,
          modeFinancement: eleve.financement
        },

        // === CONFIGURATION RÉPONSE ===
        responseConfig: {
          callbackUrl: `${window.location.origin}/api/webhook/callback`,
          updateNotification: true,
          expectedResponse: 'rappel_sent',
          timeoutSeconds: 30
        }
      }

      const response = await fetch(`/api/notifications/${notificationId}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (response.status === 202 && result.success) {
        // Demande envoyée avec succès
        setRappelSent(true)
        setTimeout(() => setRappelSent(false), 5000) // Reset après 5 secondes
      } else if (response.status === 409) {
        // Envoi déjà en cours
        alert(result.message || 'Un rappel de paiement est déjà en cours pour cet élève')
      } else {
        alert(result.error || 'Erreur lors de l\'envoi du rappel de paiement')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'envoi du rappel de paiement')
    } finally {
      setSendingRappel(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Formation & encadrement */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
          Formation & encadrement
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formation</p>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{eleve.formation}</p>
          </div>
          <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Session</p>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{eleve.session}</p>
          </div>
          <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Formateur principal</p>
            <p className="text-sm font-medium text-[rgb(var(--accent))]">
              {eleve.formateur_principal}
            </p>
          </div>
          <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Salle</p>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">{eleve.salle}</p>
          </div>
          <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Période</p>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
              {eleve.date_debut} → {eleve.date_fin || 'En cours'}
            </p>
          </div>
          <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">N° Dossier</p>
            <p className="text-sm font-medium font-mono text-[rgb(var(--accent))]">
              {eleve.numero_dossier}
            </p>
          </div>
        </div>
      </div>

      {/* Financement */}
      <div>
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-4 flex items-center gap-2">
          <Euro className="w-5 h-5 text-[rgb(var(--accent))]" />
          Financement
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Mode de financement</p>
            <p className="text-sm font-medium text-[rgb(var(--accent))]">{eleve.financement}</p>
          </div>
          <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Montant total</p>
            <p className="text-sm font-medium text-[rgb(var(--foreground))]">
              {eleve.montant_total.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
            <p className="text-xs text-[rgb(var(--success))] mb-1">Montant payé</p>
            <p className="text-sm font-medium text-[rgb(var(--success))]">
              {eleve.montant_paye.toLocaleString('fr-FR')} €
            </p>
          </div>
          <div
            className={`p-4 rounded-lg ${
              eleve.reste_a_payer > 0
                ? 'bg-[rgba(var(--error),0.05)] border border-[rgba(var(--error),0.2)]'
                : 'bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)]'
            }`}
          >
            <p
              className={`text-xs mb-1 ${
                eleve.reste_a_payer > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'
              }`}
            >
              Reste à payer
            </p>
            <p
              className={`text-sm font-medium ${
                eleve.reste_a_payer > 0 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'
              }`}
            >
              {eleve.reste_a_payer.toLocaleString('fr-FR')} €
            </p>
          </div>
        </div>
        {eleve.reste_a_payer > 0 && (
          <button
            onClick={handleEnvoyerRappel}
            disabled={sendingRappel || rappelSent}
            className="w-full mt-4 px-4 py-2.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {sendingRappel ? (
              <>
                <div className="w-4 h-4 border-2 border-[rgb(var(--primary))] border-t-transparent rounded-full animate-spin"></div>
                Envoi en cours...
              </>
            ) : rappelSent ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Rappel envoyé !
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Envoyer rappel de paiement
              </>
            )}
          </button>
        )}
      </div>

      {/* Alertes si nécessaire */}
      {hasAlert && (
        <div className="p-4 bg-[rgba(var(--error),0.05)] border border-[rgba(var(--error),0.2)] rounded-xl">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[rgb(var(--error))] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[rgb(var(--error))] mb-2">
                Alertes détectées :
              </p>
              <ul className="text-sm text-[rgb(var(--foreground))] space-y-1">
                {eleve.alertes.map((alerte: any, idx: number) => (
                  <li key={idx}>• {alerte.message}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Adresse */}
      {eleve.adresse && (
        <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Adresse</p>
          <p className="text-sm text-[rgb(var(--foreground))]">
            {eleve.adresse}
            {eleve.code_postal && eleve.ville && (
              <>
                <br />
                {eleve.code_postal} {eleve.ville}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  )
}