import { useQuery } from '@tanstack/react-query'
import type {
  APODData,
  MarsRoverPhoto,
  EPICImage,
  DONKICME,
  DONKIFlare,
  EONETEvent,
  NEOData,
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
      if (dataLines.length < 2) throw new Error('Insufficient data')
      const posLine = dataLines[1].trim()
      const parts = posLine.split(/\s+/).map(Number)
      // Horizons outputs in km, convert to AU
      const kmToAu = 1 / 1.496e8
      return {
        x: parts[0] * kmToAu,
        y: parts[1] * kmToAu,
        z: parts[2] * kmToAu,
      }
    },
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
