import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAPOD } from '../../api/hooks'
import { useStore } from '../../store/useStore'

export function APODCard() {
  const { data: apod, isLoading } = useAPOD()
  const [expanded, setExpanded] = useState(false)
  const loadingComplete = useStore((s) => s.loadingComplete)
  const autoExpandDone = useRef(false)

  // Auto-expand for 5 seconds after loading screen dismisses
  useEffect(() => {
    if (loadingComplete && apod && !autoExpandDone.current) {
      autoExpandDone.current = true
      // Small delay so the loading screen transition finishes
      const openTimer = setTimeout(() => setExpanded(true), 800)
      const closeTimer = setTimeout(() => setExpanded(false), 5800)
      return () => {
        clearTimeout(openTimer)
        clearTimeout(closeTimer)
      }
    }
  }, [loadingComplete, apod])

  if (isLoading || !apod) return null

  return (
    <>
      {/* Mini card */}
      <motion.div
        onClick={() => setExpanded(true)}
        style={{
          position: 'absolute',
          bottom: 120,
          left: 24,
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(12px)',
          borderRadius: 14,
          padding: 12,
          width: 280,
          cursor: 'pointer',
          zIndex: 10,
          pointerEvents: 'auto',
        }}
        animate={{
          borderColor: [
            'rgba(74,144,217,0.15)',
            'rgba(74,144,217,0.35)',
            'rgba(74,144,217,0.15)',
          ],
          borderWidth: '1px',
          borderStyle: 'solid',
        }}
        transition={{
          borderColor: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
        }}
        whileHover={{ scale: 1.02, borderColor: 'rgba(74,144,217,0.5)' }}
      >
        <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>
          Photo of the Day
        </div>
        {apod.media_type === 'image' && (
          <img
            src={apod.url}
            alt={apod.title}
            style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }}
          />
        )}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
          {apod.title}
        </div>
      </motion.div>

      {/* Expanded overlay */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(8px)',
              zIndex: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 40,
              cursor: 'pointer',
            }}
            onClick={() => setExpanded(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ maxWidth: 800, width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, color: '#4a90d9', marginBottom: 8 }}>
                Astronomy Picture of the Day — {apod.date}
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>{apod.title}</h2>
              {apod.media_type === 'image' && (
                <img
                  src={apod.hdurl || apod.url}
                  alt={apod.title}
                  style={{ width: '100%', borderRadius: 12, marginBottom: 16 }}
                />
              )}
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.7)' }}>
                {apod.explanation}
              </p>
              {apod.copyright && (
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 12 }}>
                  &copy; {apod.copyright}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
