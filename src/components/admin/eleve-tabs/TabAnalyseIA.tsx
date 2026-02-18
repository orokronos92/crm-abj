'use client'

import { useState } from 'react'
import { Sparkles, Calendar, AlertCircle, Loader2, RefreshCw } from 'lucide-react'

interface TabAnalyseIAProps {
  eleve: any
  onDemanderAnalyse: () => void
}

export function TabAnalyseIA({ eleve, onDemanderAnalyse }: TabAnalyseIAProps) {
  const hasAnalyse = eleve.analyse_ia && eleve.analyse_ia.trim().length > 0
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await onDemanderAnalyse()
    // Le composant parent rechargera les données
    setTimeout(() => setRefreshing(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Header avec date d'analyse */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(var(--accent),0.1)] rounded-lg">
            <Sparkles className="w-6 h-6 text-[rgb(var(--accent))]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgb(var(--foreground))]">
              Analyse Marjorie
            </h3>
            {hasAnalyse && eleve.date_analyse_ia && (
              <div className="flex items-center gap-2 text-xs text-[rgb(var(--muted-foreground))] mt-1">
                <Calendar className="w-3 h-3" />
                Dernière analyse : {new Date(eleve.date_analyse_ia).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>
        </div>

        {hasAnalyse && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-4 py-2 bg-[rgb(var(--secondary))] text-[rgb(var(--foreground))] border border-[rgba(var(--border),0.5)] rounded-lg font-medium hover:bg-[rgba(var(--accent),0.05)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {refreshing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Actualisation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Actualiser l'analyse
              </>
            )}
          </button>
        )}
      </div>

      {/* Contenu de l'analyse */}
      {hasAnalyse ? (
        <div className="p-6 bg-[rgba(var(--accent),0.02)] border border-[rgba(var(--accent),0.1)] rounded-xl">
          <div className="prose prose-sm max-w-none">
            <div
              className="text-[rgb(var(--foreground))] whitespace-pre-wrap leading-relaxed"
              dangerouslySetInnerHTML={{ __html: eleve.analyse_ia.replace(/\n/g, '<br />') }}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="p-4 bg-[rgba(var(--accent),0.05)] rounded-full mb-4">
            <Sparkles className="w-12 h-12 text-[rgb(var(--accent))]" />
          </div>
          <h4 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">
            Aucune analyse disponible
          </h4>
          <p className="text-sm text-[rgb(var(--muted-foreground))] text-center max-w-md mb-6">
            Marjorie n'a pas encore analysé ce dossier élève. Cliquez sur le bouton ci-dessous pour demander une analyse complète des notes, progression et comportement.
          </p>
          <div className="p-4 bg-[rgba(var(--warning),0.05)] border border-[rgba(var(--warning),0.2)] rounded-lg mb-6 max-w-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-[rgb(var(--warning))] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-[rgb(var(--foreground))]">
                  <span className="font-medium">Informations analysées :</span> Notes, progression, assiduité, points forts, axes d'amélioration, recommandations pédagogiques.
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-[rgb(var(--muted-foreground))] text-center max-w-lg">
            💡 L'analyse sera générée en arrière-plan par Marjorie et vous serez notifié lorsqu'elle sera disponible. Vous pourrez ensuite actualiser cette page pour la consulter.
          </p>
        </div>
      )}
    </div>
  )
}
