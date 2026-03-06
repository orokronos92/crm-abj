'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, MapPin, Calendar, Loader2, RefreshCw } from 'lucide-react'
import { DiamondLogo } from '@/components/ui/diamond-logo'

interface Creneau {
  token: string
  dateDebut: string
  dateFin: string
  nomSalle: string
  pris?: boolean
}

type PageStatus = 'loading' | 'ready' | 'confirmed' | 'error' | 'complet'

// Groupe les créneaux par date (YYYY-MM-DD)
function grouperParJour(creneaux: Creneau[]): Record<string, Creneau[]> {
  return creneaux.reduce<Record<string, Creneau[]>>((acc, c) => {
    const date = new Date(c.dateDebut).toISOString().split('T')[0]
    if (!acc[date]) acc[date] = []
    acc[date].push(c)
    return acc
  }, {})
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function formatHeure(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function ChoisirRdvClient() {
  const searchParams = useSearchParams()
  const lot = searchParams.get('lot')
  const candidat = searchParams.get('candidat')

  const [status, setStatus] = useState<PageStatus>('loading')
  const [creneaux, setCreneaux] = useState<Creneau[]>([])
  const [confirme, setConfirme] = useState<Creneau | null>(null)
  const [choixEnCours, setChoixEnCours] = useState<string | null>(null) // token en cours de sélection
  const [message, setMessage] = useState('')

  const chargerCreneaux = useCallback(async () => {
    if (!lot) { setStatus('error'); setMessage('Lien invalide : paramètre lot manquant.'); return }

    try {
      const res = await fetch(`/api/admission/rdv/lot?lot=${encodeURIComponent(lot)}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setStatus('error')
        setMessage(data.error ?? 'Impossible de charger les créneaux.')
        return
      }

      if (data.creneaux.length === 0) {
        setStatus('complet')
        return
      }

      setCreneaux(data.creneaux)
      setStatus('ready')
    } catch {
      setStatus('error')
      setMessage('Erreur réseau. Veuillez réessayer.')
    }
  }, [lot])

  useEffect(() => { chargerCreneaux() }, [chargerCreneaux])

  const choisirCreneau = async (token: string) => {
    if (choixEnCours) return
    setChoixEnCours(token)

    try {
      const res = await fetch('/api/admission/rdv/choisir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, idCandidat: candidat ? parseInt(candidat, 10) : null }),
      })
      const data = await res.json()

      if (res.status === 409) {
        // Créneau pris en concurrence — griser + re-fetch
        setCreneaux(prev => prev.map(c => c.token === token ? { ...c, pris: true } : c))
        setMessage('Ce créneau vient d\'être pris. Veuillez en choisir un autre.')
        setChoixEnCours(null)
        // Re-fetch pour obtenir la liste à jour
        setTimeout(() => chargerCreneaux(), 1500)
        return
      }

      if (!res.ok) {
        setMessage(data.error ?? 'Erreur lors de la confirmation.')
        setChoixEnCours(null)
        return
      }

      // Succès
      const rdv = data.rdv
      setConfirme({
        token,
        dateDebut: rdv?.dateDebut ?? '',
        dateFin:   rdv?.dateFin ?? '',
        nomSalle:  rdv?.salle ?? '',
      })
      setStatus('confirmed')
    } catch {
      setMessage('Erreur réseau. Veuillez réessayer.')
      setChoixEnCours(null)
    }
  }

  const creneauxParJour = grouperParJour(creneaux)
  const jours = Object.keys(creneauxParJour).sort()
  const creneauxDisponibles = creneaux.filter(c => !c.pris)

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex flex-col items-center p-4 py-10">
      {/* Logo + titre */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <DiamondLogo size={48} />
        <div className="text-center">
          <h1 className="text-xl font-bold text-[rgb(var(--foreground))]">
            Académie de Bijouterie Joaillerie
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Choisissez votre créneau d'entretien
          </p>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-4">

        {/* Chargement */}
        {status === 'loading' && (
          <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] shadow-lg p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-[rgb(var(--accent))]" />
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Chargement des créneaux...</p>
          </div>
        )}

        {/* Tous les créneaux pris */}
        {status === 'complet' && (
          <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] shadow-lg p-8 flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--warning),0.1)] rounded-full">
              <Clock className="w-12 h-12 text-[rgb(var(--warning))]" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Créneaux épuisés</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Tous les créneaux ont été pris ou le lien a expiré. Contactez l'ABJ pour convenir d'un autre rendez-vous.
            </p>
            <a
              href="mailto:contact@abj.fr"
              className="px-5 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium text-sm"
            >
              Contacter l'ABJ
            </a>
          </div>
        )}

        {/* Erreur */}
        {status === 'error' && (
          <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] shadow-lg p-8 flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-full">
              <XCircle className="w-12 h-12 text-[rgb(var(--error))]" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Lien invalide</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">{message || 'Ce lien est invalide ou a expiré.'}</p>
          </div>
        )}

        {/* Confirmé */}
        {status === 'confirmed' && confirme && (
          <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] shadow-lg p-8 flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Créneau confirmé !</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Votre rendez-vous est enregistré.</p>
            </div>

            <div className="w-full space-y-3 text-left">
              <div className="flex items-start gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                <Calendar className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Date</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {confirme.dateDebut ? formatDate(confirme.dateDebut) : '–'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                <Clock className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Horaire</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {confirme.dateDebut ? `${formatHeure(confirme.dateDebut)} – ${formatHeure(confirme.dateFin)}` : '–'}
                  </p>
                </div>
              </div>

              {confirme.nomSalle && (
                <div className="flex items-start gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <MapPin className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Salle</p>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">{confirme.nomSalle}</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-[rgb(var(--muted-foreground))]">
              Un email de confirmation vous sera envoyé. En cas de problème, contactez{' '}
              <a href="mailto:contact@abj.fr" className="text-[rgb(var(--accent))] underline">contact@abj.fr</a>
            </p>
          </div>
        )}

        {/* Mini-calendrier */}
        {status === 'ready' && (
          <>
            {/* Message race condition */}
            {message && (
              <div className="flex items-center gap-2 p-3 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg text-sm text-[rgb(var(--warning))]">
                <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
                {message}
              </div>
            )}

            {creneauxDisponibles.length === 0 ? (
              <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] p-6 text-center">
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  Tous les créneaux viennent d'être pris. Contactez l'ABJ.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] shadow-lg p-5">
                  <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                    Sélectionnez le créneau qui vous convient le mieux :
                  </p>

                  <div className="space-y-5">
                    {jours.map(jour => {
                      const creneauxDuJour = creneauxParJour[jour]
                      const auMoinsUnDispo = creneauxDuJour.some(c => !c.pris)
                      if (!auMoinsUnDispo) return null

                      return (
                        <div key={jour}>
                          <p className="text-xs font-semibold text-[rgb(var(--muted-foreground))] uppercase tracking-wide mb-2">
                            {formatDate(creneauxDuJour[0].dateDebut)}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {creneauxDuJour.map(c => {
                              const isPris = c.pris
                              const isEnCours = choixEnCours === c.token

                              return (
                                <button
                                  key={c.token}
                                  onClick={() => !isPris && !choixEnCours && choisirCreneau(c.token)}
                                  disabled={isPris || !!choixEnCours}
                                  className={[
                                    'p-3 rounded-lg border text-left transition-all',
                                    isPris
                                      ? 'opacity-40 cursor-not-allowed bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.3)]'
                                      : isEnCours
                                        ? 'bg-[rgba(var(--accent),0.15)] border-[rgb(var(--accent))] cursor-wait'
                                        : 'bg-[rgb(var(--secondary))] border-[rgba(var(--border),0.4)] hover:border-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.08)] cursor-pointer',
                                  ].join(' ')}
                                >
                                  {isEnCours ? (
                                    <div className="flex items-center gap-2">
                                      <Loader2 className="w-4 h-4 animate-spin text-[rgb(var(--accent))]" />
                                      <span className="text-xs text-[rgb(var(--accent))]">Confirmation...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <p className="text-sm font-bold text-[rgb(var(--foreground))]">
                                        {formatHeure(c.dateDebut)} – {formatHeure(c.dateFin)}
                                      </p>
                                      <p className="text-xs text-[rgb(var(--muted-foreground))] mt-0.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3 inline" />
                                        {c.nomSalle}
                                      </p>
                                      {isPris && (
                                        <p className="text-xs text-[rgb(var(--error))] mt-1">Créneau pris</p>
                                      )}
                                    </>
                                  )}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <p className="text-xs text-[rgb(var(--muted-foreground))] text-center">
                  Les créneaux disponibles sont mis à jour en temps réel.
                </p>
              </>
            )}
          </>
        )}
      </div>

      <p className="mt-8 text-xs text-[rgb(var(--muted-foreground))]">
        © {new Date().getFullYear()} Académie de Bijouterie Joaillerie
      </p>
    </div>
  )
}
