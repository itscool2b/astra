import { Canvas } from '@react-three/fiber'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Suspense } from 'react'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})

export default function App() {
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
            <ambientLight intensity={0.02} />
          </Suspense>
        </Canvas>
      </div>
    </QueryClientProvider>
  )
}
