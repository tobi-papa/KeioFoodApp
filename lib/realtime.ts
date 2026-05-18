import { supabase } from './supabase'

export function subscribeToNotifications(onUpdate: (count: number) => void) {
  const channel = supabase
    .channel('notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('read', false)
        onUpdate(count ?? 0)
      }
    )
    .subscribe()

  return () => { supabase.removeChannel(channel) }
}
