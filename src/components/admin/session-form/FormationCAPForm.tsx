'use client'

import { useState, useEffect } from 'react'
import { Calendar, Users, Clock, AlertCircle, MapPin, User } from 'lucide-react'
import { ProgrammeMatieresEditor } from './ProgrammeMatieresEditor'
import type { FormationCAPData, JourSemaine, Matiere, PeriodeInterdite } from './session-form.types'

interface FormationCAPFormProps {
  onSubmit: (data: FormationCAPData) => void
  onBack: () => void
}

const JOURS_SEMAINE: { value: JourSemaine; label: string }[] = [
  { value: 'LUNDI', label: 'Lundi' },
  { value: 'MARDI', label: 'Mardi' },
  { value: 'MERCREDI', label: 'Mercredi' },
  { value: 'JEUDI', label: 'Jeudi' },
  { value: 'VENDREDI', label: 'Vendredi' },
  { value: 'SAMEDI', label: 'Samedi' },
  { value: 'DIMANCHE', label: 'Dimanche' }
]

export function FormationCAPForm({ onSubmit, onBack }: FormationCAPFormProps) {
  const [formData, setFormData] = useState<FormationCAPData>({
    codeFormation: '',
    nomSession: '',
    dateDebutGlobale: '',
    dureeMois: 10,
    nbParticipants: 12,
    joursActifs: ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'],
    periodesInterdites: [],
    programme: [],
    formateurs: [],
    salles: [],
    formateurMultiMatieresAutorise: true,
    salleMultiMatieresAutorise: true,
    formateursPlanifierPlusTard: false,
    sallesPlanifierPlusTard: false,
    matieresEnParallele: true
  })

  const [formations, setFormations] = useState<any[]>([])
  const [formateursDisponibles, setFormateursDisponibles] = useState<any[]>([])
  const [sallesDisponibles, setSallesDisponibles] = useState<any[]>([])
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // TODO: Charger formations CAP depuis API
    setFormations([
      { code: 'CAP_BJ', nom: 'CAP Bijouterie-Joaillerie' },
      { code: 'CAP_ATBJ', nom: 'CAP Art et Techniques de la Bijouterie-Joaillerie' }
    ])

    // TODO: Charger formateurs et salles
    setFormateursDisponibles([
      { id: 1, nom: 'Laurent Dupont', matieres: ['Sertissage', 'Polissage'] },
      { id: 2, nom: 'Marie Bernard', matieres: ['Joaillerie création'] },
      { id: 3, nom: 'Thomas Petit', matieres: ['CAO/DAO', 'Dessin technique'] }
    ])

    setSallesDisponibles([
      { id: 1, nom: 'Atelier A', capacite: 15 },
      { id: 2, nom: 'Atelier B', capacite: 10 },
      { id: 3, nom: 'Salle informatique', capacite: 12 }
    ])
  }, [])

  const handleJourToggle = (jour: JourSemaine) => {
    setFormData(prev => ({
      ...prev,
      joursActifs: prev.joursActifs.includes(jour)
        ? prev.joursActifs.filter(j => j !== jour)
        : [...prev.joursActifs, jour]
    }))
  }

  const handleFormateurToggle = (formateur: any) => {
    setFormData(prev => {
      const exists = prev.formateurs.find(f => f.id === formateur.id)
      return {
        ...prev,
        formateurs: exists
          ? prev.formateurs.filter(f => f.id !== formateur.id)
          : [...prev.formateurs, { id: formateur.id, nom: formateur.nom, matieres: formateur.matieres }]
      }
    })
  }

  const handleSalleToggle = (salle: any) => {
    setFormData(prev => {
      const exists = prev.salles.find(s => s.id === salle.id)
      return {
        ...prev,
        salles: exists
          ? prev.salles.filter(s => s.id !== salle.id)
          : [...prev.salles, { id: salle.id, nom: salle.nom, capacite: salle.capacite }]
      }
    })
  }

  const handleAjouterPeriodeInterdite = () => {
    setFormData(prev => ({
      ...prev,
      periodesInterdites: [
        ...prev.periodesInterdites,
        { debut: '', fin: '', motif: '' }
      ]
    }))
  }

  const handleSupprimerPeriodeInterdite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      periodesInterdites: prev.periodesInterdites.filter((_, i) => i !== index)
    }))
  }

  const handleModifierPeriodeInterdite = (index: number, field: keyof PeriodeInterdite, value: string) => {
    setFormData(prev => ({
      ...prev,
      periodesInterdites: prev.periodesInterdites.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      )
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: string[] = []

    if (!formData.codeFormation) newErrors.push('Formation CAP requise')
    if (!formData.nomSession.trim()) newErrors.push('Nom de session requis')
    if (!formData.dateDebutGlobale) newErrors.push('Date de début requise')
    if (formData.dureeMois <= 0) newErrors.push('Durée invalide')
    if (formData.joursActifs.length === 0) newErrors.push('Au moins un jour actif requis')
    if (formData.nbParticipants <= 0) newErrors.push('Nombre de participants invalide')
    if (formData.programme.length === 0) newErrors.push('Programme vide (ajoutez au moins une matière)')

    const totalHeures = formData.programme.reduce((sum, m) => sum + m.heures, 0)
    if (totalHeures < 720 || totalHeures > 880) {
      newErrors.push(`Total heures programme hors limites (${totalHeures}h, attendu 720-880h)`)
    }

    if (!formData.formateursPlanifierPlusTard && formData.formateurs.length === 0) {
      newErrors.push('Aucun formateur sélectionné (ou cochez "Planifier sans formateurs")')
    }

    if (!formData.sallesPlanifierPlusTard && formData.salles.length === 0) {
      newErrors.push('Aucune salle sélectionnée (ou cochez "Planifier sans salles")')
    }

    if (newErrors.length > 0) {
      setErrors(newErrors)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
          Formation CAP
        </h2>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Planification complexe avec programme de matières et optimisation IA
        </p>
      </div>

      {errors.length > 0 && (
        <div className="p-4 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-[rgb(var(--error))] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[rgb(var(--foreground))]">
              <p className="font-medium mb-2">Erreurs de validation :</p>
              {errors.map((error, i) => (
                <div key={i}>• {error}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Informations Générales */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgba(var(--border),0.3)] pb-2">
          1. Informations Générales
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Formation CAP *
            </label>
            <select
              value={formData.codeFormation}
              onChange={(e) => setFormData({ ...formData, codeFormation: e.target.value })}
              className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              required
            >
              <option value="">Sélectionner un CAP</option>
              {formations.map(f => (
                <option key={f.code} value={f.code}>{f.nom}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Nom de la session *
            </label>
            <input
              type="text"
              value={formData.nomSession}
              onChange={(e) => setFormData({ ...formData, nomSession: e.target.value })}
              className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              placeholder="Ex: CAP Bijouterie - Promotion Mars 2026"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de début *
            </label>
            <input
              type="date"
              value={formData.dateDebutGlobale}
              onChange={(e) => setFormData({ ...formData, dateDebutGlobale: e.target.value })}
              className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              Durée (mois) *
            </label>
            <input
              type="number"
              value={formData.dureeMois}
              onChange={(e) => setFormData({ ...formData, dureeMois: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              min="1"
              max="24"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Participants *
            </label>
            <input
              type="number"
              value={formData.nbParticipants}
              onChange={(e) => setFormData({ ...formData, nbParticipants: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
              min="1"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Rythme et Contraintes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgba(var(--border),0.3)] pb-2">
          2. Rythme et Contraintes
        </h3>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Jours actifs *
          </label>
          <div className="flex flex-wrap gap-2">
            {JOURS_SEMAINE.map(jour => (
              <button
                key={jour.value}
                type="button"
                onClick={() => handleJourToggle(jour.value)}
                className={`px-4 py-2 rounded-lg border-2 transition-all ${
                  formData.joursActifs.includes(jour.value)
                    ? 'bg-[rgb(var(--accent))] text-[rgb(var(--primary))] border-[rgb(var(--accent))]'
                    : 'bg-[rgb(var(--secondary))] text-[rgb(var(--muted-foreground))] border-[rgba(var(--border),0.5)] hover:border-[rgb(var(--accent))]'
                }`}
              >
                {jour.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2">
            Par défaut : Lundi-Vendredi. Cochez Samedi/Dimanche pour formations intensives week-end
          </p>
        </div>

        <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                ⏰ Amplitude : 08h00-21h00 tous les jours actifs (créneaux 30min)
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                💡 Marjorie optimisera l'utilisation des salles sur ces plages horaires
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Périodes interdites (optionnel)
          </label>
          {formData.periodesInterdites.map((periode, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 mb-2">
              <div className="col-span-4">
                <input
                  type="date"
                  value={periode.debut}
                  onChange={(e) => handleModifierPeriodeInterdite(index, 'debut', e.target.value)}
                  className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))]"
                  placeholder="Date début"
                />
              </div>
              <div className="col-span-4">
                <input
                  type="date"
                  value={periode.fin}
                  onChange={(e) => handleModifierPeriodeInterdite(index, 'fin', e.target.value)}
                  className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))]"
                  placeholder="Date fin"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="text"
                  value={periode.motif}
                  onChange={(e) => handleModifierPeriodeInterdite(index, 'motif', e.target.value)}
                  className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-sm text-[rgb(var(--foreground))]"
                  placeholder="Motif"
                />
              </div>
              <div className="col-span-1 flex items-center">
                <button
                  type="button"
                  onClick={() => handleSupprimerPeriodeInterdite(index)}
                  className="p-2 hover:bg-[rgba(var(--error),0.1)] rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAjouterPeriodeInterdite}
            className="text-sm text-[rgb(var(--accent))] hover:underline"
          >
            + Ajouter une période interdite
          </button>
        </div>
      </div>

      {/* Section 3: Programme */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgba(var(--border),0.3)] pb-2">
          3. Programme de Matières
        </h3>
        <ProgrammeMatieresEditor
          matieres={formData.programme}
          onChange={(matieres) => setFormData({ ...formData, programme: matieres })}
        />
      </div>

      {/* Section 4: Ressources */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgba(var(--border),0.3)] pb-2">
          4. Ressources (Formateurs et Salles)
        </h3>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              <User className="w-4 h-4 inline mr-1" />
              Formateurs disponibles
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={formData.formateursPlanifierPlusTard}
                onChange={(e) => setFormData({ ...formData, formateursPlanifierPlusTard: e.target.checked })}
                className="rounded"
              />
              ⏳ Planifier sans formateurs (à assigner plus tard)
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {formateursDisponibles.map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => handleFormateurToggle(f)}
                disabled={formData.formateursPlanifierPlusTard}
                className={`p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                  formData.formateurs.find(fm => fm.id === f.id)
                    ? 'bg-[rgba(var(--accent),0.1)] border-[rgb(var(--accent))]'
                    : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.5)] hover:border-[rgb(var(--accent))]'
                }`}
              >
                <p className="font-medium text-sm">{f.nom}</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {f.matieres.join(', ')}
                </p>
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs mt-2">
            <input
              type="checkbox"
              checked={formData.formateurMultiMatieresAutorise}
              onChange={(e) => setFormData({ ...formData, formateurMultiMatieresAutorise: e.target.checked })}
              className="rounded"
            />
            Autoriser un formateur à enseigner plusieurs matières
          </label>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-[rgb(var(--foreground))]">
              <MapPin className="w-4 h-4 inline mr-1" />
              Salles disponibles
            </label>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={formData.sallesPlanifierPlusTard}
                onChange={(e) => setFormData({ ...formData, sallesPlanifierPlusTard: e.target.checked })}
                className="rounded"
              />
              ⏳ Planifier sans salles (à assigner plus tard)
            </label>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {sallesDisponibles.map(s => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSalleToggle(s)}
                disabled={formData.sallesPlanifierPlusTard}
                className={`p-3 rounded-lg border-2 text-left transition-all disabled:opacity-50 ${
                  formData.salles.find(sl => sl.id === s.id)
                    ? 'bg-[rgba(var(--accent),0.1)] border-[rgb(var(--accent))]'
                    : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.5)] hover:border-[rgb(var(--accent))]'
                }`}
              >
                <p className="font-medium text-sm">{s.nom}</p>
                <p className="text-xs text-[rgb(var(--muted-foreground))]">
                  {s.capacite} places
                </p>
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-xs mt-2">
            <input
              type="checkbox"
              checked={formData.salleMultiMatieresAutorise}
              onChange={(e) => setFormData({ ...formData, salleMultiMatieresAutorise: e.target.checked })}
              className="rounded"
            />
            Une salle peut accueillir plusieurs matières
          </label>
        </div>
      </div>

      {/* Section 5: Contraintes Pédagogiques */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgba(var(--border),0.3)] pb-2">
          5. Contraintes Pédagogiques (Optionnel)
        </h3>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Matières en parallèle autorisées ?
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.matieresEnParallele === true}
                onChange={() => setFormData({ ...formData, matieresEnParallele: true })}
                className="rounded-full"
              />
              <span className="text-sm">Oui (ex: Théorie matin, Pratique après-midi)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={formData.matieresEnParallele === false}
                onChange={() => setFormData({ ...formData, matieresEnParallele: false })}
                className="rounded-full"
              />
              <span className="text-sm">Non (une matière à la fois)</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Notes complémentaires pour l'IA
          </label>
          <textarea
            value={formData.notesComplementaires}
            onChange={(e) => setFormData({ ...formData, notesComplementaires: e.target.value })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
            rows={3}
            placeholder="Ex: Privilégier sertissage en début de formation, éviter CAO/DAO le vendredi..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[rgba(var(--border),0.3)]">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-2.5 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
        >
          Retour
        </button>
        <button
          type="submit"
          className="px-6 py-2.5 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-colors font-medium"
        >
          Continuer →
        </button>
      </div>
    </form>
  )
}
