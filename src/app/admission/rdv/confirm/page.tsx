import { Suspense } from 'react'
import { ConfirmRdvClient } from './ConfirmRdvClient'

export default function ConfirmRdvPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
          <div className="text-[rgb(var(--muted-foreground))] text-sm">Chargement...</div>
        </div>
      }
    >
      <ConfirmRdvClient />
    </Suspense>
  )
}
