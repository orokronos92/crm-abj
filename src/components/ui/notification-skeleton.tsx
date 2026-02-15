/**
 * Composant Skeleton pour les notifications pendant le chargement
 * Évite le flickering/jumping lors de l'actualisation
 */

export function NotificationSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="p-4 border-b border-[rgba(var(--border),0.1)]">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-[rgba(var(--foreground),0.1)] rounded"></div>
          <div className="h-6 w-20 bg-[rgba(var(--accent),0.2)] rounded-full"></div>
        </div>
      </div>

      {/* Notification items skeleton */}
      <div className="max-h-[400px] overflow-y-auto">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className="p-4 hover:bg-[rgba(var(--border),0.05)] border-b border-[rgba(var(--border),0.1)]"
          >
            <div className="flex items-start gap-3">
              {/* Icon skeleton */}
              <div className="w-10 h-10 rounded-lg bg-[rgba(var(--foreground),0.1)]"></div>

              {/* Content skeleton */}
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-48 bg-[rgba(var(--foreground),0.15)] rounded"></div>
                  <div className="h-3 w-16 bg-[rgba(var(--foreground),0.1)] rounded"></div>
                </div>
                <div className="h-3 w-full bg-[rgba(var(--foreground),0.1)] rounded"></div>
                <div className="h-3 w-3/4 bg-[rgba(var(--foreground),0.05)] rounded"></div>

                {/* Badge skeleton */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-5 w-16 bg-[rgba(var(--accent),0.1)] rounded-full"></div>
                  <div className="h-5 w-20 bg-[rgba(var(--warning),0.1)] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="p-4 border-t border-[rgba(var(--border),0.1)]">
        <div className="flex items-center justify-between gap-2">
          <div className="h-9 w-full bg-[rgba(var(--foreground),0.05)] rounded"></div>
          <div className="h-9 w-full bg-[rgba(var(--foreground),0.05)] rounded"></div>
        </div>
      </div>
    </div>
  )
}

/**
 * Version minimaliste pour une seule notification
 */
export function NotificationItemSkeleton() {
  return (
    <div className="animate-pulse p-4 border-b border-[rgba(var(--border),0.1)]">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-[rgba(var(--foreground),0.1)]"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/4 bg-[rgba(var(--foreground),0.15)] rounded"></div>
          <div className="h-3 w-full bg-[rgba(var(--foreground),0.1)] rounded"></div>
          <div className="flex gap-2 mt-2">
            <div className="h-5 w-16 bg-[rgba(var(--accent),0.1)] rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}