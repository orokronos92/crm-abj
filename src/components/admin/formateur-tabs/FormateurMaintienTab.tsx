'use client'

import { BookOpen, Calendar, Award, RefreshCw, Clock, CheckCircle, X, GraduationCap, Eye, FileCheck } from 'lucide-react'

interface FormateurMaintienTabProps {
  formateur: any
}

export function FormateurMaintienTab({ formateur }: FormateurMaintienTabProps) {
  return (
    <div className="space-y-6">
      {/* Formations continues */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
            Formations continues suivies
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.formationsContinues?.length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.formationsContinues?.length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.formationsContinues.length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
        {formateur.formationsContinues?.length > 0 ? (
          <div className="space-y-3">
            {formateur.formationsContinues.map((formation: any) => (
              <div key={formation.id} className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-[rgb(var(--foreground))]">{formation.intitule}</p>
                    {formation.organisme && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        {formation.organisme}
                      </p>
                    )}
                    {formation.domaine && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        Domaine : {formation.domaine}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {(formation.dateDebut || formation.dateFin) && (
                        <span className="text-sm text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formation.dateDebut && formation.dateFin
                            ? `${formation.dateDebut} → ${formation.dateFin}`
                            : formation.dateDebut || formation.dateFin}
                        </span>
                      )}
                      {formation.dureeHeures && (
                        <span className="text-sm text-[rgb(var(--text-tertiary))] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formation.dureeHeures}h
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${
                    formation.statut === 'VALIDE' ? 'badge-success' :
                    formation.statut === 'EN_ATTENTE' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {formation.statut}
                  </span>
                </div>
                {formation.certificatUrl && (
                  <a
                    href={formation.certificatUrl}
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
              Aucune formation continue renseignée. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
        )}
      </div>

      {/* Publications et articles */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
            Publications et articles
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.publicationsArticles?.length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.publicationsArticles?.length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.publicationsArticles.length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
        {formateur.publicationsArticles?.length > 0 ? (
          <div className="space-y-2">
            {formateur.publicationsArticles.map((article: string, index: number) => (
              <div key={index} className="bg-[rgb(var(--secondary))] rounded-lg p-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-[rgb(var(--accent))]" />
                <span>{article}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Aucune publication renseignée. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
        )}
      </div>

      {/* Formations pédagogiques */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
            Formations pédagogiques
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.formationsPedagogiques?.length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.formationsPedagogiques?.length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.formationsPedagogiques.length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
        {formateur.formationsPedagogiques?.length > 0 ? (
          <div className="space-y-3">
            {formateur.formationsPedagogiques.map((formation: any) => (
              <div key={formation.id} className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-[rgb(var(--foreground))]">{formation.intitule}</p>
                    {formation.organisme && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        Organisme : {formation.organisme}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {formation.dateFormation && (
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formation.dateFormation}
                        </p>
                      )}
                      {formation.dureeHeures && (
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {formation.dureeHeures}h
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`badge ${
                    formation.statut === 'VALIDE' ? 'badge-success' :
                    formation.statut === 'EN_ATTENTE' ? 'badge-warning' :
                    'badge-info'
                  }`}>
                    {formation.statut}
                  </span>
                </div>
                {formation.certificatUrl && (
                  <a
                    href={formation.certificatUrl}
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
              Aucune formation pédagogique renseignée. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
        )}
      </div>

      {/* Veille professionnelle */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="w-5 h-5 text-[rgb(var(--accent))]" />
            Veille professionnelle
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.veilleProfessionnelle?.length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.veilleProfessionnelle?.length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.veilleProfessionnelle.length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
        {formateur.veilleProfessionnelle?.length > 0 ? (
          <div className="space-y-3">
            {formateur.veilleProfessionnelle.map((veille: any) => (
              <div key={veille.id} className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`badge ${
                        veille.type === 'LECTURE' ? 'badge-info' :
                        veille.type === 'CONFERENCE' ? 'badge-warning' :
                        veille.type === 'SALON' ? 'badge-success' :
                        'badge-info'
                      }`}>
                        {veille.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="font-medium text-[rgb(var(--foreground))]">{veille.nomActivite}</p>
                    {veille.organisme && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                        {veille.organisme}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {veille.dateActivite && (
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {veille.dateActivite}
                        </p>
                      )}
                      {veille.duree && veille.uniteDuree && (
                        <p className="text-xs text-[rgb(var(--text-tertiary))]">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {veille.duree} {veille.uniteDuree}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Aucune activité de veille professionnelle renseignée. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
        )}
      </div>

      {/* Prochaines certifications à renouveler */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-[rgb(var(--accent))]" />
            Certifications à renouveler
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.certifications?.filter((cert: any) => cert.dateExpiration).length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.certifications?.filter((cert: any) => cert.dateExpiration).length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.certifications.filter((cert: any) => cert.dateExpiration).length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
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
          <div className="bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Aucune certification à renouveler. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
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
                if (!f.dateDebut) return false
                const year = parseInt(f.dateDebut.split('-')[0])
                return year >= new Date().getFullYear() - 1
              }).length || 0}
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Heures de formation
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--success))]">
              {formateur.formationsContinues?.reduce((acc: number, f: any) => {
                return acc + (f.dureeHeures || 0)
              }, 0) || 0}h
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}