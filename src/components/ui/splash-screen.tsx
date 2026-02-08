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
    // Commencer le fade out après 4.5 secondes
    const fadeTimer = setTimeout(() => {
      setFadeOut(true)
    }, 4500)

    // Cacher complètement après 5 secondes
    const hideTimer = setTimeout(() => {
      setIsVisible(false)
    }, 5000)

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
        {[...Array(20)].map((_, i) => {
          // Générer positions aléatoires une seule fois au render
          const left = (i * 5 + (i % 3) * 30) % 100
          const top = (i * 7 + (i % 5) * 20) % 100
          const delay = (i * 0.1) % 2

          return (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[rgb(var(--accent))] rounded-full animate-pulse"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animationDelay: `${delay}s`,
                boxShadow: '0 0 6px rgba(218, 165, 32, 0.8)',
              }}
            />
          )
        })}
      </div>

      <div className="relative flex flex-col items-center">
        {/* Logo Diamant Emoji */}
        <div className="relative">
          <svg
            width="120"
            height="120"
            viewBox="0 0 72 72"
            id="emoji"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-diamond"
            style={{ filter: 'drop-shadow(0 0 30px rgba(218, 165, 32, 0.6))' }}
          >
            <g id="color">
              <polygon fill="#D4AF37" points="56.3771,11.9798 16.3771,11.9798 4,23.3481 36,64.0837 68,23.3481"/>
              <polyline fill="#FFD700" points="37.3698,62.3355 55.7486,23.3482 36,11.9798 56.3771,11.9798 68,23.3481 37.3698,62.3355"/>
            </g>
            <g id="line">
              <polygon
                fill="none"
                stroke="#1a1a1a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="2"
                points="56.3771,11.9798 16.3771,11.9798 4,23.3481 36,64.0837 68,23.3481"
              />
              <polyline
                fill="none"
                stroke="#1a1a1a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="2"
                points="55.7486,23.8595 36,64.0837 36,24.3482 36,11.9798 16.2556,23.3482"
              />
              <line
                x1="16.2556"
                x2="36.0042"
                y1="23.8595"
                y2="64.0837"
                fill="none"
                stroke="#1a1a1a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="2"
              />
              <line
                x1="4"
                x2="68"
                y1="23.3482"
                y2="23.3482"
                fill="none"
                stroke="#1a1a1a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeMiterlimit="10"
                strokeWidth="2"
              />
            </g>
          </svg>

          {/* Halo lumineux animé */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-[rgb(var(--accent))] rounded-full opacity-10 animate-pulse-gold blur-xl" />
          </div>
        </div>

        {/* Texte ABJ */}
        <div className="mt-8 text-center">
          <h1 className="text-4xl font-bold text-gradient-gold tracking-wider">
            ABJ
          </h1>
          <p className="text-sm text-[rgb(var(--accent))] mt-2 tracking-[0.3em] uppercase opacity-80">
            Académie de Bijouterie Joaillerie
          </p>
        </div>

        {/* Barre de chargement */}
        <div className="mt-8 w-48">
          <div className="h-0.5 bg-[rgb(var(--secondary))] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-light))] rounded-full"
              style={{
                animation: 'loadingBar 4.5s ease-out forwards',
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