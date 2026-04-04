import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'

function nasaDevProxy(): Plugin {
  let apiKey = ''

  return {
    name: 'nasa-dev-proxy',
    configResolved(config) {
      const env = loadEnv(config.mode, config.root, '')
      apiKey = env.NASA_API_KEY || 'DEMO_KEY'
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) return next()

        const parsed = new URL(req.url, 'http://localhost')
        const route = parsed.pathname.replace('/api/', '')
        let targetUrl: string

        try {
          switch (route) {
            case 'apod': {
              const url = new URL('https://api.nasa.gov/planetary/apod')
              url.searchParams.set('api_key', apiKey)
              const date = parsed.searchParams.get('date')
              const count = parsed.searchParams.get('count')
              if (date) url.searchParams.set('date', date)
              if (count) url.searchParams.set('count', count)
              targetUrl = url.toString()
              break
            }

            case 'mars-rover': {
              const rover = parsed.searchParams.get('rover') || 'curiosity'
              const sol = parsed.searchParams.get('sol') || '1000'
              const url = new URL(`https://api.nasa.gov/mars-photos/api/v1/rovers/${rover}/photos`)
              url.searchParams.set('sol', sol)
              url.searchParams.set('page', '1')
              url.searchParams.set('api_key', apiKey)
              targetUrl = url.toString()
              break
            }

            case 'neo': {
              const today = new Date().toISOString().split('T')[0]
              const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
              const url = new URL('https://api.nasa.gov/neo/rest/v1/feed')
              url.searchParams.set('start_date', today)
              url.searchParams.set('end_date', endDate)
              url.searchParams.set('api_key', apiKey)
              targetUrl = url.toString()
              break
            }

            case 'epic': {
              targetUrl = 'https://epic.gsfc.nasa.gov/api/natural'
              break
            }

            case 'donki': {
              const type = parsed.searchParams.get('type') || 'CME'
              const typeMap: Record<string, string> = {
                CME: '/DONKI/CME',
                FLR: '/DONKI/FLR',
                GST: '/DONKI/GST',
                SEP: '/DONKI/SEP',
                IPS: '/DONKI/IPS',
              }
              const path = typeMap[type] || '/DONKI/CME'
              const startDate = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
              const url = new URL(`https://api.nasa.gov${path}`)
              url.searchParams.set('startDate', startDate)
              url.searchParams.set('api_key', apiKey)
              targetUrl = url.toString()
              break
            }

            case 'eonet': {
              targetUrl = 'https://eonet.gsfc.nasa.gov/api/v3/events?status=open&limit=50'
              break
            }

            case 'horizons': {
              const id = parsed.searchParams.get('id') || '-170'
              const today = new Date().toISOString().split('T')[0]
              const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
              targetUrl = `https://ssd.jpl.nasa.gov/api/horizons.api?format=json&COMMAND='${id}'&OBJ_DATA=NO&MAKE_EPHEM=YES&EPHEM_TYPE=VECTORS&CENTER='500@10'&START_TIME='${today}'&STOP_TIME='${tomorrow}'&STEP_SIZE='1d'`
              break
            }

            case 'nasa-images': {
              const q = parsed.searchParams.get('q') || ''
              if (!q) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'Query parameter q is required' }))
                return
              }
              targetUrl = `https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=20`
              break
            }

            case 'iss': {
              targetUrl = 'http://api.open-notify.org/iss-now.json'
              break
            }

            case 'dsn': {
              targetUrl = 'https://eyes.nasa.gov/dsn/data/dsn.xml'
              break
            }

            default:
              return next()
          }

          const upstream = await fetch(targetUrl)
          const body = await upstream.text()

          res.statusCode = upstream.status
          res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*')
          res.end(body)
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Proxy error'
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: message }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), glsl(), nasaDevProxy()],
  assetsInclude: ['**/*.glb', '**/*.hdr'],
})
