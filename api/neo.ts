import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'
import { nasaUrl } from './_lib/nasa'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

    const url = nasaUrl('/neo/rest/v1/feed', {
      start_date: today,
      end_date: endDate,
    })
    const cacheKey = `neo:${today}`
    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 3600 })

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
