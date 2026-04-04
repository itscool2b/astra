import { create } from 'zustand'

export type ScaleMode = 'compressed' | 'realistic'
export type QualityTier = 'high' | 'medium' | 'low'

export interface CelestialTarget {
  id: string
  name: string
  type: 'star' | 'planet' | 'dwarf-planet' | 'moon' | 'asteroid' | 'comet' | 'spacecraft'
  parentId?: string
}

interface TimeState {
  currentTime: Date
  playbackSpeed: number
  isPlaying: boolean
  speedPresets: number[]
}

interface AppState {
  selectedObject: CelestialTarget | null
  hoveredObject: string | null
  selectObject: (obj: CelestialTarget | null) => void
  setHoveredObject: (id: string | null) => void
  cameraTarget: CelestialTarget | null
  flyTo: (target: CelestialTarget) => void
  isFlyingTo: boolean
  setIsFlyingTo: (v: boolean) => void
  scaleMode: ScaleMode
  toggleScaleMode: () => void
  time: TimeState
  setTime: (time: Date) => void
  setPlaybackSpeed: (speed: number) => void
  togglePlay: () => void
  quality: QualityTier
  setQuality: (q: QualityTier) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  searchOpen: boolean
  setSearchOpen: (open: boolean) => void
  panelOpen: boolean
  setPanelOpen: (open: boolean) => void
  loadingProgress: number
  setLoadingProgress: (p: number) => void
  loadingComplete: boolean
  setLoadingComplete: (v: boolean) => void
  overlayOpen: boolean
  setOverlayOpen: (v: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  selectedObject: null,
  hoveredObject: null,
  selectObject: (obj) => set({ selectedObject: obj, panelOpen: obj !== null }),
  setHoveredObject: (id) => set({ hoveredObject: id }),
  cameraTarget: null,
  flyTo: (target) => set({ cameraTarget: target, isFlyingTo: true }),
  isFlyingTo: false,
  setIsFlyingTo: (v) => set({ isFlyingTo: v }),
  scaleMode: 'compressed',
  toggleScaleMode: () => set((s) => ({ scaleMode: s.scaleMode === 'compressed' ? 'realistic' : 'compressed' })),
  time: {
    currentTime: new Date(),
    playbackSpeed: 1,
    isPlaying: false,
    speedPresets: [1, 86400, 2592000, 31557600],
  },
  setTime: (time) => set((s) => ({ time: { ...s.time, currentTime: time } })),
  setPlaybackSpeed: (speed) => set((s) => ({ time: { ...s.time, playbackSpeed: speed } })),
  togglePlay: () => set((s) => ({ time: { ...s.time, isPlaying: !s.time.isPlaying } })),
  quality: 'high',
  setQuality: (q) => set({ quality: q }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
  searchOpen: false,
  setSearchOpen: (open) => set({ searchOpen: open }),
  panelOpen: false,
  setPanelOpen: (open) => set({ panelOpen: open }),
  loadingProgress: 0,
  setLoadingProgress: (p) => set({ loadingProgress: p }),
  loadingComplete: false,
  setLoadingComplete: (v) => set({ loadingComplete: v }),
  overlayOpen: false,
  setOverlayOpen: (v) => set({ overlayOpen: v }),
}))
