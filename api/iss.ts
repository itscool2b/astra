import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const upstream = await fetch('https://api.open-notify.org/iss-now.json')
    if (!upstream.ok) throw new Error(`Upstream error: ${upstream.status}`)
    const data = await upstream.json()

    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
