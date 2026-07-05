import { pipeline, RawImage, type ImageFeatureExtractionPipeline } from "@huggingface/transformers"

// Local CLIP, not HF's hosted Inference API - that endpoint is dead/doesn't
// support raw image embeddings for this model. See scripts/derisk-clip.mjs.
let extractorPromise: Promise<ImageFeatureExtractionPipeline> | null = null

function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline("image-feature-extraction", "Xenova/clip-vit-base-patch32")
  }
  return extractorPromise
}

export async function generateClipEmbedding(photoUrl: string): Promise<number[]> {
  const response = await fetch(photoUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch photo (${response.status}): ${photoUrl}`)
  }
  const blob = await response.blob()
  const image = await RawImage.fromBlob(blob)

  const extractor = await getExtractor()
  const output = await extractor(image)
  return Array.from(output.data as Float32Array)
}

/** Postgres vector literal, e.g. "[0.1,0.2,...]" - what pgvector columns expect over PostgREST. */
export function embeddingToPgVector(embedding: number[]): string {
  return `[${embedding.join(",")}]`
}
