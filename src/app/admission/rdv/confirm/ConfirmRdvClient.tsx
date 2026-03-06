'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, XCircle, Clock, MapPin, Calendar, Loader2 } from 'lucide-react'
import { DiamondLogo } from '@/components/ui/diamond-logo'

interface RdvInfo {
  salle?: string
  dateDebut?: string
  dateFin?: string
  numeroDossier?: string
  prenom?: string
  nom?: string
}

type Status = 'loading' | 'success' | 'already' | 'expired' | 'invalid' | 'error'

export function ConfirmRdvClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [status, setStatus] = useState<Status>('loading')
  const [rdv, setRdv] = useState<RdvInfo | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('invalid')
      return
    }

    fetch(`/api/admission/rdv/confirm?token=${encodeURIComponent(token)}`)
      .then(async r => {
        const data = await r.json()
        if (!r.ok) {
          setErrorMsg(data.error ?? 'Erreur inconnue')
          if (r.status === 410) {
            setStatus(data.error?.includes('expiré') ? 'expired' : 'invalid')
          } else if (r.status === 404) {
            setStatus('invalid')
          } else {
            setStatus('error')
          }
          return
        }
        setRdv(data.rdv)
        setStatus(data.alreadyConfirmed ? 'already' : 'success')
      })
      .catch(() => setStatus('error'))
  }, [token])

  const formatDate = (iso?: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  const formatTime = (iso?: string) => {
    if (!iso) return ''
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--background))] flex flex-col items-center justify-center p-4">
      {/* Logo + titre */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <DiamondLogo size={48} />
        <div className="text-center">
          <h1 className="text-xl font-bold text-[rgb(var(--foreground))]">
            Académie de Bijouterie Joaillerie
          </h1>
          <p className="text-sm text-[rgb(var(--muted-foreground))]">
            Confirmation de rendez-vous
          </p>
        </div>
      </div>

      <div className="bg-[rgb(var(--card))] rounded-xl border border-[rgba(var(--border),0.3)] shadow-lg w-full max-w-md p-6">

        {/* Chargement */}
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader2 className="w-10 h-10 animate-spin text-[rgb(var(--accent))]" />
            <p className="text-sm text-[rgb(var(--muted-foreground))]">Confirmation en cours...</p>
          </div>
        )}

        {/* Succès */}
        {(status === 'success' || status === 'already') && rdv && (
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="p-3 bg-[rgba(var(--success),0.1)] rounded-full">
              <CheckCircle className="w-12 h-12 text-[rgb(var(--success))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
                {status === 'already' ? 'RDV déjà confirmé' : 'RDV confirmé !'}
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))] mt-1">
                Bonjour {rdv.prenom} {rdv.nom}
              </p>
            </div>

            <div className="w-full space-y-3 text-left">
              <div className="flex items-start gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                <Calendar className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Date</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {formatDate(rdv.dateDebut)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                <Clock className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-[rgb(var(--muted-foreground))]">Horaire</p>
                  <p className="text-sm font-medium text-[rgb(var(--foreground))]">
                    {formatTime(rdv.dateDebut)} – {formatTime(rdv.dateFin)}
                  </p>
                </div>
              </div>

              {rdv.salle && (
                <div className="flex items-start gap-3 p-3 bg-[rgb(var(--secondary))] rounded-lg">
                  <MapPin className="w-4 h-4 text-[rgb(var(--accent))] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-[rgb(var(--muted-foreground))]">Salle</p>
                    <p className="text-sm font-medium text-[rgb(var(--foreground))]">{rdv.salle}</p>
                  </div>
                </div>
              )}
            </div>

            <p className="text-xs text-[rgb(var(--muted-foreground))] text-center">
              Vous recevrez un email de confirmation. En cas de problème, contactez-nous à{' '}
              <a href="mailto:contact@abj.fr" className="text-[rgb(var(--accent))] underline">
                contact@abj.fr
              </a>
            </p>
          </div>
        )}

        {/* Expiré */}
        {status === 'expired' && (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="p-3 bg-[rgba(var(--warning),0.1)] rounded-full">
              <Clock className="w-12 h-12 text-[rgb(var(--warning))]" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Lien expiré</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              {errorMsg || 'Ce lien de confirmation a expiré (72h). Contactez l\'ABJ pour obtenir de nouveaux créneaux.'}
            </p>
            <a
              href="mailto:contact@abj.fr"
              className="px-5 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium text-sm"
            >
              Contacter l'ABJ
            </a>
          </div>
        )}

        {/* Invalide / déjà annulé */}
        {status === 'invalid' && (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-full">
              <XCircle className="w-12 h-12 text-[rgb(var(--error))]" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Lien invalide</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              {errorMsg || 'Ce lien est invalide ou a déjà été utilisé.'}
            </p>
          </div>
        )}

        {/* Erreur générique */}
        {status === 'error' && (
          <div className="flex flex-col items-center gap-4 text-center py-4">
            <div className="p-3 bg-[rgba(var(--error),0.1)] rounded-full">
              <XCircle className="w-12 h-12 text-[rgb(var(--error))]" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">Erreur</h2>
            <p className="text-sm text-[rgb(var(--muted-foreground))]">
              Une erreur est survenue. Veuillez réessayer ou contacter l'ABJ.
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-[rgb(var(--muted-foreground))]">
        © {new Date().getFullYear()} Académie de Bijouterie Joaillerie
      </p>
    </div>
  )
}
