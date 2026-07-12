interface IconProps {
  className?: string
}

const commonProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IconDashboard({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <rect x="3.5" y="12" width="4" height="8.5" rx="1" />
      <rect x="10" y="7" width="4" height="13.5" rx="1" />
      <rect x="16.5" y="3.5" width="4" height="17" rx="1" />
    </svg>
  )
}

export function IconFood({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M6 2.5v8a1.5 1.5 0 0 0 1.5 1.5h0a1.5 1.5 0 0 0 1.5-1.5v-8" />
      <path d="M7.5 12v9.5" />
      <path d="M6 2.5v4" />
      <path d="M9 2.5v4" />
      <path d="M17.5 2.5c-1.7 0-3 2-3 5s1.3 5 3 5v9" />
    </svg>
  )
}

export function IconWorkout({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <path d="M4 9v6" />
      <path d="M2.5 10.5v3" />
      <path d="M20 9v6" />
      <path d="M21.5 10.5v3" />
      <path d="M7 12h10" />
      <path d="M6 8v8" />
      <path d="M18 8v8" />
    </svg>
  )
}

export function IconProfile({ className }: IconProps) {
  return (
    <svg {...commonProps} className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 20.5c1.4-4 4.2-6 7.5-6s6.1 2 7.5 6" />
    </svg>
  )
}
