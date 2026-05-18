interface Props {
  score: number   // 0–5, supports .5 increments
  size?: 'sm' | 'md'
}

export function RamenScore({ score, size = 'md' }: Props) {
  const bowls = Array.from({ length: 5 }, (_, i) => {
    const fill = Math.min(1, Math.max(0, score - i))
    return fill >= 1 ? 'full' : fill >= 0.5 ? 'half' : 'empty'
  })

  const sz = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'

  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${score} out of 5`}>
      {bowls.map((state, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={sz}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <clipPath id={`half-${i}`}>
              <rect x="0" y="0" width="12" height="24" />
            </clipPath>
          </defs>
          {/* Base (empty) */}
          <circle cx="12" cy="14" r="7" stroke="#E2E8F0" strokeWidth="1.5" fill="#F8FAFC" />
          <path d="M5 10 Q12 4 19 10" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
          {/* Filled overlay */}
          {state !== 'empty' && (
            <g clipPath={state === 'half' ? `url(#half-${i})` : undefined}>
              <circle cx="12" cy="14" r="7" fill="var(--accent-a)" />
              <path d="M5 10 Q12 4 19 10" stroke="var(--accent-b)" strokeWidth="1.5" fill="none" />
            </g>
          )}
        </svg>
      ))}
    </div>
  )
}
