'use client'

import { GraduationCap, Target, BookOpen, Lightbulb, Users, Award, CheckCircle, X, Eye } from 'lucide-react'

interface FormateurExpertiseTabProps {
  formateur: any
}

export function FormateurExpertiseTab({ formateur }: FormateurExpertiseTabProps) {
  return (
    <div className="space-y-6">
      {/* Méthodes pédagogiques */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-[rgb(var(--accent))]" />
          Méthodes pédagogiques
        </h3>
        <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
          <p className="text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
            {formateur.methodesPedagogiques || 'Méthodes pédagogiques non renseignées'}
          </p>
        </div>
      </div>

      {/* Approche pédagogique */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-[rgb(var(--accent))]" />
          Approche pédagogique personnalisée
        </h3>
        <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
          <p className="text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
            {formateur.approchePedagogique || 'Approche pédagogique non renseignée'}
          </p>
        </div>
      </div>

      {/* Outils et supports */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[rgb(var(--accent))]" />
          Outils et supports pédagogiques
        </h3>
        {formateur.outilsSupports && formateur.outilsSupports.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {formateur.outilsSupports.map((outil: string) => (
              <div key={outil} className="bg-[rgb(var(--secondary))] rounded-lg p-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-[rgb(var(--accent))]" />
                <span>{outil}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[rgb(var(--muted-foreground))]">Aucun outil renseigné</p>
        )}
      </div>

      {/* Sessions et interventions */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[rgb(var(--accent))]" />
          Sessions actuelles
        </h3>
        {formateur.sessions && formateur.sessions.length > 0 ? (
          <div className="space-y-3">
            {formateur.sessions.map((session: any) => (
              <div key={session.id} className="bg-[rgb(var(--secondary))] rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{session.nomSession}</p>
                    <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                      {session.formation}
                    </p>
                    <p className="text-sm text-[rgb(var(--text-tertiary))] mt-1">
                      {session.dateDebut} - {session.dateFin}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-info">{session.statut}</span>
                    <p className="text-sm mt-1">{session.nbEleves} élèves</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[rgb(var(--muted-foreground))]">Aucune session en cours</p>
        )}
      </div>

      {/* Portfolio et réalisations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
            Portfolio et réalisations
          </h3>
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{
            backgroundColor: formateur.portfolio?.length > 0 ? 'rgba(var(--success), 0.1)' : 'rgba(var(--warning), 0.1)'
          }}>
            {formateur.portfolio?.length > 0 ? (
              <>
                <CheckCircle className="w-4 h-4 text-[rgb(var(--success))]" />
                <span className="text-sm font-medium text-[rgb(var(--success))]">Renseigné ({formateur.portfolio.length})</span>
              </>
            ) : (
              <>
                <X className="w-4 h-4 text-[rgb(var(--warning))]" />
                <span className="text-sm font-medium text-[rgb(var(--warning))]">Non renseigné</span>
              </>
            )}
          </div>
        </div>
        {formateur.portfolio?.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {formateur.portfolio.map((realisation: any) => (
              <div key={realisation.id} className="bg-[rgb(var(--secondary))] rounded-lg p-4 border border-[rgba(var(--border),0.3)]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-[rgb(var(--foreground))]">{realisation.titre}</p>
                    {realisation.description && (
                      <p className="text-sm text-[rgb(var(--muted-foreground))] mt-2 line-clamp-2">
                        {realisation.description}
                      </p>
                    )}
                    {realisation.annee && (
                      <p className="text-xs text-[rgb(var(--text-tertiary))] mt-2">
                        Année : {realisation.annee}
                      </p>
                    )}
                  </div>
                </div>
                {realisation.imageUrl && (
                  <a
                    href={realisation.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[rgb(var(--accent))] hover:underline flex items-center gap-1 mt-2"
                  >
                    <Eye className="w-3 h-3" />
                    Voir l'image
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Aucune réalisation renseignée. Le formateur peut compléter son profil via l'interface formateur.
            </p>
          </div>
        )}
      </div>

      {/* Indicateurs pédagogiques */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Indicateurs pédagogiques</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Élèves actifs
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.elevesActifs || 0}
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Sessions actives
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
              {formateur.sessionsActives || 0}
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Heures/semaine
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.heuresHebdo || 0}h
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-2">
              Taux présence
            </p>
            <p className="text-2xl font-bold text-[rgb(var(--success))]">
              {formateur.stats?.tauxPresence || 95}%
            </p>
          </div>
        </div>
      </div>

      {/* Formations enseignées */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Formations enseignées</h3>
        <div className="flex flex-wrap gap-2">
          {formateur.formationsEnseignees?.map((id: number) => {
            const formations: Record<number, string> = {
              1: 'CAP Bijouterie-Joaillerie',
              2: 'Sertissage Niveau 1',
              3: 'CAO/DAO Bijouterie'
            }
            return (
              <span key={id} className="badge badge-info">
                {formations[id] || `Formation ${id}`}
              </span>
            )
          }) || <p className="text-[rgb(var(--muted-foreground))]">Aucune formation assignée</p>}
        </div>
      </div>
    </div>
  )
}