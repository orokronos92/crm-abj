import { Mail, Phone, FileText, Calendar, User } from 'lucide-react'

interface TabGeneralProps {
  eleve: any
}

const getProgressionColor = (progression: number) => {
  if (progression >= 80) return 'text-[rgb(var(--success))]'
  if (progression >= 50) return 'text-[rgb(var(--warning))]'
  return 'text-[rgb(var(--error))]'
}

const getMoyenneColor = (moyenne: number) => {
  if (moyenne >= 16) return 'text-[rgb(var(--success))]'
  if (moyenne >= 12) return 'text-[rgb(var(--warning))]'
  return 'text-[rgb(var(--error))]'
}

export function TabGeneral({ eleve }: TabGeneralProps) {
  const joursRestants = eleve.date_fin
    ? Math.ceil(
        (new Date(eleve.date_fin.split('/').reverse().join('-')).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Photo + Identité */}
      <div className="flex items-start gap-6 p-6 bg-[rgb(var(--secondary))] rounded-xl">
        <div className="w-24 h-24 rounded-lg border-2 border-dashed border-[rgba(var(--accent),0.4)] bg-[rgba(var(--accent),0.05)] flex items-center justify-center flex-shrink-0">
          <User className="w-10 h-10 text-[rgba(var(--accent),0.3)]" />
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
            {eleve.prenom} {eleve.nom}
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-[rgb(var(--accent))]" />
              <span className="text-base text-[rgb(var(--foreground))]">{eleve.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-[rgb(var(--accent))]" />
              <span className="text-base text-[rgb(var(--foreground))]">{eleve.telephone}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-[rgb(var(--accent))]" />
              <span className="text-sm text-[rgb(var(--muted-foreground))]">N° Dossier:</span>
              <span className="text-xl font-bold text-[rgb(var(--accent))]">{eleve.numero_dossier}</span>
            </div>
          </div>
        </div>
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="42"
              stroke="rgb(var(--secondary))"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r="42"
              stroke="rgb(var(--accent))"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - eleve.progression / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className={`text-2xl font-bold ${getProgressionColor(eleve.progression)}`}>
              {eleve.progression}%
            </p>
          </div>
        </div>
      </div>

      {/* Stats principales - 5 cartes */}
      <div className="grid grid-cols-5 gap-4">
        <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
          <p className={`text-3xl font-bold ${getMoyenneColor(eleve.moyenne)}`}>
            {eleve.moyenne.toFixed(1)}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Moyenne générale</p>
        </div>
        <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
          <p className="text-3xl font-bold text-[rgb(var(--accent))]">
            {eleve.heures_effectuees}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Heures / {eleve.heures_totales}h
          </p>
        </div>
        <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
          <p
            className={`text-3xl font-bold ${
              eleve.absences >= 3 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--foreground))]'
            }`}
          >
            {eleve.absences}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
            Absences ({eleve.absences_non_justifiees} non just.)
          </p>
        </div>
        <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
          <p
            className={`text-3xl font-bold ${
              eleve.retards >= 4 ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--foreground))]'
            }`}
          >
            {eleve.retards}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Retards</p>
        </div>
        <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg text-center">
          <p className="text-3xl font-bold text-[rgb(var(--accent))]">
            {joursRestants > 0 ? joursRestants : 0}
          </p>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">Jours restants</p>
        </div>
      </div>

      {/* Formation & Session */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Formation</p>
          <p className="text-lg font-bold text-[rgb(var(--foreground))]">{eleve.formation}</p>
        </div>
        <div className="p-4 bg-[rgb(var(--secondary))] rounded-lg">
          <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2">Session</p>
          <p className="text-lg font-bold text-[rgb(var(--foreground))]">{eleve.session}</p>
        </div>
      </div>

      {/* Prochaine évaluation */}
      {eleve.prochaine_eval && eleve.prochaine_eval !== 'À planifier' && (
        <div className="p-4 bg-gradient-to-r from-[rgba(var(--accent),0.1)] to-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[rgb(var(--accent))]" />
            <span className="text-sm font-medium text-[rgb(var(--foreground))]">
              Prochaine évaluation : {eleve.prochaine_eval}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}