import { kv } from '@vercel/kv'

interface CacheOptions {
  ttlSeconds: number
}

/**
 * Fetch with KV cache. Falls back to direct fetch if KV is unavailable
 * (e.g., local dev without KV configured).
 */
export async function cachedFetch(
  url: string,
  cacheKey: string,
  options: CacheOptions
): Promise<unknown> {
  // Try cache first
  try {
    const cached = await kv.get(cacheKey)
    if (cached) return cached
  } catch {
    // KV not available — proceed to direct fetch
  }

  // Fetch from source
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`NASA API error: ${res.status} ${res.statusText}`)
  }

  const data = await res.json()

  // Store in cache
  try {
    await kv.set(cacheKey, data, { ex: options.ttlSeconds })
  } catch {
    // KV not available — that's OK
  }

  return data
}
