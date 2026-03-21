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

// Replace any existing pledge(s) for this house_number with a single new one.
// Tries both string and numeric forms of house_number to handle column type differences.
export async function upsertPledge({ name, house_number, amount, message }) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  // Attempt delete as string and as number to cover either column type
  await supabase.from('pledges').delete().eq('house_number', String(house_number))
  await supabase.from('pledges').delete().eq('house_number', Number(house_number))
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

// ── Admin: message deletion ───────────────────────────────────────────────────

export async function deleteMessage(id) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.from('messages').delete().eq('id', id)
}

// ── Admin: pledge editing ─────────────────────────────────────────────────────

export async function updatePledgeById(id, { name, amount, message }) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase.from('pledges').update({ name, amount, message }).eq('id', id).select()
}

export async function deletePledgeById(id) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  // .select() makes Supabase return the deleted rows so we can detect
  // a silent RLS block (returns [] instead of [{ id, ... }]).
  return supabase.from('pledges').delete().eq('id', id).select()
}

// ── Pledge transaction log (append-only audit trail) ─────────────────────────

export async function logPledgeTransaction({ type, house_number, name, amount, message }) {
  if (!supabase) return { error: null }   // silently skip when not configured
  return supabase
    .from('pledge_log')
    .insert([{ type, house_number: String(house_number ?? ''), name, amount, message }])
}

export async function fetchPledgeLogs() {
  if (!supabase) return { data: [], error: null }
  return supabase
    .from('pledge_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500)
}

// ── Admin: project settings (requires `settings` table: id, key text unique, value text) ──

export async function fetchSetting(key) {
  if (!supabase) return { data: null, error: null }
  const { data, error } = await supabase
    .from('settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  return { data: data?.value ?? null, error }
}

export async function upsertSetting(key, value) {
  if (!supabase) return { error: { message: 'Supabase not configured' } }
  return supabase
    .from('settings')
    .upsert({ key, value: String(value) }, { onConflict: 'key' })
    .select()
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
