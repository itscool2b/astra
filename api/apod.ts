import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'
import { nasaUrl } from './_lib/nasa'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { date, count } = req.query

    const params: Record<string, string> = {}
    if (typeof date === 'string') params.date = date
    if (typeof count === 'string') params.count = count

    const url = nasaUrl('/planetary/apod', params)
    const cacheKey = `apod:${date || 'today'}:${count || ''}`

    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 86400 })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
