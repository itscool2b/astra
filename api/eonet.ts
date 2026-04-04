import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const url = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50'
    const data = await cachedFetch(url, 'eonet:open', { ttlSeconds: 3600 })

    res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
