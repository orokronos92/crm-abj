'use client'

import { Clock, GraduationCap } from 'lucide-react'
import type { SessionType } from './session-form.types'

interface SessionTypeSelectorProps {
  onSelect: (type: SessionType) => void
}

export function SessionTypeSelector({ onSelect }: SessionTypeSelectorProps) {
  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
          Créer une nouvelle session
        </h2>
        <p className="text-sm text-[rgb(var(--muted-foreground))]">
          Choisissez le type de formation à planifier
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
        {/* Formation Courte */}
        <button
          onClick={() => onSelect('COURTE')}
          className="group p-8 bg-[rgb(var(--card))] border-2 border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)] transition-all"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-[rgba(var(--accent),0.1)] rounded-full group-hover:bg-[rgba(var(--accent),0.2)] transition-colors">
              <Clock className="w-12 h-12 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-2">
                Formation Courte
              </h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                5 à 15 jours
              </p>
            </div>
            <ul className="text-xs text-left text-[rgb(var(--muted-foreground))] space-y-1 mt-2">
              <li>• Planification simple</li>
              <li>• Dates fixes</li>
              <li>• Un formateur principal</li>
              <li>• Validation rapide</li>
            </ul>
          </div>
        </button>

        {/* Formation CAP */}
        <button
          onClick={() => onSelect('CAP')}
          className="group p-8 bg-[rgb(var(--card))] border-2 border-[rgba(var(--border),0.5)] rounded-lg hover:border-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.05)] transition-all"
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className="p-4 bg-[rgba(var(--accent),0.1)] rounded-full group-hover:bg-[rgba(var(--accent),0.2)] transition-colors">
              <GraduationCap className="w-12 h-12 text-[rgb(var(--accent))]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[rgb(var(--foreground))] mb-2">
                Formation CAP
              </h3>
              <p className="text-sm text-[rgb(var(--muted-foreground))]">
                800h+ (plusieurs mois)
              </p>
            </div>
            <ul className="text-xs text-left text-[rgb(var(--muted-foreground))] space-y-1 mt-2">
              <li>• Programme de matières</li>
              <li>• Planification complexe</li>
              <li>• Plusieurs formateurs</li>
              <li>• Optimisation IA</li>
            </ul>
          </div>
        </button>
      </div>
    </div>
  )
}
