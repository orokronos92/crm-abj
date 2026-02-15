'use client'

import { BarChart, TrendingUp, Users, Calendar, Clock, Euro, CheckCircle } from 'lucide-react'

interface FormateurTracabiliteTabProps {
  formateur: any
}

export function FormateurTracabiliteTab({ formateur }: FormateurTracabiliteTabProps) {
  return (
    <div className="space-y-6">
      {/* Statistiques d'enseignement */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart className="w-5 h-5 text-[rgb(var(--accent))]" />
          Statistiques d'enseignement
        </h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Total élèves formés
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.nombreElevesFormes || 0}
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Taux de réussite
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--success))]">
              {formateur.tauxReussite || 0}%
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Satisfaction moyenne
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.satisfactionMoyenne || 0}/5
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Heures enseignées
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
              {formateur.stats?.heuresMois || 0}h
            </p>
          </div>
        </div>
      </div>

      {/* Élèves actuels */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[rgb(var(--accent))]" />
          Élèves actuels ({formateur.eleves?.length || 0})
        </h3>
        {formateur.eleves && formateur.eleves.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(var(--border),0.3)]">
                  <th className="text-left pb-2">Élève</th>
                  <th className="text-center pb-2">Formation</th>
                  <th className="text-center pb-2">Moyenne</th>
                  <th className="text-center pb-2">Progression</th>
                  <th className="text-center pb-2">Absences</th>
                  <th className="text-center pb-2">Statut</th>
                </tr>
              </thead>
              <tbody>
                {formateur.eleves.map((eleve: any) => (
                  <tr key={eleve.id} className="border-b border-[rgba(var(--border),0.2)]">
                    <td className="py-2">
                      {eleve.prenom} {eleve.nom}
                    </td>
                    <td className="py-2 text-center text-sm">
                      {eleve.formation}
                    </td>
                    <td className="py-2 text-center">
                      <span className={`font-medium ${
                        eleve.moyenne >= 15 ? 'text-[rgb(var(--success))]' :
                        eleve.moyenne >= 12 ? 'text-[rgb(var(--warning))]' :
                        'text-[rgb(var(--error))]'
                      }`}>
                        {eleve.moyenne}/20
                      </span>
                    </td>
                    <td className="py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-[rgb(var(--secondary))] rounded-full h-2">
                          <div
                            className="bg-[rgb(var(--accent))] h-2 rounded-full"
                            style={{ width: `${eleve.progression}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{eleve.progression}%</span>
                      </div>
                    </td>
                    <td className="py-2 text-center">
                      <span className={eleve.absences > 3 ? 'text-[rgb(var(--error))]' : ''}>
                        {eleve.absences}
                      </span>
                    </td>
                    <td className="py-2 text-center">
                      <span className="badge badge-success badge-sm">
                        En cours
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[rgb(var(--muted-foreground))]">Aucun élève actuellement</p>
        )}
      </div>

      {/* Interventions récentes */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[rgb(var(--accent))]" />
          Dernières interventions
        </h3>
        {formateur.interventions && formateur.interventions.length > 0 ? (
          <div className="space-y-2">
            {formateur.interventions.slice(0, 5).map((intervention: any, index: number) => (
              <div key={index} className="bg-[rgb(var(--secondary))] rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium">{intervention.session}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {intervention.date}
                    </span>
                    <span className="text-sm text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {intervention.duree}h
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    {intervention.cout}€
                  </p>
                  {intervention.payee ? (
                    <span className="badge badge-success badge-sm mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Payée
                    </span>
                  ) : (
                    <span className="badge badge-warning badge-sm mt-1">
                      En attente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[rgb(var(--muted-foreground))]">Aucune intervention récente</p>
        )}
      </div>

      {/* Indicateurs financiers */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[rgb(var(--accent))]" />
          Indicateurs financiers
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              CA mensuel
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.stats?.caMois || 0}€
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Taux horaire
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
              {(formateur.tauxHoraire || 0).toFixed(0)}€/h
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Factures en attente
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--warning))]">
              {formateur.interventions?.filter((i: any) => !i.payee).length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Conformité Qualiopi */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Conformité Qualiopi - Indicateur 21</h3>
        <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
          <p className="text-sm text-[rgb(var(--muted-foreground))] mb-3">
            Traçabilité des compétences et qualifications
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <CheckCircle className={`w-5 h-5 ${
                formateur.cvUrl ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'
              }`} />
              <span>CV à jour</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className={`w-5 h-5 ${
                formateur.documents?.some((d: any) => d.type === 'DIPLOME' && d.statut === 'VALIDE')
                  ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'
              }`} />
              <span>Diplômes vérifiés</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className={`w-5 h-5 ${
                formateur.certifications?.length > 0
                  ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'
              }`} />
              <span>Certifications enregistrées</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className={`w-5 h-5 ${
                formateur.formationsContinues?.length > 0
                  ? 'text-[rgb(var(--success))]' : 'text-[rgb(var(--error))]'
              }`} />
              <span>Formation continue suivie</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}