'use client'

import { GraduationCap, Target, BookOpen, Lightbulb, Users } from 'lucide-react'

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