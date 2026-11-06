import { supabase } from '../../lib/supabaseClient'

export function subscribeToPoemComments(
  poemId: string,
  onChange: () => void
) {
  const channel = supabase
    .channel(`poem-comments-${poemId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'comments',
        filter: `poem_id=eq.${poemId}`,
      },
      () => {
        onChange()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

