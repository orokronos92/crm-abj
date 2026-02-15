interface TabPresencesProps {
  eleve: any
}

const PRESENCE_COLORS = {
  PRESENT: 'bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]',
  ABSENT: 'bg-[rgba(var(--error),0.2)] text-[rgb(var(--error))]',
  ABSENT_JUSTIFIE: 'bg-[rgba(var(--warning),0.2)] text-[rgb(var(--warning))]',
  RETARD: 'bg-[rgba(var(--info),0.2)] text-[rgb(var(--info))]',
}

export function TabPresences({ eleve }: TabPresencesProps) {
  if (!eleve.presences || eleve.presences.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgb(var(--muted-foreground))]">Aucune présence enregistrée</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
          Registre de présences
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgb(var(--success))]" />
            <span className="text-[rgb(var(--muted-foreground))]">Présent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgb(var(--warning))]" />
            <span className="text-[rgb(var(--muted-foreground))]">Absent justifié</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgb(var(--error))]" />
            <span className="text-[rgb(var(--muted-foreground))]">Absent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[rgb(var(--info))]" />
            <span className="text-[rgb(var(--muted-foreground))]">Retard</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {eleve.presences.map((presence: any, index: number) => (
          <div key={index} className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">{presence.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-center">
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Matin</p>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        PRESENCE_COLORS[presence.matin as keyof typeof PRESENCE_COLORS] ||
                        PRESENCE_COLORS.PRESENT
                      }`}
                    >
                      {presence.matin.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-[rgb(var(--muted-foreground))] mb-1">Après-midi</p>
                    <span
                      className={`px-3 py-1 text-xs rounded-full ${
                        PRESENCE_COLORS[presence.apres_midi as keyof typeof PRESENCE_COLORS] ||
                        PRESENCE_COLORS.PRESENT
                      }`}
                    >
                      {presence.apres_midi.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {presence.motif && (
                  <div className="ml-4 pl-4 border-l border-[rgba(var(--border),0.3)]">
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Motif :</p>
                    <p className="text-sm text-[rgb(var(--foreground))]">{presence.motif}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques de présence */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-[rgb(var(--secondary))] rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-bold text-[rgb(var(--foreground))]">{eleve.absences}</p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Total absences</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[rgb(var(--error))]">
            {eleve.absences_non_justifiees}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Non justifiées</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-[rgb(var(--info))]">{eleve.retards}</p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Retards</p>
        </div>
      </div>
    </div>
  )
}