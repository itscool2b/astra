import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'
import { nasaUrl } from './_lib/nasa'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const type = (req.query.type as string) || 'CME'
    const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]

    const typeMap: Record<string, string> = {
      CME: '/DONKI/CME',
      FLR: '/DONKI/FLR',
      GST: '/DONKI/GST',
      SEP: '/DONKI/SEP',
      IPS: '/DONKI/IPS',
    }

    const path = typeMap[type] || '/DONKI/CME'
    const url = nasaUrl(path, { startDate })
    const cacheKey = `donki:${type}:${startDate}`
    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 1800 })

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=1800')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
