'use client'

import { useEffect, useState } from 'react'
import { subscribeToNotifications } from '@/lib/realtime'

interface Props {
  initialCount: number
}

export function NotificationBadge({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const unsub = subscribeToNotifications(setCount)
    return () => { unsub() }
  }, [])

  if (count === 0) return null

  return (
    <span className="mono text-xs bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
      {count > 99 ? '99+' : count}
    </span>
  )
}
