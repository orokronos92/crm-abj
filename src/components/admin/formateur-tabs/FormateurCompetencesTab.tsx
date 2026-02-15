'use client'

import { Award, Star, Target, BookOpen, CheckCircle } from 'lucide-react'

interface FormateurCompetencesTabProps {
  formateur: any
}

export function FormateurCompetencesTab({ formateur }: FormateurCompetencesTabProps) {
  return (
    <div className="space-y-6">
      {/* Qualifications principales */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
          Qualifications principales
        </h3>
        <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
          <p className="text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
            {formateur.qualificationsResume || 'Aucune qualification renseignée'}
          </p>
        </div>
      </div>

      {/* Compétences techniques */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-[rgb(var(--accent))]" />
          Compétences techniques
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {formateur.competencesTechniques?.length > 0 ? (
            formateur.competencesTechniques.map((comp: string) => (
              <div key={comp} className="flex items-center gap-2 bg-[rgb(var(--secondary))] rounded-lg p-3">
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span>{comp}</span>
              </div>
            ))
          ) : (
            <p className="text-[rgb(var(--muted-foreground))] col-span-2">
              Aucune compétence technique renseignée
            </p>
          )}
        </div>
      </div>

      {/* Certifications */}
      {formateur.certifications && formateur.certifications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
            Certifications professionnelles
          </h3>
          <div className="space-y-3">
            {formateur.certifications.map((cert: any, index: number) => (
              <div key={index} className="bg-[rgb(var(--secondary))] rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{cert.nom}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      {cert.organisme}
                    </p>
                    <p className="text-sm text-[rgb(var(--text-tertiary))] mt-1">
                      Obtenue le : {new Date(cert.dateObtention).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  {cert.dateExpiration && new Date(cert.dateExpiration) < new Date() ? (
                    <span className="badge badge-error">Expirée</span>
                  ) : cert.dateExpiration ? (
                    <span className="badge badge-warning">
                      Expire le {new Date(cert.dateExpiration).toLocaleDateString('fr-FR')}
                    </span>
                  ) : (
                    <span className="badge badge-success">Valide</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques de performance */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-[rgb(var(--accent))]" />
          Indicateurs de performance
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[rgb(var(--muted-foreground))]">Satisfaction moyenne</p>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(formateur.satisfactionMoyenne || 0)
                        ? 'text-[rgb(var(--accent))] fill-[rgb(var(--accent))]'
                        : 'text-[rgb(var(--text-tertiary))]'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.satisfactionMoyenne || 0}/5
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">Taux de réussite</p>
            <p className="text-2xl font-bold text-[rgb(var(--success))]">
              {formateur.tauxReussite || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Portfolio */}
      {formateur.portfolio?.travaux && formateur.portfolio.travaux.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Portfolio & Réalisations</h3>
          <div className="grid grid-cols-2 gap-4">
            {formateur.portfolio.travaux.map((travail: any, index: number) => (
              <div key={index} className="bg-[rgb(var(--secondary))] rounded-lg p-4">
                <p className="font-medium">{travail.titre}</p>
                <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                  {travail.description}
                </p>
                <p className="text-sm text-[rgb(var(--text-tertiary))] mt-2">
                  {travail.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Témoignages */}
      {formateur.temoignagesEleves && formateur.temoignagesEleves.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Témoignages d'élèves</h3>
          <div className="space-y-3">
            {formateur.temoignagesEleves.slice(0, 3).map((temoignage: any, index: number) => (
              <div key={index} className="bg-[rgb(var(--secondary))] rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">{temoignage.nom}</p>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= temoignage.note
                            ? 'text-[rgb(var(--accent))] fill-[rgb(var(--accent))]'
                            : 'text-[rgb(var(--text-tertiary))]'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[rgb(var(--text-secondary))]">
                  "{temoignage.texte}"
                </p>
                <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2">
                  {new Date(temoignage.date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}