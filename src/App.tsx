import { Canvas } from '@react-three/fiber'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense, useState, useEffect } from 'react'
import { Scene } from './components/canvas/Scene'
import { useTimeLoop } from './lib/useTimeLoop'
import { useAdaptiveQuality } from './lib/useAdaptiveQuality'
import { TopBar } from './components/ui/TopBar'
import { TimeSlider } from './components/ui/TimeSlider'
import { DataPanel } from './components/ui/DataPanel'
import { APODCard } from './components/ui/APODCard'
import { CloseApproachWidget } from './components/ui/CloseApproachWidget'
import { SpaceHUD } from './components/ui/SpaceHUD'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { AboutPage } from './components/ui/AboutPage'
import { ExoplanetBrowser } from './components/ui/ExoplanetBrowser'
import { DSNStatus } from './components/ui/DSNStatus'
import { ComparisonView } from './components/ui/ComparisonView'
import { useKeyboardNav } from './lib/useKeyboardNav'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useStore } from './store/useStore'

function InteractionHint() {
  const loadingComplete = useStore((s) => s.loadingComplete)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!loadingComplete) return
    if (localStorage.getItem('astra-hint-shown')) return
    localStorage.setItem('astra-hint-shown', '1')
    setVisible(true)
    const timer = setTimeout(() => setVisible(false), 5000)
    return () => clearTimeout(timer)
  }, [loadingComplete])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        zIndex: 15,
        pointerEvents: 'none',
        transition: 'opacity 1s ease-out',
        opacity: visible ? 1 : 0,
      }}
    >
      <span
        style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          letterSpacing: 0.5,
        }}
      >
        Drag to orbit | Scroll to zoom | Click to select
      </span>
    </div>
  )
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
  useTimeLoop()
  useAdaptiveQuality()
  useKeyboardNav()
  const [aboutOpen, setAboutOpen] = useState(false)
  const [exoplanetsOpen, setExoplanetsOpen] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [compareInitialId, setCompareInitialId] = useState<string | undefined>()
  const setOverlayOpen = useStore((s) => s.setOverlayOpen)

  // Track whether any full-screen overlay is open (hides 3D labels)
  useEffect(() => {
    setOverlayOpen(aboutOpen || exoplanetsOpen || compareOpen)
  }, [aboutOpen, exoplanetsOpen, compareOpen, setOverlayOpen])

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent).detail as string
      setCompareInitialId(id)
      setCompareOpen(true)
    }
    window.addEventListener('open-compare', handler)
    return () => window.removeEventListener('open-compare', handler)
  }, [])

  return (
    <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }} className={aboutOpen || exoplanetsOpen || compareOpen ? 'overlay-active' : ''}>
        <Canvas
          gl={{
            antialias: false,
            logarithmicDepthBuffer: true,
            powerPreference: 'high-performance',
            alpha: false,
          }}
          camera={{ fov: 45, near: 0.001, far: 1e12, position: [0, 50, 150] }}
          dpr={[1, 2]}
          style={{ background: '#000' }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
        <TopBar onOpenAbout={() => setAboutOpen(true)} onOpenExoplanets={() => setExoplanetsOpen(true)} />
        <InteractionHint />
        <TimeSlider />
        <DataPanel />
        <APODCard />
        <CloseApproachWidget />
        <SpaceHUD />
        <DSNStatus />
        <LoadingScreen />
        <AboutPage open={aboutOpen} onClose={() => setAboutOpen(false)} />
        <ExoplanetBrowser open={exoplanetsOpen} onClose={() => setExoplanetsOpen(false)} />
        <ComparisonView open={compareOpen} onClose={() => setCompareOpen(false)} initialId={compareInitialId} />
      </div>
    </QueryClientProvider>
    </ErrorBoundary>
  )
}
