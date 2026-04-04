import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { PlanetPanel } from './panels/PlanetPanel'
import { EarthPanel } from './panels/EarthPanel'
import { MarsPanel } from './panels/MarsPanel'
import { SunPanel } from './panels/SunPanel'

export function DataPanel() {
  const selectedObject = useStore((s) => s.selectedObject)
  const panelOpen = useStore((s) => s.panelOpen)
  const selectObject = useStore((s) => s.selectObject)

  return (
    <AnimatePresence>
      {panelOpen && selectedObject && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 380,
            background: 'rgba(8,8,24,0.92)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,255,255,0.06)',
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
          {selectedObject.type === 'moon' && (
            <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)' }}>Moon panel (coming soon)</div>
          )}
          {selectedObject.type === 'dwarf-planet' && (
            <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)' }}>Dwarf planet panel (coming soon)</div>
          )}
          {selectedObject.type === 'asteroid' && (
            <div style={{ padding: 20, color: 'rgba(255,255,255,0.5)' }}>Asteroid panel (coming soon)</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
