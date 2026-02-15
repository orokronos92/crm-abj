interface TabHistoriqueProps {
  eleve: any
}

export function TabHistorique({ eleve }: TabHistoriqueProps) {
  if (!eleve.historique || eleve.historique.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
          Historique chronologique
        </h3>
        <div className="text-center py-12">
          <p className="text-[rgb(var(--muted-foreground))]">Aucun événement dans l'historique</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
        Historique chronologique
      </h3>
      <div className="space-y-3">
        {eleve.historique.map((event: any, index: number) => (
          <div key={index} className="flex items-start gap-4 p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <div
              className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                event.type === 'success'
                  ? 'bg-[rgb(var(--success))]'
                  : event.type === 'warning'
                  ? 'bg-[rgb(var(--warning))]'
                  : event.type === 'error'
                  ? 'bg-[rgb(var(--error))]'
                  : 'bg-[rgb(var(--accent))]'
              }`}
            />
            <div className="flex-1">
              <p className="text-xs text-[rgb(var(--muted-foreground))]">{event.date}</p>
              <p className="text-sm text-[rgb(var(--foreground))] mt-1">{event.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Notes générales si disponibles */}
      {eleve.notes_generales && (
        <div className="mt-6 p-4 bg-[rgb(var(--secondary))] rounded-lg">
          <h4 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-2">
            Notes générales
          </h4>
          <p className="text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap">
            {eleve.notes_generales}
          </p>
        </div>
      )}
    </div>
  )
}