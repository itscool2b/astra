import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const upstream = await fetch('https://eyes.nasa.gov/dsn/data/dsn.xml')
    if (!upstream.ok) throw new Error(`Upstream error: ${upstream.status}`)
    const text = await upstream.text()

    res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30')
    res.setHeader('Content-Type', 'text/xml')
    res.status(200).send(text)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
