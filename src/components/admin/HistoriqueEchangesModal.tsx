/**
 * HistoriqueEchangesModal
 * Modal affichant l'historique des échanges emails d'un prospect
 */

'use client'

import { useState, useEffect } from 'react'
import { X, Mail, ArrowDown, ArrowUp, Calendar } from 'lucide-react'

interface HistoriqueEchangesModalProps {
  prospectId: string
  prospectName: string
  nbEchanges: number
  onClose: () => void
}

interface EmailHistorique {
  id: string
  date: string
  objet: string
  sens: 'IN' | 'OUT'
}

export function HistoriqueEchangesModal({
  prospectId,
  prospectName,
  nbEchanges,
  onClose
}: HistoriqueEchangesModalProps) {
  const [emails, setEmails] = useState<EmailHistorique[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEmails() {
      try {
        setLoading(true)
        const res = await fetch(`/api/prospects/${prospectId}/emails`)
        if (!res.ok) throw new Error('Erreur chargement emails')
        const data = await res.json()
        setEmails(data)
      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEmails()
  }, [prospectId])

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[rgb(var(--card))] rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-[rgba(var(--accent),0.2)]">
        {/* Header */}
        <div className="p-6 border-b border-[rgba(var(--border),0.3)]">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-1">
                Historique des échanges
              </h2>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                {prospectName} • {nbEchanges} {nbEchanges > 1 ? 'échanges' : 'échange'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[rgba(var(--accent),0.1)] transition-colors"
            >
              <X className="w-5 h-5 text-[rgb(var(--muted-foreground))]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--accent))]"></div>
            </div>
          ) : emails.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-[rgb(var(--muted-foreground))] mx-auto mb-3 opacity-50" />
              <p className="text-[rgb(var(--muted-foreground))]">
                Aucun échange enregistré pour ce prospect
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email) => (
                <div
                  key={email.id}
                  className="p-4 bg-[rgba(var(--secondary),0.5)] border border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgba(var(--accent),0.3)] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Sens icône */}
                    <div
                      className={`p-2 rounded-lg ${
                        email.sens === 'IN'
                          ? 'bg-[rgba(var(--info),0.1)]'
                          : 'bg-[rgba(var(--success),0.1)]'
                      }`}
                    >
                      {email.sens === 'IN' ? (
                        <ArrowDown
                          className={`w-4 h-4 ${
                            email.sens === 'IN'
                              ? 'text-[rgb(var(--info))]'
                              : 'text-[rgb(var(--success))]'
                          }`}
                        />
                      ) : (
                        <ArrowUp
                          className={`w-4 h-4 ${
                            email.sens === 'OUT'
                              ? 'text-[rgb(var(--success))]'
                              : 'text-[rgb(var(--info))]'
                          }`}
                        />
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            email.sens === 'IN' ? 'badge-info' : 'badge-success'
                          }`}
                        >
                          {email.sens === 'IN' ? 'Reçu' : 'Envoyé'}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-[rgb(var(--muted-foreground))]">
                          <Calendar className="w-3 h-3" />
                          {email.date}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-[rgb(var(--foreground))] truncate">
                        {email.objet || '(Sans objet)'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[rgba(var(--border),0.3)] bg-[rgb(var(--secondary))]">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg font-medium hover:bg-[rgb(var(--accent-light))] transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )
}
