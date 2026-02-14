/**
 * Header de la page Formateurs avec bouton de création
 */

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { FormateurFormModal } from './FormateurFormModal'
import { useRouter } from 'next/navigation'

export function FormateursPageHeader() {
  const [modalOuvert, setModalOuvert] = useState(false)
  const router = useRouter()

  const handleSuccess = () => {
    // Rafraîchir la page pour afficher le nouveau formateur
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--foreground))]">Formateurs</h1>
          <p className="text-[rgb(var(--muted-foreground))] mt-1">
            Gestion de l'équipe pédagogique et suivi Qualiopi
          </p>
        </div>
        <button
          onClick={() => setModalOuvert(true)}
          className="px-4 py-2 bg-[rgb(var(--accent))] text-[rgb(var(--primary))] rounded-lg hover:bg-[rgb(var(--accent-light))] transition-all flex items-center gap-2 font-medium"
        >
          <Plus className="w-5 h-5" />
          Créer un formateur
        </button>
      </div>

      {modalOuvert && (
        <FormateurFormModal
          onClose={() => setModalOuvert(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
