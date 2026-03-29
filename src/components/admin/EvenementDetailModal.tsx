'use client'

import { useEffect, useState } from 'react'
import { X, Users, Calendar, MapPin, Clock, Edit2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface CandidatInscrit {
  idCandidat: number
  numeroDossier: string | null
  nom: string
  prenom: string
  email: string | null
  telephone: string | null
}

interface EvenementDetail {
  idEvenement: number
  type: string
  titre: string
  date: string
  heureDebut: string | null
  heureFin: string | null
  salle: string | null
  nombreParticipants: number
  participantsInscrits: number
  statut: string
}

interface EvenementDetailModalProps {
  idEvenement: number
  onClose: () => void
  onDateChanged?: () => void
}

export function EvenementDetailModal({ idEvenement, onClose, onDateChanged }: EvenementDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [evenement, setEvenement] = useState<EvenementDetail | null>(null)
  const [candidats, setCandidats] = useState<CandidatInscrit[]>([])
  const [modeModifDate, setModeModifDate] = useState(false)
  const [nouvelleDate, setNouvelleDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [erreur, setErreur] = useState('')
  const [succes, setSucces] = useState('')

  useEffect(() => {
    const charger = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/evenements/${idEvenement}`)
        const data = await res.json()
        if (data.success) {
          setEvenement(data.evenement)
          setCandidats(data.candidats ?? [])
          setNouvelleDate(data.evenement.date)
        } else {
          setErreur(data.error ?? 'Erreur de chargement')
        }
      } catch {
        setErreur('Erreur réseau')
      } finally {
        setLoading(false)
      }
    }
    charger()
  }, [idEvenement])

  const modifierDate = async () => {
    if (!nouvelleDate || !evenement) return
    setSaving(true)
    setErreur('')
    setSucces('')
    try {
      const res = await fetch(`/api/evenements/${idEvenement}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: nouvelleDate }),
      })
      const data = await res.json()
      if (data.success) {
        setEvenement(prev => prev ? {
          ...prev,
          date: nouvelleDate,
          titre: data.evenement?.titre ?? prev.titre,
        } : prev)
        setSucces(`Date mise à jour. ${data.holdsModifies ?? 0} créneau(x) mis à jour.`)
        setModeModifDate(false)
        onDateChanged?.()
      } else {
        setErreur(data.error ?? 'Erreur lors de la modification')
      }
    } catch {
      setErreur('Erreur réseau')
    } finally {
      setSaving(false)
    }
  }

  const typeLabel = evenement?.type === 'ENTRETIEN_PRESENTIEL' ? 'Entretien présentiel' : 'Test technique'
  const placesRestantes = evenement ? Math.max(0, evenement.nombreParticipants - evenement.participantsInscrits) : 0
  const estPlein = evenement ? evenement.participantsInscrits >= evenement.nombreParticipants : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className="bg-[rgb(var(--card))] rounded-xl w-full max-w-full sm:max-w-2xl max-h-[90vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <Users className="w-5 h-5 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
                {loading ? 'Chargement…' : evenement?.titre ?? typeLabel}
              </h2>
              {evenement && (
                <span className="text-xs text-[rgb(var(--muted-foreground))]">{typeLabel}</span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors">
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {loading && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--accent))]" />
            </div>
          )}

          {!loading && evenement && (
            <>
              {/* Infos événement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date avec bouton modifier */}
                <div className="flex items-start gap-2 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <Calendar className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Date</p>
                    {modeModifDate ? (
                      <div className="flex items-center gap-2 mt-1">
                        <input
                          type="date"
                          value={nouvelleDate}
                          onChange={e => setNouvelleDate(e.target.value)}
                          className="text-sm px-2 py-1 bg-[rgb(var(--card))] border border-[rgba(var(--border),0.5)] rounded text-[rgb(var(--foreground))] focus:border-[rgb(var(--accent))] focus:outline-none"
                        />
                        <button
                          onClick={modifierDate}
                          disabled={saving}
                          className="px-2 py-1 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded text-xs font-medium disabled:opacity-50"
                        >
                          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : 'OK'}
                        </button>
                        <button
                          onClick={() => { setModeModifDate(false); setNouvelleDate(evenement.date) }}
                          className="px-2 py-1 bg-[rgb(var(--secondary))] border border-[rgba(var(--border),0.3)] rounded text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                          {new Date(evenement.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <button
                          onClick={() => setModeModifDate(true)}
                          className="p-1 hover:bg-[rgb(var(--card))] rounded transition-colors"
                          title="Modifier la date (cascade sur tous les créneaux inscrits)"
                        >
                          <Edit2 className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <Clock className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Horaires</p>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))] mt-0.5">
                      {evenement.heureDebut ?? '09:00'} – {evenement.heureFin ?? '17:00'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <MapPin className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Salle</p>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))] mt-0.5">{evenement.salle ?? '–'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <Users className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Places</p>
                    <p className="text-sm font-medium mt-0.5">
                      <span className={estPlein ? 'text-[rgb(var(--error))]' : 'text-[rgb(var(--success))]'}>
                        {evenement.participantsInscrits}
                      </span>
                      <span className="text-[rgb(var(--muted-foreground))]"> / {evenement.nombreParticipants}</span>
                      {!estPlein && (
                        <span className="text-xs text-[rgb(var(--muted-foreground))] ml-1">
                          ({placesRestantes} libre{placesRestantes > 1 ? 's' : ''})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              {erreur && (
                <div className="flex items-center gap-2 p-3 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg text-sm text-[rgb(var(--error))]">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {erreur}
                </div>
              )}
              {succes && (
                <div className="flex items-center gap-2 p-3 bg-[rgba(var(--success),0.1)] border border-[rgba(var(--success),0.3)] rounded-lg text-sm text-[rgb(var(--success))]">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  {succes}
                </div>
              )}

              {/* Liste des candidats inscrits */}
              <div>
                <h3 className="text-sm font-semibold text-[rgb(var(--foreground))] mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[rgb(var(--accent))]" />
                  Candidats inscrits ({candidats.length})
                </h3>

                {candidats.length === 0 ? (
                  <div className="text-center py-6 text-sm text-[rgb(var(--muted-foreground))] bg-[rgb(var(--secondary))] rounded-lg">
                    Aucun candidat inscrit pour l'instant
                  </div>
                ) : (
                  <div className="space-y-2">
                    {candidats.map(c => (
                      <div
                        key={c.idCandidat}
                        className="flex items-center gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg"
                      >
                        <div className="w-8 h-8 rounded-full bg-[rgba(var(--accent),0.15)] flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[rgb(var(--accent))]">
                            {c.prenom.charAt(0)}{c.nom.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                            {c.prenom} {c.nom}
                          </p>
                          {c.numeroDossier && (
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">{c.numeroDossier}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          {c.email && (
                            <p className="text-xs text-[rgb(var(--muted-foreground))] truncate max-w-[160px]">{c.email}</p>
                          )}
                          {c.telephone && (
                            <p className="text-xs text-[rgb(var(--muted-foreground))]">{c.telephone}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))] rounded-b-xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[rgb(var(--card))] hover:bg-[rgba(var(--accent),0.08)] border border-[rgba(var(--border),0.3)] rounded-lg text-sm font-medium transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
