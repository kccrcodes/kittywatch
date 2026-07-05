// Throwaway de-risk script — ROADMAP Phase 0.
// Confirms CLIP embeddings actually discriminate same-cat vs different-cat
// photos before anything downstream (re-ID, match_cat_embedding, the whole
// Feature 5 demo) gets built on top of it.
//
// Usage:
//   1. Drop 3+ real cat photos into scripts/clip-test-photos/:
//        cat-a-1.jpg, cat-a-2.jpg  (same cat, two different photos)
//        cat-b-1.jpg               (a different cat)
//   2. Put your HF token in .env.local as HF_TOKEN=hf_xxx (or export it)
//   3. node scripts/derisk-clip.mjs
//
// Tries the HuggingFace serverless Inference API first (per SPEC's planned
// stack). If that doesn't return a usable embedding, falls back to local
// CLIP via @huggingface/transformers so we get a real answer today either
// way — pivoting silently on the API is exactly the failure mode this
// script exists to catch.

import { readFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const PHOTOS_DIR = path.join(process.cwd(), 'scripts', 'clip-test-photos')

const PAIRS = {
  sameCat: ['cat-a-1.jpg', 'cat-a-2.jpg'],
  differentCat: ['cat-a-1.jpg', 'cat-b-1.jpg'],
}

const HF_MODEL = 'openai/clip-vit-base-patch32'

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

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB))
}

async function embedViaHFApi(bytes, token) {
  const res = await fetch(`https://api-inference.huggingface.co/models/${HF_MODEL}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'image/jpeg',
    },
    body: bytes,
  })

  const text = await res.text()
  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error(`Non-JSON response (status ${res.status}): ${text.slice(0, 200)}`)
  }

  if (!res.ok) {
    throw new Error(`HF API error (status ${res.status}): ${JSON.stringify(parsed).slice(0, 200)}`)
  }
  if (!Array.isArray(parsed) || typeof parsed[0] !== 'number') {
    throw new Error(`Response isn't a flat embedding vector: ${JSON.stringify(parsed).slice(0, 200)}`)
  }
  return parsed
}

let localExtractor = null
async function embedViaLocalClip(bytes) {
  if (!localExtractor) {
    const { pipeline, RawImage } = await import('@huggingface/transformers')
    localExtractor = { pipe: await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32'), RawImage }
  }
  const { pipe, RawImage } = localExtractor
  const image = await RawImage.fromBlob(new Blob([bytes]))
  const output = await pipe(image)
  return Array.from(output.data)
}

async function getEmbedding(filename, token, mode) {
  const filePath = path.join(PHOTOS_DIR, filename)
  if (!existsSync(filePath)) {
    throw new Error(`Missing test photo: ${filePath}`)
  }
  const bytes = await readFile(filePath)

  if (mode === 'hf-api') return embedViaHFApi(bytes, token)
  return embedViaLocalClip(bytes)
}

async function run(mode) {
  console.log(`\n=== Mode: ${mode} ===`)
  const token = process.env.HF_TOKEN

  const cache = new Map()
  async function cachedEmbedding(filename) {
    if (!cache.has(filename)) {
      cache.set(filename, await getEmbedding(filename, token, mode))
    }
    return cache.get(filename)
  }

  const [sameA, sameB] = PAIRS.sameCat
  const [diffA, diffB] = PAIRS.differentCat

  const eSameA = await cachedEmbedding(sameA)
  const eSameB = await cachedEmbedding(sameB)
  const eDiffA = await cachedEmbedding(diffA)
  const eDiffB = await cachedEmbedding(diffB)

  const sameScore = cosineSimilarity(eSameA, eSameB)
  const diffScore = cosineSimilarity(eDiffA, eDiffB)
  const gap = sameScore - diffScore

  console.log(`Same-cat pair   (${sameA} vs ${sameB}): ${sameScore.toFixed(4)}`)
  console.log(`Different-cat pair (${diffA} vs ${diffB}): ${diffScore.toFixed(4)}`)
  console.log(`Gap: ${gap.toFixed(4)}`)

  if (gap > 0.1) {
    console.log('VERDICT: CLIP discriminates. Safe to build re-ID on top of this.')
  } else if (gap > 0) {
    console.log('VERDICT: Weak signal — same-cat scores higher but the gap is thin. Consider tuning REID_THRESHOLD carefully or testing more pairs before committing.')
  } else {
    console.log('VERDICT: FAILED — different-cat pair scored >= same-cat pair. Do not build re-ID on this path; pivot to Replicate or another model today.')
  }

  return { sameScore, diffScore, gap }
}

async function main() {
  const missing = [...new Set([...PAIRS.sameCat, ...PAIRS.differentCat])]
    .filter((f) => !existsSync(path.join(PHOTOS_DIR, f)))
  if (missing.length) {
    console.error(`Missing test photos in ${PHOTOS_DIR}:`)
    for (const f of missing) console.error(`  - ${f}`)
    console.error('\nDrop the photos listed above in that folder and re-run.')
    process.exit(1)
  }

  if (process.env.HF_TOKEN) {
    try {
      await run('hf-api')
      return
    } catch (err) {
      console.error(`\nHF serverless API path failed: ${err.message}`)
      console.error('Falling back to local CLIP via @huggingface/transformers...')
    }
  } else {
    console.log('No HF_TOKEN found — skipping the serverless API path, going straight to local CLIP.')
  }

  try {
    await run('local-clip')
  } catch (err) {
    console.error(`\nLocal CLIP path also failed: ${err.message}`)
    console.error('Run: npm install @huggingface/transformers')
    process.exit(1)
  }
}

main()
