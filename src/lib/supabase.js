import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Returns null if env vars not set (for local dev without Supabase)
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// ── Pledges ──────────────────────────────────────────────────────────────────

export async function fetchPledges() {
  if (!supabase) return { data: [], error: null }
  return supabase
    .from('pledges')
    .select('*')
    .order('created_at', { ascending: false })
}

export async function insertPledge({ name, house_number, amount, message }) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.from('pledges').insert([{ name, house_number, amount, message }]).select()
}

// Replace any existing pledge(s) for this house_number with a single new one
export async function upsertPledge({ name, house_number, amount, message }) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  await supabase.from('pledges').delete().eq('house_number', house_number)
  return supabase.from('pledges').insert([{ name, house_number, amount, message }]).select()
}

// ── Community messages ───────────────────────────────────────────────────────

export async function fetchMessages() {
  if (!supabase) return { data: [], error: null }
  return supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)
}

export async function insertMessage({ author_name, content }) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.from('messages').insert([{ author_name, content }]).select()
}

// ── Real-time subscriptions ──────────────────────────────────────────────────

export function subscribeToPledges(callback) {
  if (!supabase) return { unsubscribe: () => {} }
  const channel = supabase
    .channel('pledges-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pledges' }, callback)
    .subscribe()
  return channel
}

export function subscribeToMessages(callback) {
  if (!supabase) return { unsubscribe: () => {} }
  const channel = supabase
    .channel('messages-changes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback)
    .subscribe()
  return channel
}
