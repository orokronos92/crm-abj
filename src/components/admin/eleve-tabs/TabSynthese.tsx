import { GraduationCap, Euro, AlertTriangle, Send } from 'lucide-react'

interface TabSyntheseProps {
  eleve: any
}

export function TabSynthese({ eleve }: TabSyntheseProps) {
  const hasAlert = eleve.alertes && eleve.alertes.length > 0

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
          <button className="w-full mt-4 px-4 py-2.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            Envoyer rappel de paiement
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