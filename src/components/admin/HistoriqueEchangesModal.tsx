/**
 * HistoriqueEchangesModal
 * Affiche le détail complet des échanges emails d'un candidat avec Marjorie
 * Chaque échange montre la question/message entrant ET la réponse sortante
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Loader2, ArrowDownLeft, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react'

interface Email {
  id: string
  date: string
  objet: string
  sens: 'IN' | 'OUT'
  contenu: string | null
  extrait: string | null
}

interface HistoriqueEchangesModalProps {
  idProspect: string
  nomCandidat: string
  onClose: () => void
}

function EmailCard({ email }: { email: Email }) {
  const [expanded, setExpanded] = useState(true)

  const isEntrant = email.sens === 'IN'
  const texte = email.contenu || email.extrait

  return (
    <div className={`rounded-lg border ${
      isEntrant
        ? 'border-[rgba(var(--accent),0.3)] bg-[rgba(var(--accent),0.05)]'
        : 'border-[rgba(var(--border),0.4)] bg-[rgb(var(--secondary))]'
    }`}>
      {/* Header cliquable */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-start gap-3 p-4 text-left hover:opacity-80 transition-opacity"
      >
        <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
          isEntrant
            ? 'bg-[rgba(var(--accent),0.15)]'
            : 'bg-[rgba(var(--muted-foreground),0.15)]'
        }`}>
          {isEntrant
            ? <ArrowDownLeft className="w-3.5 h-3.5 text-[rgb(var(--accent))]" />
            : <ArrowUpRight className="w-3.5 h-3.5 text-[rgb(var(--muted-foreground))]" />
          }
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isEntrant
                ? 'bg-[rgba(var(--accent),0.15)] text-[rgb(var(--accent))]'
                : 'bg-[rgba(var(--muted-foreground),0.15)] text-[rgb(var(--muted-foreground))]'
            }`}>
              {isEntrant ? 'Reçu' : 'Envoyé'}
            </span>
            <span className="text-xs text-[rgb(var(--muted-foreground))]">{email.date}</span>
          </div>
          <p className="text-sm font-medium text-[rgb(var(--foreground))] mt-1 truncate">
            {email.objet || '(Sans objet)'}
          </p>
        </div>

        <div className="flex-shrink-0 mt-0.5">
          {expanded
            ? <ChevronUp className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
            : <ChevronDown className="w-4 h-4 text-[rgb(var(--muted-foreground))]" />
          }
        </div>
      </button>

      {/* Contenu */}
      {expanded && texte && (
        <div className="px-4 pb-4">
          <div className="border-t border-[rgba(var(--border),0.3)] pt-3">
            <p className="text-sm text-[rgb(var(--foreground))] whitespace-pre-wrap leading-relaxed">
              {texte}
            </p>
          </div>
        </div>
      )}

      {expanded && !texte && (
        <div className="px-4 pb-4">
          <div className="border-t border-[rgba(var(--border),0.3)] pt-3">
            <p className="text-sm text-[rgb(var(--muted-foreground))] italic">
              Contenu non disponible
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export function HistoriqueEchangesModal({ idProspect, nomCandidat, onClose }: HistoriqueEchangesModalProps) {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEmails() {
      try {
        const res = await fetch(`/api/prospects/${idProspect}/emails`)
        if (!res.ok) throw new Error('Impossible de charger les échanges')
        const data = await res.json()
        setEmails(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur')
      } finally {
        setLoading(false)
      }
    }
    fetchEmails()
  }, [idProspect])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-lg w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
              <Mail className="w-5 h-5 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[rgb(var(--foreground))]">
                Échanges avec Marjorie
              </h2>
              <p className="text-xs text-[rgb(var(--muted-foreground))]">{nomCandidat}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[rgb(var(--secondary))] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-[rgb(var(--accent))]" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-[rgba(var(--error),0.1)] border border-[rgba(var(--error),0.3)] rounded-lg text-sm text-[rgb(var(--error))]">
              {error}
            </div>
          )}

          {!loading && !error && emails.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Mail className="w-10 h-10 text-[rgb(var(--muted-foreground))] opacity-40 mb-3" />
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                Aucun échange email enregistré
              </p>
            </div>
          )}

          {!loading && !error && emails.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-[rgb(var(--muted-foreground))] mb-4">
                {emails.length} échange{emails.length > 1 ? 's' : ''} — du plus récent au plus ancien
              </p>
              {emails.map(email => (
                <EmailCard key={email.id} email={email} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
