// Throwaway connectivity check — confirms the Supabase project is actually
// wired up correctly before any API routes get built on top of it:
//   - tables exist and are queryable
//   - pgvector + match_cat_embedding RPC work
//   - the cat-photos Storage bucket is reachable
//
// Usage: node scripts/verify-supabase.mjs

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadDotEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local')
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, '')
    }
  }
}
loadDotEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false } })

let failures = 0

async function check(label, fn) {
  try {
    await fn()
    console.log(`OK   - ${label}`)
  } catch (err) {
    failures++
    console.log(`FAIL - ${label}: ${err.message}`)
  }
}

async function main() {
  for (const table of ['users', 'cats', 'sightings', 'alerts']) {
    await check(`table "${table}" queryable`, async () => {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (error) throw new Error(error.message)
    })
  }

  await check('pgvector + match_cat_embedding RPC', async () => {
    const zeroVector = `[${Array(512).fill(0).join(',')}]`
    const { error } = await supabase.rpc('match_cat_embedding', {
      cat_id: '00000000-0000-0000-0000-000000000000',
      query_embedding: zeroVector,
      threshold: 0.7,
    })
    // No rows matching is fine - we're checking the function + vector type
    // execute at all, not that it returns a match.
    if (error) throw new Error(error.message)
  })

  await check('cat-photos Storage bucket reachable', async () => {
    const { data, error } = await supabase.storage.getBucket('cat-photos')
    if (error) throw new Error(error.message)
    if (!data.public) throw new Error('bucket exists but is not public')
  })

  console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) failed.`)
  process.exit(failures === 0 ? 0 : 1)
}

main()
