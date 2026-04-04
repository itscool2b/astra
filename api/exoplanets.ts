import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const query =
      'SELECT+pl_name,hostname,disc_year,discoverymethod,pl_orbper,pl_rade,pl_bmasse,pl_eqt,sy_dist,pl_orbsmax,st_spectype,st_teff+FROM+pscomppars+WHERE+disc_year+IS+NOT+NULL'
    const upstream = await fetch(
      `https://exoplanetarchive.ipac.caltech.edu/TAP/sync?query=${query}&format=json`
    )
    if (!upstream.ok) throw new Error(`Upstream error: ${upstream.status}`)
    const data = await upstream.json()

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800')
    res.status(200).json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(500).json({ error: message })
  }
}
