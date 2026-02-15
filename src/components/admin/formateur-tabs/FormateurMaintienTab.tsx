'use client'

import { BookOpen, Calendar, Award, RefreshCw, Clock } from 'lucide-react'

interface FormateurMaintienTabProps {
  formateur: any
}

export function FormateurMaintienTab({ formateur }: FormateurMaintienTabProps) {
  return (
    <div className="space-y-6">
      {/* Formations continues */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
          Formations continues suivies
        </h3>
        {formateur.formationsContinues && formateur.formationsContinues.length > 0 ? (
          <div className="space-y-3">
            {formateur.formationsContinues.map((formation: any, index: number) => (
              <div key={index} className="bg-[rgb(var(--secondary))] rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{formation.titre}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      {formation.organisme}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formation.date}
                      </span>
                      <span className="text-sm text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formation.duree}
                      </span>
                    </div>
                  </div>
                  <span className="badge badge-success">Complétée</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[rgb(var(--muted-foreground))]">
            Aucune formation continue renseignée
          </p>
        )}
      </div>

      {/* Publications et articles */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
          Publications et articles
        </h3>
        {formateur.publicationsArticles && formateur.publicationsArticles.length > 0 ? (
          <div className="space-y-2">
            {formateur.publicationsArticles.map((article: string, index: number) => (
              <div key={index} className="bg-[rgb(var(--secondary))] rounded-lg p-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[rgb(var(--accent))]" />
                <span>{article}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[rgb(var(--muted-foreground))]">
            Aucune publication renseignée
          </p>
        )}
      </div>

      {/* Prochaines certifications à renouveler */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <RefreshCw className="w-5 h-5 text-[rgb(var(--accent))]" />
          Certifications à renouveler
        </h3>
        {formateur.certifications?.filter((cert: any) => cert.dateExpiration).length > 0 ? (
          <div className="space-y-3">
            {formateur.certifications
              .filter((cert: any) => cert.dateExpiration)
              .sort((a: any, b: any) => new Date(a.dateExpiration).getTime() - new Date(b.dateExpiration).getTime())
              .map((cert: any, index: number) => {
                const expirationDate = new Date(cert.dateExpiration)
                const today = new Date()
                const daysUntilExpiration = Math.floor((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                const isExpired = daysUntilExpiration < 0
                const isUrgent = daysUntilExpiration >= 0 && daysUntilExpiration <= 30

                return (
                  <div key={index} className="bg-[rgb(var(--secondary))] rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{cert.nom}</p>
                        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                          {cert.organisme}
                        </p>
                        <p className={`text-sm mt-2 ${
                          isExpired ? 'text-[rgb(var(--error))]' :
                          isUrgent ? 'text-[rgb(var(--warning))]' :
                          'text-[rgb(var(--text-tertiary))]'
                        }`}>
                          {isExpired
                            ? `Expirée depuis ${Math.abs(daysUntilExpiration)} jours`
                            : `Expire dans ${daysUntilExpiration} jours`
                          }
                        </p>
                      </div>
                      <span className={`badge ${
                        isExpired ? 'badge-error' :
                        isUrgent ? 'badge-warning' :
                        'badge-info'
                      }`}>
                        {expirationDate.toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                )
              })}
          </div>
        ) : (
          <p className="text-[rgb(var(--muted-foreground))]">
            Aucune certification à renouveler
          </p>
        )}
      </div>

      {/* Plan de développement */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Plan de développement professionnel</h3>
        <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full"></div>
              <p className="text-sm">Maintenir les certifications à jour</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full"></div>
              <p className="text-sm">Suivre au moins 21h de formation continue par an</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full"></div>
              <p className="text-sm">Participer aux réunions pédagogiques mensuelles</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[rgb(var(--accent))] rounded-full"></div>
              <p className="text-sm">Actualiser les supports pédagogiques chaque semestre</p>
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de conformité */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Conformité Qualiopi - Indicateur 22</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Formations continues (12 derniers mois)
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.formationsContinues?.filter((f: any) => {
                const year = parseInt(f.date.split('-')[0])
                return year >= new Date().getFullYear() - 1
              }).length || 0}
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Heures de formation
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--success))]">
              {/* Calcul simplifié des heures */}
              {formateur.formationsContinues?.reduce((acc: number, f: any) => {
                const duree = parseInt(f.duree) || 0
                return acc + (f.duree.includes('jour') ? duree * 7 : duree)
              }, 0) || 0}h
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}