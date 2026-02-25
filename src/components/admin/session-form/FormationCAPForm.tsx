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
    dateFinGlobale: '',
    nbParticipants: 12,
    joursActifs: ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI'],
    plageHoraire: {
      matin: { debut: '09:00', fin: '12:00' },
      apresMidi: { debut: '13:00', fin: '17:00' }
    },
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        const [resFormations, resFormateurs, resSalles] = await Promise.all([
          fetch('/api/formations?actif=true'),
          fetch('/api/formateurs?statut=ACTIF'),
          fetch('/api/salles'),
        ])

        if (resFormations.ok) {
          const data = await resFormations.json()
          const formationsList = (data.formations || []) as any[]
          // Filtrer les formations CAP uniquement
          setFormations(formationsList.filter((f: any) => f.categorie === 'CAP'))
        }

        if (resFormateurs.ok) {
          const data = await resFormateurs.json()
          setFormateursDisponibles(
            (data.formateurs || []).map((f: any) => ({
              id: f.idFormateur,
              nom: `${f.prenom} ${f.nom}`,
              matieres: f.specialites || [],
            }))
          )
        }

        if (resSalles.ok) {
          const data = await resSalles.json()
          setSallesDisponibles(
            (data.salles || []).map((s: any) => ({
              id: s.idSalle,
              nom: s.nom,
              capacite: s.capaciteMax || 0,
            }))
          )
        }
      } catch (err) {
        console.error('Erreur chargement données CAP:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
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
    if (!formData.dateFinGlobale) newErrors.push('Date de fin requise')
    if (formData.dateFinGlobale && formData.dateDebutGlobale && formData.dateFinGlobale <= formData.dateDebutGlobale) {
      newErrors.push('La date de fin doit être après la date de début')
    }
    if (formData.joursActifs.length === 0) newErrors.push('Au moins un jour actif requis')
    if (formData.nbParticipants <= 0) newErrors.push('Nombre de participants invalide')
    if (formData.programme.length === 0) newErrors.push('Programme vide (ajoutez au moins une matière)')

    const totalHeures = formData.programme.reduce((sum, m) => sum + m.heures, 0)
    if (totalHeures < 720 || totalHeures > 880) {
      newErrors.push(`Total heures programme hors limites (${totalHeures}h, attendu 720-880h)`)
    }

    // Validation des vœux par matière (optionnel car Marjorie peut planifier sans vœux)
    // Les vœux sont maintenant dans chaque matière : salleVoeux[] et formateurVoeux[]

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
        {loading && (
          <p className="text-xs text-[rgb(var(--muted-foreground))] mt-2 animate-pulse">
            Chargement des formations, formateurs et salles...
          </p>
        )}
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
              <Calendar className="w-4 h-4 inline mr-1" />
              Date de fin *
            </label>
            <input
              type="date"
              value={formData.dateFinGlobale}
              onChange={(e) => setFormData({ ...formData, dateFinGlobale: e.target.value })}
              className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
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

      {/* Section 2: Plage Horaire de la Session */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgba(var(--border),0.3)] pb-2">
          2. Plage Horaire de la Session
        </h3>

        <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
          <div className="flex items-start gap-2 mb-4">
            <Clock className="w-5 h-5 text-[rgb(var(--accent))] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                Définissez les créneaux horaires quotidiens pour toute la session
              </p>
              <p className="text-xs text-[rgb(var(--muted-foreground))] mt-1">
                Ex: CAP Sertissage 2026 → 9h-12h et 13h-17h tous les jours de formation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Créneau Matin */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Matin
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">
                    Début
                  </label>
                  <input
                    type="time"
                    value={formData.plageHoraire.matin.debut}
                    onChange={(e) => setFormData({
                      ...formData,
                      plageHoraire: {
                        ...formData.plageHoraire,
                        matin: { ...formData.plageHoraire.matin, debut: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    min="08:00"
                    max="21:00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">
                    Fin
                  </label>
                  <input
                    type="time"
                    value={formData.plageHoraire.matin.fin}
                    onChange={(e) => setFormData({
                      ...formData,
                      plageHoraire: {
                        ...formData.plageHoraire,
                        matin: { ...formData.plageHoraire.matin, fin: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    min="08:00"
                    max="21:00"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Créneau Après-midi */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-[rgb(var(--foreground))]">
                Après-midi
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">
                    Début
                  </label>
                  <input
                    type="time"
                    value={formData.plageHoraire.apresMidi.debut}
                    onChange={(e) => setFormData({
                      ...formData,
                      plageHoraire: {
                        ...formData.plageHoraire,
                        apresMidi: { ...formData.plageHoraire.apresMidi, debut: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    min="08:00"
                    max="21:00"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-[rgb(var(--muted-foreground))] mb-1">
                    Fin
                  </label>
                  <input
                    type="time"
                    value={formData.plageHoraire.apresMidi.fin}
                    onChange={(e) => setFormData({
                      ...formData,
                      plageHoraire: {
                        ...formData.plageHoraire,
                        apresMidi: { ...formData.plageHoraire.apresMidi, fin: e.target.value }
                      }
                    })}
                    className="w-full px-3 py-2 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                    min="08:00"
                    max="21:00"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg">
            <p className="text-xs text-[rgb(var(--foreground))]">
              💡 <strong>Ces horaires s'appliquent à toute la session</strong> (ex: du 01/03/2026 au 31/12/2026)
            </p>
          </div>
        </div>

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
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Pour chaque matière, vous pouvez définir vos vœux de salle et de formateur. Marjorie résoudra le puzzle selon les disponibilités.
        </p>
        <ProgrammeMatieresEditor
          matieres={formData.programme}
          onChange={(matieres) => setFormData({ ...formData, programme: matieres })}
          sallesDisponibles={sallesDisponibles}
          formateursDisponibles={formateursDisponibles}
        />
      </div>

      {/* Section 4: Récapitulatif et Notes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-[rgb(var(--foreground))] border-b border-[rgba(var(--border),0.3)] pb-2">
          4. Notes Complémentaires pour Marjorie
        </h3>

        <div className="p-4 bg-[rgba(var(--accent),0.05)] border border-[rgba(var(--accent),0.2)] rounded-lg">
          <p className="text-sm text-[rgb(var(--foreground))] mb-3">
            💡 Cette demande sera analysée par Marjorie qui optimisera le planning selon :
          </p>
          <ul className="text-sm text-[rgb(var(--muted-foreground))] space-y-1 ml-4">
            <li>• Les vœux de salle et formateur par matière</li>
            <li>• Les disponibilités réelles des formateurs</li>
            <li>• Les créneaux horaires définis (matin/après-midi)</li>
            <li>• Les périodes interdites éventuelles</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium text-[rgb(var(--foreground))] mb-2">
            Notes complémentaires (optionnel)
          </label>
          <textarea
            value={formData.notesComplementaires}
            onChange={(e) => setFormData({ ...formData, notesComplementaires: e.target.value })}
            className="w-full px-4 py-2.5 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded-lg text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none resize-none"
            rows={4}
            placeholder="Ex: Privilégier sertissage en début de formation, éviter CAO/DAO le vendredi, un formateur peut enseigner plusieurs matières..."
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
