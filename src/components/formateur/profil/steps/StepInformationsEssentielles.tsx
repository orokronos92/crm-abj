'use client'

import { User } from 'lucide-react'
import { useProfilFormateur } from '@/contexts/ProfilFormateurContext'

export function StepInformationsEssentielles() {
  const { profil, updateProfil } = useProfilFormateur()

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="flex items-start gap-3 p-4 bg-[rgba(var(--accent),0.05)] rounded-lg border border-[rgba(var(--accent),0.2)]">
        <User className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-[rgb(var(--foreground))] mb-1">
            Informations professionnelles essentielles
          </p>
          <p className="text-[rgb(var(--muted-foreground))]">
            Renseignez vos années d'expérience, votre tarif horaire et une courte présentation professionnelle.
            Ces informations permettent de mieux vous identifier et valoriser votre profil.
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="space-y-6">
        {/* Années d'expérience - Grid 2 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Années d'expérience métier *
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={profil.anneesExperienceMetier || ''}
              onChange={(e) => updateProfil('anneesExperienceMetier', parseInt(e.target.value) || 0)}
              placeholder="Ex: 15"
              className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] text-lg"
              required
            />
            <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
              Nombre d'années d'expérience dans votre métier (bijouterie, joaillerie, etc.)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Années d'expérience enseignement *
            </label>
            <input
              type="number"
              min="0"
              max="50"
              value={profil.anneesExperienceEnseignement || ''}
              onChange={(e) => updateProfil('anneesExperienceEnseignement', parseInt(e.target.value) || 0)}
              placeholder="Ex: 8"
              className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] text-lg"
              required
            />
            <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
              Nombre d'années d'expérience en tant que formateur
            </p>
          </div>
        </div>

        {/* Tarif horaire */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Tarif horaire *
          </label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={profil.tarifHoraire || ''}
            onChange={(e) => updateProfil('tarifHoraire', parseFloat(e.target.value) || 0)}
            placeholder="Ex: 45 (en euros par heure)"
            className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] text-lg"
            required
          />
          <p className="mt-1.5 text-xs text-[rgb(var(--muted-foreground))]">
            Votre tarif horaire de formateur en euros (hors taxes)
          </p>
        </div>

        {/* Bio / Présentation */}
        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Bio / Présentation professionnelle *
          </label>
          <textarea
            value={profil.bio || ''}
            onChange={(e) => updateProfil('bio', e.target.value)}
            placeholder="Présentez-vous en quelques lignes : votre parcours, vos spécialités, votre approche pédagogique..."
            rows={6}
            className="w-full px-4 py-3 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] placeholder:text-[rgb(var(--muted-foreground))] focus:outline-none focus:border-[rgb(var(--accent))] resize-none"
            required
          />
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Minimum 100 caractères recommandés
            </p>
            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              {profil.bio?.length || 0} caractères
            </p>
          </div>
        </div>

        {/* Récapitulatif visuel */}
        {(profil.anneesExperienceMetier > 0 || profil.anneesExperienceEnseignement > 0 || profil.tarifHoraire > 0) && (
          <div className="p-4 bg-[rgba(var(--success),0.05)] border border-[rgba(var(--success),0.2)] rounded-lg">
            <p className="text-sm font-medium text-[rgb(var(--foreground))] mb-3">
              Récapitulatif de votre profil
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profil.anneesExperienceMetier > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                    {profil.anneesExperienceMetier}
                  </div>
                  <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    ans métier
                  </div>
                </div>
              )}
              {profil.anneesExperienceEnseignement > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                    {profil.anneesExperienceEnseignement}
                  </div>
                  <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    ans enseignement
                  </div>
                </div>
              )}
              {profil.tarifHoraire > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[rgb(var(--accent))]">
                    {profil.tarifHoraire}€
                  </div>
                  <div className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                    tarif horaire
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}