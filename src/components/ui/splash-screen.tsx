/**
 * Splash Screen avec logo diamant animé
 * Affiché pendant le chargement initial
 */

'use client'

import { useEffect, useState } from 'react'

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Commencer le fade out après 3.5 secondes
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 3500)

    // Cacher complètement après 4 secondes
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 4000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at center, rgb(24, 24, 24) 0%, rgb(15, 15, 15) 100%)',
      }}
    >
      {/* Effet de particules dorées en arrière-plan */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-[rgb(var(--accent))] rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              boxShadow: '0 0 6px rgba(218, 165, 32, 0.8)',
            }}
          />
        ))}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Logo Diamant SVG */}
        <div className="relative">
          <svg
            width="120"
            height="120"
            viewBox="0 0 200 200"
            className="animate-diamond"
            style={{ filter: 'drop-shadow(0 0 30px rgba(218, 165, 32, 0.6))' }}
          >
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="50%" stopColor="#DAA520" />
                <stop offset="100%" stopColor="#B8860B" />
              </linearGradient>
              <linearGradient id="goldGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#DAA520" />
              </linearGradient>
            </defs>

            {/* Forme principale du diamant */}
            <g transform="translate(100, 100)">
              {/* Facette supérieure */}
              <polygon
                points="0,-60 -40,-20 0,-30 40,-20"
                fill="url(#goldGradient)"
                opacity="0.9"
                className="animate-diamond-shine"
              />
              {/* Facettes latérales */}
              <polygon
                points="-40,-20 -60,0 -40,20 0,-30"
                fill="url(#goldGradient2)"
                opacity="0.8"
              />
              <polygon
                points="40,-20 60,0 40,20 0,-30"
                fill="url(#goldGradient2)"
                opacity="0.8"
              />
              {/* Facette centrale */}
              <polygon
                points="0,-30 -40,20 0,60 40,20"
                fill="url(#goldGradient)"
                opacity="1"
                className="animate-pulse"
              />
              {/* Facettes inférieures */}
              <polygon
                points="-40,-20 -40,20 -60,0"
                fill="#B8860B"
                opacity="0.7"
              />
              <polygon
                points="40,-20 40,20 60,0"
                fill="#B8860B"
                opacity="0.7"
              />
              {/* Pointe inférieure */}
              <polygon
                points="-40,20 0,60 40,20"
                fill="#DAA520"
                opacity="0.85"
              />

              {/* Lignes de brillance */}
              <line
                x1="0" y1="-60"
                x2="0" y2="60"
                stroke="#FFD700"
                strokeWidth="0.5"
                opacity="0.6"
              />
              <line
                x1="-60" y1="0"
                x2="60" y2="0"
                stroke="#FFD700"
                strokeWidth="0.5"
                opacity="0.6"
              />
            </g>
          </svg>

          {/* Halo lumineux animé */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-[rgb(var(--accent))] rounded-full opacity-20 animate-pulse-gold blur-xl" />
          </div>
        </div>

        {/* Texte ABJ */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold text-gradient-gold tracking-wider">
            ABJ
          </h1>
          <p className="text-sm text-[rgb(var(--accent))] mt-2 tracking-[0.3em] uppercase opacity-80">
            Académie de Bijouterie
          </p>
        </div>

        {/* Barre de chargement */}
        <div className="mt-8 w-48">
          <div className="h-0.5 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] rounded-full"
              style={{
                animation: 'loadingBar 3.5s ease-out forwards',
              }}
            />
          </div>
        </div>

        {/* Texte de chargement */}
        <p className="mt-4 text-xs text-[rgb(var(--muted-foreground))] animate-pulse">
          Chargement du CRM...
        </p>
      </div>

      <style jsx>{`
        @keyframes loadingBar {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}