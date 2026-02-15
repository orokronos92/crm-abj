'use client'

import { User, Mail, Phone, MapPin, Award, Calendar, Clock, Briefcase } from 'lucide-react'

interface FormateurProfilTabProps {
  formateur: any
}

export function FormateurProfilTab({ formateur }: FormateurProfilTabProps) {
  return (
    <div className="space-y-6">
      {/* Informations personnelles */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-[rgb(var(--accent))]" />
          Informations personnelles
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Nom complet</p>
            <p className="font-medium">{formateur.prenom} {formateur.nom}</p>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Statut</p>
            <span className={`badge ${formateur.statut === 'ACTIF' ? 'badge-success' : 'badge-warning'}`}>
              {formateur.statut}
            </span>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Email</p>
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
              {formateur.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Téléphone</p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[rgb(var(--text-tertiary))]" />
              {formateur.telephone || 'Non renseigné'}
            </p>
          </div>
        </div>
      </div>

      {/* Expérience */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-[rgb(var(--accent))]" />
          Expérience professionnelle
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience métier</p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.anneesExperience || 0}
              <span className="text-sm ml-1">ans</span>
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Expérience enseignement</p>
            <p className="text-2xl font-bold text-[rgb(var(--accent))]">
              {formateur.anneesEnseignement || 0}
              <span className="text-sm ml-1">ans</span>
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Élèves formés</p>
            <p className="text-2xl font-bold text-[rgb(var(--foreground))]">
              {formateur.nombreElevesFormes || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Bio */}
      {formateur.bio && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-[rgb(var(--accent))]" />
            Biographie
          </h3>
          <p className="text-[rgb(var(--text-secondary))] whitespace-pre-wrap">
            {formateur.bio}
          </p>
        </div>
      )}

      {/* Spécialités */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Spécialités</h3>
        <div className="flex flex-wrap gap-2">
          {formateur.specialites?.map((spec: string) => (
            <span key={spec} className="badge badge-info">
              {spec.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Langues parlées */}
      {formateur.languesParlees && formateur.languesParlees.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Langues parlées</h3>
          <div className="flex flex-wrap gap-2">
            {formateur.languesParlees.map((langue: string) => (
              <span key={langue} className="badge">
                {langue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tarification */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Tarification</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Tarif journalier</p>
            <p className="text-xl font-bold">
              {formateur.tarifJournalier || 0}€
              <span className="text-sm font-normal ml-1">/jour</span>
            </p>
          </div>
          <div className="bg-[rgb(var(--secondary))] rounded-lg p-4">
            <p className="text-sm text-[rgb(var(--muted-foreground))] mb-1">Taux horaire calculé</p>
            <p className="text-xl font-bold text-[rgb(var(--accent))]">
              {(formateur.tauxHoraire || 0).toFixed(0)}€
              <span className="text-sm font-normal ml-1">/heure</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}