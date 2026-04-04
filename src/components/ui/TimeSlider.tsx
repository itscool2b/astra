import { useCallback, useMemo } from 'react'
import { useStore } from '../../store/useStore'

const MIN_YEAR = 1900
const MAX_YEAR = 2100
const MIN_TIME = new Date(MIN_YEAR, 0, 1).getTime()
const MAX_TIME = new Date(MAX_YEAR, 11, 31).getTime()

const SPEED_LABELS: Record<number, string> = {
  1: '1x',
  86400: '1 day/s',
  2592000: '1 mo/s',
  31557600: '1 yr/s',
  [-1]: '-1x',
  [-86400]: '-1 day/s',
  [-2592000]: '-1 mo/s',
  [-31557600]: '-1 yr/s',
}

export function TimeSlider() {
  const time = useStore((s) => s.time)
  const setTime = useStore((s) => s.setTime)
  const togglePlay = useStore((s) => s.togglePlay)
  const setPlaybackSpeed = useStore((s) => s.setPlaybackSpeed)

  const progress = useMemo(() => {
    return (time.currentTime.getTime() - MIN_TIME) / (MAX_TIME - MIN_TIME)
  }, [time.currentTime])

  const dateStr = useMemo(() => {
    return time.currentTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }, [time.currentTime])

  const speedLabel = SPEED_LABELS[time.playbackSpeed] || `${time.playbackSpeed}x`

  const handleScrub = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const t = parseFloat(e.target.value)
      const ms = MIN_TIME + t * (MAX_TIME - MIN_TIME)
      setTime(new Date(ms))
    },
    [setTime]
  )

  const handleRewind = useCallback(() => {
    setPlaybackSpeed(-Math.abs(time.playbackSpeed))
    if (!time.isPlaying) togglePlay()
  }, [time.playbackSpeed, time.isPlaying, setPlaybackSpeed, togglePlay])

  const handleFastForward = useCallback(() => {
    setPlaybackSpeed(Math.abs(time.playbackSpeed))
    if (!time.isPlaying) togglePlay()
  }, [time.playbackSpeed, time.isPlaying, setPlaybackSpeed, togglePlay])

  const cycleSpeed = useCallback(() => {
    const presets = time.speedPresets
    const absSpeed = Math.abs(time.playbackSpeed)
    const idx = presets.indexOf(absSpeed)
    const nextIdx = (idx + 1) % presets.length
    const sign = time.playbackSpeed < 0 ? -1 : 1
    setPlaybackSpeed(presets[nextIdx] * sign)
  }, [time.playbackSpeed, time.speedPresets, setPlaybackSpeed])

  const btnStyle: React.CSSProperties = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    color: 'rgba(255,255,255,0.7)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    transition: 'background 0.15s',
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px 20px',
        zIndex: 10,
        pointerEvents: 'none',
        background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.5) 100%)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          pointerEvents: 'auto',
        }}
      >
        {/* Transport controls */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <button style={btnStyle} onClick={handleRewind} title="Rewind">
            &#9194;
          </button>
          <button
            style={{ ...btnStyle, width: 36, height: 36, fontSize: 14 }}
            onClick={togglePlay}
            title={time.isPlaying ? 'Pause' : 'Play'}
          >
            {time.isPlaying ? '\u23F8' : '\u25B6'}
          </button>
          <button style={btnStyle} onClick={handleFastForward} title="Fast Forward">
            &#9193;
          </button>
        </div>

        {/* Scrub bar */}
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.0001}
            value={progress}
            onChange={handleScrub}
            style={{
              width: '100%',
              height: 3,
              appearance: 'none',
              background: `linear-gradient(to right, #4a90d9 ${progress * 100}%, rgba(255,255,255,0.1) ${progress * 100}%)`,
              borderRadius: 2,
              cursor: 'pointer',
              outline: 'none',
            }}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 6,
              fontSize: 10,
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            <span>1900</span>
            <span>1950</span>
            <span>2000</span>
            <span>2050</span>
            <span>2100</span>
          </div>
        </div>

        {/* Date + speed */}
        <div style={{ minWidth: 160, textAlign: 'right' }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)' }}>
            {dateStr}
          </div>
          <button
            onClick={cycleSpeed}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 11,
              cursor: 'pointer',
              padding: 0,
              marginTop: 2,
            }}
            title="Click to cycle speed"
          >
            {speedLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
