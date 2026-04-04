import { useQuery } from '@tanstack/react-query'
import type {
  APODData,
  MarsRoverPhoto,
  EPICImage,
  DONKICME,
  DONKIFlare,
  DONKIStorm,
  DONKISEP,
  DONKIIPS,
  EONETEvent,
  NEOData,
  ExoplanetData,
} from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api'

async function fetchApi<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${window.location.origin}${API_BASE}${path}`)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// --- APOD ---
export function useAPOD() {
  return useQuery({
    queryKey: ['apod'],
    queryFn: () => fetchApi<APODData>('/apod'),
    staleTime: 24 * 60 * 60 * 1000,
  })
}

// --- Mars Rover Photos ---
export function useMarsRoverPhotos(rover: string, sol?: number) {
  return useQuery({
    queryKey: ['mars-rover', rover, sol],
    queryFn: () =>
      fetchApi<{ photos: MarsRoverPhoto[] }>('/mars-rover', {
        rover,
        ...(sol !== undefined ? { sol: String(sol) } : {}),
      }),
    staleTime: 6 * 60 * 60 * 1000,
    select: (data) => data.photos,
  })
}

// --- NEO ---
export function useNEOFeed() {
  return useQuery({
    queryKey: ['neo-feed'],
    queryFn: () => fetchApi<{ near_earth_objects: Record<string, NEOData[]> }>('/neo'),
    staleTime: 60 * 60 * 1000,
  })
}

// --- EPIC ---
export function useEPIC() {
  return useQuery({
    queryKey: ['epic'],
    queryFn: () => fetchApi<EPICImage[]>('/epic'),
    staleTime: 6 * 60 * 60 * 1000,
  })
}

// --- DONKI (Space Weather) ---
export function useDONKICMEs() {
  return useQuery({
    queryKey: ['donki-cme'],
    queryFn: () => fetchApi<DONKICME[]>('/donki', { type: 'CME' }),
    staleTime: 30 * 60 * 1000,
  })
}

export function useDONKIFlares() {
  return useQuery({
    queryKey: ['donki-flr'],
    queryFn: () => fetchApi<DONKIFlare[]>('/donki', { type: 'FLR' }),
    staleTime: 30 * 60 * 1000,
  })
}

export function useDONKIStorms() {
  return useQuery({
    queryKey: ['donki-gst'],
    queryFn: () => fetchApi<DONKIStorm[]>('/donki', { type: 'GST' }),
    staleTime: 30 * 60 * 1000,
  })
}

export function useDONKISEP() {
  return useQuery({
    queryKey: ['donki-sep'],
    queryFn: () => fetchApi<DONKISEP[]>('/donki', { type: 'SEP' }),
    staleTime: 30 * 60 * 1000,
  })
}

export function useDONKIIPS() {
  return useQuery({
    queryKey: ['donki-ips'],
    queryFn: () => fetchApi<DONKIIPS[]>('/donki', { type: 'IPS' }),
    staleTime: 30 * 60 * 1000,
  })
}

// --- NASA Image Library ---
export function useNASAImages(query: string) {
  return useQuery({
    queryKey: ['nasa-images', query],
    queryFn: () => fetchApi<{
      collection: {
        items: {
          data: { title: string; description: string; date_created: string; nasa_id: string }[]
          links?: { href: string; rel: string }[]
        }[]
      }
    }>('/nasa-images', { q: query }),
    staleTime: 24 * 60 * 60 * 1000,
    enabled: query.length > 0,
  })
}

// --- Spacecraft (JPL Horizons) ---
export function useSpacecraftPosition(horizonsId: string) {
  return useQuery({
    queryKey: ['spacecraft', horizonsId],
    queryFn: async () => {
      const res = await fetchApi<{ result: string }>('/horizons', { id: horizonsId })
      // Parse the Horizons text response for X,Y,Z vector
      const text = res.result
      const lines = text.split('\n')
      const soeIdx = lines.findIndex(l => l.includes('$$SOE'))
      const eoeIdx = lines.findIndex(l => l.includes('$$EOE'))
      if (soeIdx === -1 || eoeIdx === -1) throw new Error('No ephemeris data')
      // Data lines are between SOE and EOE
      // Format: JDTDB, then X Y Z on next line, then VX VY VZ, then LT RG RR
      const dataLines = lines.slice(soeIdx + 1, eoeIdx).filter(l => l.trim())
      // The position line has X, Y, Z values
      // Lines: [0]=JDTDB, [1]=X Y Z, [2]=VX VY VZ, [3]=LT RG RR
      if (dataLines.length < 3) throw new Error('Insufficient data')
      // Format: "X =-1.462E+08 Y =-3.667E+07 Z = 2.006E+05"
      const posLine = dataLines[1].trim()
      const xMatch = posLine.match(/X\s*=\s*([-\d.E+]+)/i)
      const yMatch = posLine.match(/Y\s*=\s*([-\d.E+]+)/i)
      const zMatch = posLine.match(/Z\s*=\s*([-\d.E+]+)/i)
      if (!xMatch || !yMatch || !zMatch) throw new Error('Could not parse position')
      // Parse velocity line with try/catch for robustness
      let vx = 0, vy = 0, vz = 0, speed = 0
      try {
        const velLine = dataLines[2].trim()
        const vxMatch = velLine.match(/VX\s*=\s*([-\d.E+]+)/i)
        const vyMatch = velLine.match(/VY\s*=\s*([-\d.E+]+)/i)
        const vzMatch = velLine.match(/VZ\s*=\s*([-\d.E+]+)/i)
        vx = vxMatch ? parseFloat(vxMatch[1]) : 0
        vy = vyMatch ? parseFloat(vyMatch[1]) : 0
        vz = vzMatch ? parseFloat(vzMatch[1]) : 0
        if (isNaN(vx) || isNaN(vy) || isNaN(vz)) { vx = 0; vy = 0; vz = 0 }
        speed = Math.sqrt(vx * vx + vy * vy + vz * vz)
      } catch {
        // velocity parsing failed, keep speed=0
      }
      // Horizons outputs in km, convert to AU
      const kmToAu = 1 / 1.496e8
      const x = parseFloat(xMatch[1]) * kmToAu
      const y = parseFloat(yMatch[1]) * kmToAu
      const z = parseFloat(zMatch[1]) * kmToAu
      if (isNaN(x) || isNaN(y) || isNaN(z)) throw new Error('Parsed position contains NaN')
      return { x, y, z, vx, vy, vz, speed }
    },
    staleTime: 24 * 60 * 60 * 1000,
  })
}

// --- SBDB Close Approaches ---
export function useCloseApproaches() {
  return useQuery({
    queryKey: ['close-approaches'],
    queryFn: () => fetchApi<{ count: string; data: string[][] }>('/cad'),
    staleTime: 24 * 60 * 60 * 1000,
  })
}

// --- EONET ---
export function useEONET() {
  return useQuery({
    queryKey: ['eonet'],
    queryFn: () => fetchApi<{ events: EONETEvent[] }>('/eonet'),
    staleTime: 60 * 60 * 1000,
    select: (data) => data.events,
  })
}

// --- ISS Position ---
export function useISSPosition() {
  return useQuery({
    queryKey: ['iss-position'],
    queryFn: () => fetchApi<{ iss_position: { latitude: string; longitude: string }; timestamp: number }>('/iss'),
    refetchInterval: 10000,
    staleTime: 5000,
  })
}

// --- DSN Status ---
export interface DSNSignal {
  direction: 'up' | 'down'
  dataRate: number | null
}

export interface DSNDish {
  dish: string
  targets: string[]
  complex: string
  azimuthAngle: number | null
  elevationAngle: number | null
  signals: DSNSignal[]
}

function detectComplex(dishName: string): string {
  const match = dishName.match(/DSS-?(\d+)/i)
  if (!match) return 'Unknown'
  const num = parseInt(match[1], 10)
  if (num >= 10 && num < 30) return 'Goldstone'
  if (num >= 30 && num < 50) return 'Canberra'
  if (num >= 50 && num < 70) return 'Madrid'
  return 'Unknown'
}

export function useDSNStatus() {
  return useQuery({
    queryKey: ['dsn'],
    queryFn: async () => {
      const res = await fetch(`${window.location.origin}${API_BASE}/dsn`)
      const text = await res.text()
      try {
        const parser = new DOMParser()
        const xml = parser.parseFromString(text, 'text/xml')
        const dishes = xml.querySelectorAll('dish')
        const result: DSNDish[] = []
        dishes.forEach(dish => {
          const name = dish.getAttribute('name') || ''
          const friendlyName = dish.getAttribute('friendlyName') || name
          const azStr = dish.getAttribute('azimuthAngle')
          const elStr = dish.getAttribute('elevationAngle')
          const targets: string[] = []
          dish.querySelectorAll('target').forEach(t => {
            const tName = t.getAttribute('name')
            if (tName && tName !== '' && tName !== 'NONE') targets.push(tName)
          })
          // Parse signals
          const signals: DSNSignal[] = []
          dish.querySelectorAll('downSignal').forEach(sig => {
            const rateStr = sig.getAttribute('dataRate')
            signals.push({
              direction: 'down',
              dataRate: rateStr ? parseFloat(rateStr) : null,
            })
          })
          dish.querySelectorAll('upSignal').forEach(sig => {
            const rateStr = sig.getAttribute('dataRate')
            signals.push({
              direction: 'up',
              dataRate: rateStr ? parseFloat(rateStr) : null,
            })
          })
          if (targets.length > 0) {
            result.push({
              dish: friendlyName || name,
              targets,
              complex: detectComplex(name),
              azimuthAngle: azStr ? parseFloat(azStr) : null,
              elevationAngle: elStr ? parseFloat(elStr) : null,
              signals,
            })
          }
        })
        return result
      } catch {
        return [] as DSNDish[]
      }
    },
    refetchInterval: 30000,
    staleTime: 15000,
  })
}

// --- Exoplanet Archive ---
export function useExoplanets() {
  return useQuery({
    queryKey: ['exoplanets'],
    queryFn: () => fetchApi<ExoplanetData[]>('/exoplanets'),
    staleTime: 7 * 24 * 60 * 60 * 1000,
  })
}
