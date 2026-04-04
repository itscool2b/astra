import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../../store/useStore'

export function LoadingScreen() {
  const loadingComplete = useStore((s) => s.loadingComplete)
  const setLoadingComplete = useStore((s) => s.setLoadingComplete)

  // Auto-dismiss after 3 seconds (textures load in background)
  useEffect(() => {
    const timer = setTimeout(() => setLoadingComplete(true), 3000)
    return () => clearTimeout(timer)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {!loadingComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: '#000',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: 12, color: '#fff' }}>
              ASTRA
            </div>
          </motion.div>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: 200 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
            style={{
              height: 1,
              background: 'linear-gradient(90deg, transparent, #4a90d9, transparent)',
              marginTop: 40,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
