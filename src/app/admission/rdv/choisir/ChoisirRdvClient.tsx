'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, MapPin, Calendar, Loader2, RefreshCw } from 'lucide-react'
import { DiamondLogo } from '@/components/ui/diamond-logo'

interface Paire {
  tokenJ1: string
  dateJ1: string
  dateJ2: string
  nomSalle: string
  pris?: boolean
}

type PageStatus = 'loading' | 'ready' | 'confirmed' | 'error' | 'complet'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

function formatDateCourt(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long'
  })
}

export function ChoisirRdvClient() {
  const searchParams = useSearchParams()
  const lot = searchParams.get('lot')
  const candidat = searchParams.get('candidat')

  const [status, setStatus] = useState<PageStatus>('loading')
  const [paires, setPaires] = useState<Paire[]>([])
  const [confirme, setConfirme] = useState<{ dateJ1: string; dateJ2?: string; nomSalle: string } | null>(null)
  const [choixEnCours, setChoixEnCours] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const chargerPaires = useCallback(async () => {
    if (!lot) { setStatus('error'); setMessage('Lien invalide : paramètre lot manquant.'); return }

    try {
      const res = await fetch(`/api/admission/rdv/lot?lot=${encodeURIComponent(lot)}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setStatus('error')
        setMessage(data.error ?? 'Impossible de charger les créneaux.')
        return
      }

      if (!data.paires || data.paires.length === 0) {
        setStatus('complet')
        return
      }

      setPaires(data.paires)
      setStatus('ready')
    } catch {
      setStatus('error')
      setMessage('Erreur réseau. Veuillez réessayer.')
    }
  }, [lot])

  useEffect(() => { chargerPaires() }, [chargerPaires])

  const choisirPaire = async (tokenJ1: string) => {
    if (choixEnCours) return
    setChoixEnCours(tokenJ1)

    try {
      const res = await fetch('/api/admission/rdv/choisir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenJ1, idCandidat: candidat ? parseInt(candidat, 10) : null }),
      })
      const data = await res.json()

      if (res.status === 409) {
        setPaires(prev => prev.map(p => p.tokenJ1 === tokenJ1 ? { ...p, pris: true } : p))
        setMessage('Ce créneau vient d\'être pris. Veuillez en choisir un autre.')
        setChoixEnCours(null)
        setTimeout(() => chargerPaires(), 1500)
        return
      }

      if (!res.ok) {
        setMessage(data.error ?? 'Erreur lors de la confirmation.')
        setChoixEnCours(null)
        return
      }

      const rdv = data.rdv
      setConfirme({
        dateJ1:   rdv?.dateJ1 ?? '',
        dateJ2:   rdv?.dateJ2 ?? undefined,
        nomSalle: rdv?.salle ?? '',
      })
      setStatus('confirmed')
    } catch {
      setMessage('Erreur réseau. Veuillez réessayer.')
      setChoixEnCours(null)
    }
  }

  const pairesDisponibles = paires.filter(p => !p.pris)

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
            Choisissez votre période d'entretien &amp; test technique
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

        {/* Tous pris */}
        {status === 'complet' && (
          <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] shadow-lg p-8 flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--warning),0.1)] rounded-full">
              <Clock className="w-12 h-12 text-[rgb(var(--warning))]" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Créneaux épuisés</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Toutes les périodes ont été prises ou le lien a expiré. Contactez l'ABJ pour convenir d'un autre rendez-vous.
            </p>
            <a href="mailto:contact@abj.fr" className="px-5 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium text-sm">
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
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Inscription confirmée !</h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">Vos 2 jours sont réservés.</p>
            </div>

            <div className="w-full space-y-3 text-left">
              <div className="flex items-start gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                <Calendar className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Jour 1 — Entretien présentiel</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {confirme.dateJ1 ? formatDate(confirme.dateJ1) : '–'} · 09h00 – 17h00
                  </p>
                </div>
              </div>

              {confirme.dateJ2 && (
                <div className="flex items-start gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <Calendar className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Jour 2 — Test technique</p>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                      {formatDate(confirme.dateJ2)} · 09h00 – 17h00
                    </p>
                  </div>
                </div>
              )}

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

        {/* Sélection des paires */}
        {status === 'ready' && (
          <>
            {message && (
              <div className="flex items-center gap-2 p-3 bg-[rgba(var(--warning),0.1)] border border-[rgba(var(--warning),0.3)] rounded-lg text-sm text-[rgb(var(--warning))]">
                <RefreshCw className="w-4 h-4 flex-shrink-0 animate-spin" />
                {message}
              </div>
            )}

            {pairesDisponibles.length === 0 ? (
              <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] p-6 text-center">
                <p className="text-sm text-[rgb(var(--muted-foreground))]">
                  Toutes les périodes viennent d'être prises. Contactez l'ABJ.
                </p>
              </div>
            ) : (
              <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] shadow-lg p-5">
                <p className="text-sm text-[rgb(var(--muted-foreground))] mb-4">
                  Sélectionnez la période qui vous convient. Vous serez présent les <strong>2 jours</strong> (entretien + test technique).
                </p>

                <div className="space-y-3">
                  {paires.map(paire => {
                    const isPris = paire.pris
                    const isEnCours = choixEnCours === paire.tokenJ1

                    return (
                      <button
                        key={paire.tokenJ1}
                        onClick={() => !isPris && !choixEnCours && choisirPaire(paire.tokenJ1)}
                        disabled={isPris || !!choixEnCours}
                        className={[
                          'w-full p-4 rounded-lg border text-left transition-all',
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
                            <span className="text-sm text-[rgb(var(--accent))]">Confirmation en cours...</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[rgb(var(--accent))] flex-shrink-0" />
                              <div>
                                <p className="text-xs text-[rgb(var(--muted-foreground))]">Jour 1 — Entretien présentiel</p>
                                <p className="text-sm font-bold text-[rgb(var(--foreground))]">
                                  {formatDate(paire.dateJ1)} · 09h00 – 17h00
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-[rgb(var(--accent))] flex-shrink-0" />
                              <div>
                                <p className="text-xs text-[rgb(var(--muted-foreground))]">Jour 2 — Test technique</p>
                                <p className="text-sm font-bold text-[rgb(var(--foreground))]">
                                  {formatDate(paire.dateJ2)} · 09h00 – 17h00
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3 h-3 text-[rgb(var(--muted-foreground))]" />
                              <p className="text-xs text-[rgb(var(--muted-foreground))]">{paire.nomSalle}</p>
                            </div>
                            {isPris && (
                              <p className="text-xs text-[rgb(var(--error))] font-medium">Période complète</p>
                            )}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <p className="text-xs text-[rgb(var(--muted-foreground))] text-center">
              Les périodes disponibles sont mises à jour en temps réel.
            </p>
          </>
        )}
      </div>

      <p className="mt-8 text-xs text-[rgb(var(--muted-foreground))]">
        © {new Date().getFullYear()} Académie de Bijouterie Joaillerie
      </p>
    </div>
  )
}
