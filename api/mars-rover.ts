import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'
import { nasaUrl } from './_lib/nasa'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const rover = (req.query.rover as string) || 'curiosity'
    const sol = req.query.sol as string

    const params: Record<string, string> = { page: '1' }
    if (sol) {
      params.sol = sol
    } else {
      // Get latest photos
      params.sol = '1000' // fallback, will be updated
    }

    const url = nasaUrl(`/mars-photos/api/v1/rovers/${rover}/photos`, params)
    const cacheKey = `mars-rover:${rover}:${sol || 'latest'}`
    const data = await cachedFetch(url, cacheKey, { ttlSeconds: 21600 })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=21600')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
