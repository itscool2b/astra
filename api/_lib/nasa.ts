const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY'
const NASA_BASE = 'https://api.nasa.gov'

export function nasaUrl(path: string, params: Record<string, string> = {}): string {
  const url = new URL(`${NASA_BASE}${path}`)
  url.searchParams.set('api_key', NASA_API_KEY)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }
  return url.toString()
}
