import { Suspense } from 'react'
import { ChoisirRdvClient } from './ChoisirRdvClient'

export default function ChoisirRdvPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--background))]">
          <div className="text-[rgb(var(--muted-foreground))] text-sm">Chargement...</div>
        </div>
      }
    >
      <ChoisirRdvClient />
    </Suspense>
  )
}
