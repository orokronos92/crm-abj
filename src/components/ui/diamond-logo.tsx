/**
 * Logo diamant stylisé à facettes
 * SVG custom pour le branding ABJ
 */

interface DiamondLogoProps {
  className?: string
  size?: number
}

export function DiamondLogo({ className = '', size = 32 }: DiamondLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Dégradé doré */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#D4AF37', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FFD700', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#B8860B', stopOpacity: 1 }} />
        </linearGradient>
        <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#FFE55C', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#D4AF37', stopOpacity: 0.3 }} />
        </linearGradient>
      </defs>

      {/* Base du diamant (facettes inférieures) */}
      <g opacity="0.9">
        {/* Facette centrale bas */}
        <path
          d="M 50 90 L 30 50 L 50 50 L 70 50 Z"
          fill="url(#goldGradient)"
          opacity="0.7"
        />
        {/* Facettes latérales bas */}
        <path
          d="M 30 50 L 10 30 L 50 50 Z"
          fill="url(#goldGradient)"
          opacity="0.5"
        />
        <path
          d="M 70 50 L 90 30 L 50 50 Z"
          fill="url(#goldGradient)"
          opacity="0.5"
        />
      </g>

      {/* Couronne du diamant (facettes supérieures) */}
      <g>
        {/* Table (face supérieure plate) */}
        <path
          d="M 35 20 L 50 15 L 65 20 L 65 30 L 35 30 Z"
          fill="url(#lightGradient)"
          opacity="0.9"
        />

        {/* Facettes de la couronne */}
        <path
          d="M 35 20 L 10 30 L 35 30 Z"
          fill="url(#goldGradient)"
          opacity="0.8"
        />
        <path
          d="M 65 20 L 90 30 L 65 30 Z"
          fill="url(#goldGradient)"
          opacity="0.8"
        />
        <path
          d="M 35 30 L 10 30 L 30 50 Z"
          fill="url(#goldGradient)"
          opacity="0.6"
        />
        <path
          d="M 65 30 L 90 30 L 70 50 Z"
          fill="url(#goldGradient)"
          opacity="0.6"
        />
        <path
          d="M 35 30 L 30 50 L 50 50 Z"
          fill="url(#goldGradient)"
          opacity="0.7"
        />
        <path
          d="M 65 30 L 70 50 L 50 50 Z"
          fill="url(#goldGradient)"
          opacity="0.7"
        />
      </g>

      {/* Contours pour définition */}
      <g stroke="currentColor" strokeWidth="1" fill="none" opacity="0.3">
        <path d="M 50 15 L 35 20 L 10 30 L 30 50 L 50 90 L 70 50 L 90 30 L 65 20 Z" />
        <path d="M 35 20 L 35 30" />
        <path d="M 65 20 L 65 30" />
        <path d="M 10 30 L 30 50" />
        <path d="M 90 30 L 70 50" />
        <path d="M 30 50 L 50 50 L 70 50" />
        <path d="M 50 15 L 50 50 L 50 90" />
      </g>

      {/* Reflet brillant */}
      <path
        d="M 45 18 L 55 18 L 55 25 L 45 25 Z"
        fill="white"
        opacity="0.4"
      />
    </svg>
  )
}
