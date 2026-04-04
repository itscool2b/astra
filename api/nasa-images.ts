import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const q = (req.query.q as string) || ''
    if (!q) {
      res.status(400).json({ error: 'Query parameter q is required' })
      return
    }

    const url = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=20`
    const cacheKey = `nasa-images:${q}`
    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 86400 })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
