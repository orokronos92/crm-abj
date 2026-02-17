'use client'

import { useState } from 'react'
import { BookOpen, Plus, X, Calendar, Clock } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

export function StepFormationsPedagogiques() {
  const { profil, updateProfil } = useProfilFormateur()
  const [modeAjout, setModeAjout] = useState(false)
  const [nouvelleFormation, setNouvelleFormation] = useState({
    intitule: '',
    organisme: '',
    duree: '',
    date: '',
    competencesAcquises: ''
  })

  const ajouterFormation = () => {
    if (nouvelleFormation.intitule && nouvelleFormation.organisme && nouvelleFormation.date) {
      const formation = {
        id: Date.now().toString(),
        ...nouvelleFormation,
        competencesAcquises: nouvelleFormation.competencesAcquises ? nouvelleFormation.competencesAcquises.split(',').map(c => c.trim()) : []
      }
      updateProfil('formationsPedagogiques', [...(profil.formationsPedagogiques || []), formation])
      setNouvelleFormation({
        intitule: '',
        organisme: '',
        duree: '',
        date: '',
        competencesAcquises: ''
      })
      setModeAjout(false)
    }
  }

  const supprimerFormation = (id: string) => {
    updateProfil('formationsPedagogiques', profil.formationsPedagogiques?.filter(f => f.id !== id) || [])
  }

  return (
    <div className="space-y-6">
      {/* Description Qualiopi */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <BookOpen className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Formations pédagogiques suivies
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Indicateur 21 : Les formateurs maintiennent leurs compétences. Listez vos formations
            de formateur, formations pédagogiques, et formations liées à l'enseignement.
          </p>
        </div>
      </div>

      {/* Liste des formations */}
      {profil.formationsPedagogiques && profil.formationsPedagogiques.length > 0 && (
        <div className="space-y-3">
          {profil.formationsPedagogiques.map((formation) => (
            <div
              key={formation.id}
              className="p-4 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <h4 className="font-medium text-[rgb(var(--foreground))]">
                    {formation.intitule}
                  </h4>
                  <p className="text-sm text-[rgb(var(--muted-foreground))]">
                    {formation.organisme}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[rgb(var(--muted-foreground))]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formation.date}
                    </span>
                    {formation.duree && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formation.duree}
                      </span>
                    )}
                  </div>
                  {formation.competencesAcquises && formation.competencesAcquises.length > 0 && (
                    <p className="text-sm text-[rgb(var(--muted-foreground))]">
                      Compétences acquises : {formation.competencesAcquises.join(', ')}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => supprimerFormation(formation.id)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg transition-colors"
                  aria-label="Supprimer cette formation"
                >
                  <X className="w-4 h-4 text-[rgb(var(--error))]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulaire d'ajout */}
      {modeAjout ? (
        <div className="p-4 bg-[rgba(var(--secondary),0.3)] border border-[rgba(var(--border),0.5)] rounded-lg space-y-4">
          <h4 className="font-medium text-[rgb(var(--foreground))]">
            Ajouter une formation pédagogique
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Titre de la formation *</label>
              <input
                type="text"
                value={nouvelleFormation.intitule}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, intitule: e.target.value})}
                placeholder="Ex: Formation de formateur niveau 1"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Organisme *</label>
              <input
                type="text"
                value={nouvelleFormation.organisme}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, organisme: e.target.value})}
                placeholder="Ex: AFPA"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={nouvelleFormation.date}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, date: e.target.value})}
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Durée</label>
              <input
                type="text"
                value={nouvelleFormation.duree}
                onChange={(e) => setNouvelleFormation({...nouvelleFormation, duree: e.target.value})}
                placeholder="Ex: 35 heures"
                className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Compétences acquises</label>
            <textarea
              value={nouvelleFormation.competencesAcquises}
              onChange={(e) => setNouvelleFormation({...nouvelleFormation, competencesAcquises: e.target.value})}
              placeholder="Ex: Gestion de groupe, animation d'atelier, pédagogie différenciée..."
              rows={3}
              className="w-full px-3 py-2 bg-[rgb(var(--card))] border rounded-lg resize-none"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setModeAjout(false)}
              className="px-4 py-2 bg-[rgb(var(--secondary))] rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={ajouterFormation}
              className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg"
            >
              Ajouter
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setModeAjout(true)}
          className="w-full p-4 border-2 border-dashed border-[rgba(var(--accent),0.3)] rounded-lg hover:bg-[rgba(var(--accent),0.05)] transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5 text-[rgb(var(--accent))]" />
          <span className="text-[rgb(var(--accent))]\">Ajouter une formation pédagogique</span>
        </button>
      )}
    </div>
  )
}