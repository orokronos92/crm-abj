'use client'

import { Award, Star, Target, BookOpen, CheckCircle, Edit, GraduationCap, FileCheck, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface FormateurCompetencesTabProps {
  formateur: any
}

export function FormateurCompetencesTab({ formateur }: FormateurCompetencesTabProps) {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="pb-4 border-b border-[rgba(var(--border),0.3)]">
        <h2 className="text-xl font-bold text-[rgb(var(--foreground))]">Compétences et qualifications</h2>
        <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
          Le formateur met à jour ses qualifications via son interface personnelle
        </p>
      </div>

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

      {/* Diplômes métier */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
            Diplômes métier
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.diplomes?.length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.diplomes?.length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.diplomes.length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
        {formateur.diplomes?.length > 0 ? (
          <div className="space-y-3">
            {formateur.diplomes.map((diplome: any) => (
              <div key={diplome.id} className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-[rgb(var(--foreground))]">{diplome.nomDiplome}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      {diplome.typeFormation.replace(/_/g, ' ')}
                      {diplome.specialite && ` — ${diplome.specialite}`}
                    </p>
                    {diplome.etablissement && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        {diplome.etablissement}
                        {diplome.ville && ` (${diplome.ville})`}
                      </p>
                    )}
                    {diplome.dateObtention && (
                      <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2">
                        Obtenu le {diplome.dateObtention}
                      </p>
                    )}
                  </div>
                  <span className={`badge ${
                    diplome.statut === 'VALIDE' ? 'badge-success' :
                    diplome.statut === 'EN_ATTENTE' ? 'badge-warning' :
                    'badge-error'
                  }`}>
                    {diplome.statut}
                  </span>
                </div>
                {diplome.documentUrl && (
                  <a
                    href={diplome.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[rgb(var(--accent))] hover:underline flex items-center gap-1 mt-2"
                  >
                    <FileCheck className="w-3 h-3" />
                    Voir le justificatif
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Aucun diplôme renseigné. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
        )}
      </div>

      {/* Certifications professionnelles détaillées */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
            Certifications professionnelles
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.certifications?.length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.certifications?.length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.certifications.length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
        {formateur.certifications?.length > 0 ? (
          <div className="space-y-3">
            {formateur.certifications.map((cert: any) => (
              <div key={cert.id} className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-[rgb(var(--foreground))]">{cert.nomCertification}</p>
                    {cert.organisme && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        Délivré par {cert.organisme}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {cert.dateObtention && (
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">
                          Obtenue le {cert.dateObtention}
                        </p>
                      )}
                      {cert.dateExpiration && (
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">
                          Expire le {cert.dateExpiration}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${
                    cert.statut === 'VALIDE' ? 'badge-success' :
                    cert.statut === 'EXPIRE' ? 'badge-error' :
                    cert.statut === 'EN_ATTENTE' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {cert.statut}
                  </span>
                </div>
                {cert.documentUrl && (
                  <a
                    href={cert.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[rgb(var(--accent))] hover:underline flex items-center gap-1 mt-2"
                  >
                    <FileCheck className="w-3 h-3" />
                    Voir le certificat
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Aucune certification renseignée. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
        )}
      </div>

      {/* Compétences techniques structurées */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Target className="w-5 h-5 text-[rgb(var(--accent))]" />
            Compétences techniques détaillées
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.competencesTechniques?.length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.competencesTechniques?.length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.competencesTechniques.length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
        {formateur.competencesTechniques?.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {formateur.competencesTechniques.map((comp: any) => (
              <div key={comp.id} className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-[rgb(var(--foreground))]">{comp.technique}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      Domaine : {comp.domaine}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`badge ${
                    comp.niveau === 'EXPERT' || comp.niveau === 'MAITRE' ? 'badge-success' :
                    comp.niveau === 'AVANCE' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {comp.niveau}
                  </span>
                  {comp.anneesPratique && (
                    <span className="text-xs text-[rgb(var(--text-tertiary))]">
                      {comp.anneesPratique} ans de pratique
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Aucune compétence technique détaillée renseignée. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
        )}
      </div>

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