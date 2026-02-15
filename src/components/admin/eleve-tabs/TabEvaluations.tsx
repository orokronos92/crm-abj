import { CheckCircle, Target } from 'lucide-react'

interface TabEvaluationsProps {
  eleve: any
}

const getMoyenneColor = (note: number) => {
  if (note >= 16) return 'text-[rgb(var(--success))]'
  if (note >= 12) return 'text-[rgb(var(--warning))]'
  return 'text-[rgb(var(--error))]'
}

const getNoteBgColor = (note: number) => {
  if (note >= 16) return 'bg-[rgba(var(--success),0.1)]'
  if (note >= 12) return 'bg-[rgba(var(--warning),0.1)]'
  return 'bg-[rgba(var(--error),0.1)]'
}

export function TabEvaluations({ eleve }: TabEvaluationsProps) {
  // Calcul de la moyenne pondérée
  const calculateMoyennePonderee = () => {
    if (!eleve.evaluations || eleve.evaluations.length === 0) return '0.00'

    const totalPoints = eleve.evaluations.reduce(
      (sum: number, e: any) => sum + (e.note * e.coefficient), 0
    )
    const totalCoeffs = eleve.evaluations.reduce(
      (sum: number, e: any) => sum + e.coefficient, 0
    )

    return totalCoeffs > 0 ? (totalPoints / totalCoeffs).toFixed(2) : '0.00'
  }

  const moyennePonderee = calculateMoyennePonderee()

  if (!eleve.evaluations || eleve.evaluations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[rgb(var(--muted-foreground))]">Aucune évaluation disponible</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats évaluations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-[rgb(var(--secondary))] rounded-xl border border-[rgba(var(--border),0.3)]">
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Nombre d'évaluations</p>
          <p className="text-4xl font-bold text-[rgb(var(--accent))]">{eleve.evaluations.length}</p>
        </div>
        <div className="p-6 bg-[rgb(var(--secondary))] rounded-xl border border-[rgba(var(--border),0.3)]">
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Moyenne pondérée</p>
          <p className={`text-4xl font-bold ${getMoyenneColor(parseFloat(moyennePonderee))}`}>
            {moyennePonderee}<span className="text-2xl">/20</span>
          </p>
        </div>
      </div>

      {/* Liste des évaluations */}
      <div className="space-y-4">
        {eleve.evaluations.map((evaluation: any, index: number) => (
          <div
            key={index}
            className="p-5 bg-[rgb(var(--secondary))] rounded-xl border border-[rgba(var(--border),0.3)] hover:border-[rgba(var(--accent),0.3)] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`text-center p-3 rounded-lg ${getNoteBgColor(evaluation.note)}`}>
                  <p className={`text-3xl font-bold ${getMoyenneColor(evaluation.note)}`}>
                    {evaluation.note}
                  </p>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">/{evaluation.note_sur}</p>
                </div>
                <div>
                  <p className="text-lg font-semibold text-[rgb(var(--foreground))]">
                    {evaluation.matiere}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      {evaluation.date}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        evaluation.type === 'CONTROLE_CONTINU' || evaluation.type === 'Pratique'
                          ? 'badge-success'
                          : 'badge-info'
                      }`}
                    >
                      {evaluation.type}
                    </span>
                    <span className="text-sm text-[rgb(var(--muted-foreground))]">
                      Coeff. {evaluation.coefficient}
                    </span>
                    {evaluation.formateur && (
                      <span className="text-sm text-[rgb(var(--accent))]">{evaluation.formateur}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {evaluation.commentaire && (
              <div className="pl-4 border-l-2 border-[rgba(var(--accent),0.3)] mb-3">
                <p className="text-sm text-[rgb(var(--foreground))] italic">
                  "{evaluation.commentaire}"
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {evaluation.competences_validees && evaluation.competences_validees.length > 0 && (
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-[rgb(var(--success))]" />
                    Compétences validées
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {evaluation.competences_validees.map((comp: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] rounded-full"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {evaluation.competences_a_travailler && evaluation.competences_a_travailler.length > 0 && (
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))] mb-2 flex items-center gap-1">
                    <Target className="w-3 h-3 text-[rgb(var(--warning))]" />
                    À travailler
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {evaluation.competences_a_travailler.map((comp: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 text-xs bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))] rounded-full"
                      >
                        {comp}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}