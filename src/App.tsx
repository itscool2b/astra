import { Canvas } from '@react-three/fiber'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Scene } from './components/canvas/Scene'
import { useTimeLoop } from './lib/useTimeLoop'
import { useAdaptiveQuality } from './lib/useAdaptiveQuality'
import { TopBar } from './components/ui/TopBar'
import { TimeSlider } from './components/ui/TimeSlider'
import { DataPanel } from './components/ui/DataPanel'
import { APODCard } from './components/ui/APODCard'
import { SpaceHUD } from './components/ui/SpaceHUD'
import { LoadingScreen } from './components/ui/LoadingScreen'

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

  return (
    <QueryClientProvider client={queryClient}>
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
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
        <TopBar />
        <TimeSlider />
        <DataPanel />
        <APODCard />
        <SpaceHUD />
        <LoadingScreen />
      </div>
    </QueryClientProvider>
  )
}
