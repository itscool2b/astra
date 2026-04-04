import { useMemo } from 'react'
import { useStore } from '../../store/useStore'

export function TimeSlider() {
  const time = useStore((s) => s.time)

  const dateStr = useMemo(() => {
    return time.currentTime.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [time.currentTime])

  const timeStr = useMemo(() => {
    return time.currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [time.currentTime])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 24px 16px',
        zIndex: 10,
        pointerEvents: 'none',
        background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.5) 100%)',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 12,
          color: 'rgba(255,255,255,0.5)',
          letterSpacing: 0.5,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#44cc88',
            boxShadow: '0 0 6px #44cc88',
            animation: 'livePulse 2s ease-in-out infinite',
          }}
        />
        <style>{`
          @keyframes livePulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 6px #44cc88; }
            50% { opacity: 0.4; box-shadow: 0 0 2px #44cc88; }
          }
        `}</style>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>LIVE</span>
        <span style={{ margin: '0 4px', opacity: 0.3 }}>|</span>
        <span>{dateStr}</span>
        <span style={{ opacity: 0.3 }}>{timeStr}</span>
      </div>
    </div>
  )
}
