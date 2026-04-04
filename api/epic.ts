import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cachedFetch } from './_lib/cache'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'
    const url = `https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`
    const data = await cachedFetch(url, 'epic:natural', { ttlSeconds: 21600 })

    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=21600')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
