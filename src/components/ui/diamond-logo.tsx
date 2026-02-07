/**
 * Logo diamant emoji ABJ
 * Logo officiel de l'Académie de Bijouterie Joaillerie
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
      viewBox="0 0 72 72"
      id="emoji"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
  )
}
