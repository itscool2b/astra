import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { PlanetPanel } from './panels/PlanetPanel'
import { EarthPanel } from './panels/EarthPanel'
import { MarsPanel } from './panels/MarsPanel'
import { SunPanel } from './panels/SunPanel'
import { DwarfPlanetPanel } from './panels/DwarfPlanetPanel'
import { MoonPanel } from './panels/MoonPanel'

export function DataPanel() {
  const selectedObject = useStore((s) => s.selectedObject)
  const panelOpen = useStore((s) => s.panelOpen)
  const selectObject = useStore((s) => s.selectObject)
  const isMobile = window.innerWidth <= 768

  return (
    <AnimatePresence>
      {panelOpen && selectedObject && (
        <motion.div
          initial={isMobile ? { y: '100%', opacity: 0 } : { x: 400, opacity: 0 }}
          animate={isMobile ? { y: 0, opacity: 1 } : { x: 0, opacity: 1 }}
          exit={isMobile ? { y: '100%', opacity: 0 } : { x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'absolute',
            ...(isMobile ? {
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: '60vh',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px 16px 0 0',
            } : {
              top: 0,
              right: 0,
              bottom: 0,
              width: 380,
              borderLeft: '1px solid rgba(255,255,255,0.06)',
            }),
            background: 'rgba(8,8,24,0.92)',
            backdropFilter: 'blur(20px)',
            overflowY: 'auto',
            zIndex: 20,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '24px 20px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'start',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 9,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: '#4a90d9',
                  marginBottom: 4,
                }}
              >
                {selectedObject.type.replace('-', ' ')}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{selectedObject.name}</div>
            </div>
            <button
              onClick={() => selectObject(null)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.06)',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
              }}
            >
              &#10005;
            </button>
          </div>

          {/* Panel content by type */}
          {selectedObject.type === 'planet' && selectedObject.id === 'earth' && <EarthPanel />}
          {selectedObject.type === 'planet' && selectedObject.id === 'mars' && <MarsPanel />}
          {selectedObject.type === 'planet' && !['earth', 'mars'].includes(selectedObject.id) && (
            <PlanetPanel id={selectedObject.id} />
          )}
          {selectedObject.type === 'star' && <SunPanel />}
          {selectedObject.type === 'moon' && <MoonPanel id={selectedObject.id} />}
          {selectedObject.type === 'dwarf-planet' && <DwarfPlanetPanel id={selectedObject.id} />}
          {selectedObject.type === 'asteroid' && (
            <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)' }}>Asteroid panel (coming soon)</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
