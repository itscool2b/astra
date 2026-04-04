import { useMemo } from 'react'
import { useEONET, useDONKIFlares, useNEOFeed } from '../../api/hooks'

function getCategoryIcon(categories: { id: string; title: string }[]): string {
  const title = (categories[0]?.title ?? '').toLowerCase()
  if (title.includes('wildfire') || title.includes('fire')) return '\uD83D\uDD25'
  if (title.includes('volcan')) return '\uD83C\uDF0B'
  if (title.includes('storm') || title.includes('cyclon') || title.includes('hurricane') || title.includes('typhoon')) return '\uD83C\uDF00'
  if (title.includes('ice') || title.includes('snow')) return '\u2744\uFE0F'
  if (title.includes('flood')) return '\uD83C\uDF0A'
  if (title.includes('earthquake')) return '\uD83D\uDCA5'
  if (title.includes('drought')) return '\u2600\uFE0F'
  return '\uD83C\uDF0D'
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'just now'
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getActivityLevel(flareCount: number): { label: string; color: string } {
  if (flareCount >= 5) return { label: 'STORM', color: '#ff4444' }
  if (flareCount >= 2) return { label: 'ACTIVE', color: '#ffaa00' }
  return { label: 'QUIET', color: '#44cc88' }
}

export function SpaceHUD() {
  const { data: eonetEvents } = useEONET()
  const { data: flares } = useDONKIFlares()
  const { data: neoData } = useNEOFeed()

  const tickerItems = useMemo(() => {
    const items: string[] = []

    // EONET events
    if (eonetEvents) {
      for (const evt of eonetEvents.slice(0, 8)) {
        const icon = getCategoryIcon(evt.categories)
        const category = evt.categories[0]?.title ?? 'Event'
        items.push(`${icon} ${category} \u2014 ${evt.title}`)
      }
    }

    // DONKI flares
    if (flares) {
      for (const flare of flares.slice(0, 5)) {
        items.push(`\u2600\uFE0F Solar Flare ${flare.classType} \u2014 ${timeAgo(flare.peakTime || flare.beginTime)}`)
      }
    }

    // NEO close approaches
    if (neoData?.near_earth_objects) {
      const allNeos = Object.values(neoData.near_earth_objects).flat()
      const sorted = allNeos
        .filter(n => n.close_approach_data.length > 0)
        .sort((a, b) => {
          const aLunar = parseFloat(a.close_approach_data[0].miss_distance.lunar)
          const bLunar = parseFloat(b.close_approach_data[0].miss_distance.lunar)
          return aLunar - bLunar
        })
        .slice(0, 5)

      for (const neo of sorted) {
        const ca = neo.close_approach_data[0]
        const lunarDist = parseFloat(ca.miss_distance.lunar).toFixed(1)
        const dateStr = ca.close_approach_date
        const hazard = neo.is_potentially_hazardous_asteroid ? ' \u26A0\uFE0F' : ''
        items.push(`\u2604\uFE0F ${neo.name}${hazard} \u2014 ${lunarDist} lunar dist \u2014 ${dateStr}`)
      }
    }

    return items
  }, [eonetEvents, flares, neoData])

  const activity = useMemo(() => {
    return getActivityLevel(flares?.length ?? 0)
  }, [flares])

  // Don't render if no data at all
  if (tickerItems.length === 0 && !flares) return null

  // Double the items for seamless loop
  const displayItems = tickerItems.length > 0 ? [...tickerItems, ...tickerItems] : ['Fetching live space data...']
  const tickerText = displayItems.join('    \u2502    ')

  return (
    <>
      {/* Bottom ticker bar, above the TimeSlider */}
      <div
        style={{
          position: 'absolute',
          bottom: 70,
          left: 0,
          right: 0,
          height: 28,
          background: 'rgba(0,0,0,0.6)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          overflow: 'hidden',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            whiteSpace: 'nowrap',
            fontSize: 11,
            color: 'rgba(255,255,255,0.55)',
            animation: `marquee ${Math.max(tickerItems.length * 5, 30)}s linear infinite`,
            paddingLeft: '100%',
          }}
        >
          {tickerText}
        </div>
      </div>

      {/* Space weather badge, top-right corner */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(10px)',
          border: `1px solid ${activity.color}33`,
          borderRadius: 20,
          padding: '5px 12px',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: activity.color,
            boxShadow: `0 0 6px ${activity.color}`,
          }}
        />
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1, color: activity.color }}>
          {activity.label}
        </span>
      </div>

      {/* Inline keyframes via style tag */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </>
  )
}
