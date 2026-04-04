import { motion, AnimatePresence } from 'framer-motion'

interface AboutPageProps {
  open: boolean
  onClose: () => void
}

const DATA_SOURCES = [
  {
    name: 'APOD',
    fullName: 'Astronomy Picture of the Day',
    url: 'https://api.nasa.gov',
    description:
      'Every day, NASA publishes a stunning astronomy photograph with an expert explanation. ASTRA shows today\'s APOD on the main screen and lets you expand it to read the full story.',
    updates: 'Daily',
    where: 'Bottom-left card on the main view. Click to expand.',
  },
  {
    name: 'NEO',
    fullName: 'Near Earth Object Web Service',
    url: 'https://api.nasa.gov',
    description:
      'Tracks every asteroid that comes close to Earth. ASTRA fetches the next 7 days of close approaches and plots tracked asteroids directly in the 3D scene — red for potentially hazardous, yellow for safe passes.',
    updates: 'Every hour',
    where: 'Glowing dots in the 3D scene + live ticker at the bottom.',
  },
  {
    name: 'EPIC',
    fullName: 'Earth Polychromatic Imaging Camera',
    url: 'https://epic.gsfc.nasa.gov',
    description:
      'A camera aboard the DSCOVR spacecraft at the L1 Lagrange point (1.5 million km away) takes full-disc photographs of Earth every few hours. ASTRA shows the latest EPIC image when you click on Earth.',
    updates: 'Every 6 hours',
    where: 'Click Earth → "Latest Satellite Image" section in the data panel.',
  },
  {
    name: 'DONKI',
    fullName: 'Space Weather Database of Notifications',
    url: 'https://api.nasa.gov',
    description:
      'Monitors solar activity including Coronal Mass Ejections (CMEs), solar flares, geomagnetic storms, and solar energetic particles. ASTRA classifies flares by X-ray intensity (X, M, C classes) and shows them when you click the Sun.',
    updates: 'Every 30 minutes',
    where: 'Click the Sun → "Recent Solar Flares" and "Recent CMEs". Also feeds the space weather badge and live ticker.',
  },
  {
    name: 'EONET',
    fullName: 'Earth Observatory Natural Event Tracker',
    url: 'https://eonet.gsfc.nasa.gov',
    description:
      'Tracks active natural events worldwide — wildfires, volcanic eruptions, severe storms, floods, icebergs, earthquakes, and more. ASTRA shows these as colored dots on Earth\'s surface and lists them in the Earth data panel.',
    updates: 'Every hour',
    where: 'Click Earth → "Active Natural Events" list. Also visible as glowing markers on the 3D globe and in the live ticker.',
  },
  {
    name: 'NASA Image Library',
    fullName: 'NASA Image and Video Library',
    url: 'https://images.nasa.gov',
    description:
      'NASA\'s searchable archive of hundreds of thousands of space images. ASTRA uses this to show real Mars rover surface photos, and can pull images for any celestial body.',
    updates: 'On demand',
    where: 'Click Mars → "Mars Surface Photos" gallery.',
  },
]

const CONTROLS = [
  { action: 'Orbit / Rotate', desktop: 'Click + drag', mobile: 'One finger drag' },
  { action: 'Zoom', desktop: 'Scroll wheel', mobile: 'Pinch' },
  { action: 'Pan', desktop: 'Right-click + drag', mobile: 'Two finger drag' },
  { action: 'Select object', desktop: 'Click on a planet/moon/asteroid', mobile: 'Tap' },
  { action: 'Fly to object', desktop: 'Click or search', mobile: 'Tap or search' },
  { action: 'Search', desktop: 'Press / or click search bar', mobile: 'Tap search bar' },
  { action: 'Close panel', desktop: 'Click X or click empty space', mobile: 'Tap X or swipe down' },
]

const OBJECTS = [
  { type: 'Star', count: 1, examples: 'The Sun' },
  { type: 'Planets', count: 8, examples: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune' },
  { type: 'Dwarf Planets', count: 5, examples: 'Pluto, Ceres, Eris, Haumea, Makemake' },
  { type: 'Moons', count: 20, examples: 'Moon, Io, Europa, Titan, Triton, Charon, and more' },
  { type: 'Asteroid Belt', count: 3000, examples: 'Procedural rocks between Mars and Jupiter' },
  { type: 'NEO Asteroids', count: 'Live', examples: 'Real tracked near-Earth objects from NASA' },
]

export function AboutPage({ open, onClose }: AboutPageProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 200,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(12px)',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 20,
              right: 24,
              zIndex: 210,
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: 18,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            ✕
          </button>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              maxWidth: 720,
              margin: '0 auto',
              padding: '60px 24px 80px',
            }}
          >
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: 60 }}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  letterSpacing: 12,
                  color: '#fff',
                  marginBottom: 12,
                }}
              >
                ASTRA
              </div>
              <div
                style={{
                  fontSize: 14,
                  letterSpacing: 3,
                  color: 'rgba(255,255,255,0.4)',
                  textTransform: 'uppercase',
                  marginBottom: 24,
                }}
              >
                Interactive 3D Solar System Explorer
              </div>
              <div
                style={{
                  width: 60,
                  height: 1,
                  background: 'linear-gradient(90deg, transparent, #4a90d9, transparent)',
                  margin: '0 auto 24px',
                }}
              />
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.8,
                  color: 'rgba(255,255,255,0.65)',
                  maxWidth: 560,
                  margin: '0 auto',
                }}
              >
                ASTRA is a real-time, interactive 3D model of our solar system powered by live
                NASA data. Every planet, moon, and asteroid is clickable. Orbital positions are
                mathematically computed. Space weather, Earth events, and rover photos update
                continuously from NASA's public APIs.
              </p>
            </div>

            {/* What's in the scene */}
            <Section title="What's in the Scene">
              <p style={styles.paragraph}>
                The 3D scene contains every major object in our solar system, rendered with real
                NASA texture maps and physically-based lighting. The Sun is the sole light source
                — the dark side of every planet is truly dark.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
                {OBJECTS.map((obj) => (
                  <div
                    key={obj.type}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>
                        {obj.type}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'rgba(255,255,255,0.35)',
                          marginLeft: 8,
                        }}
                      >
                        {obj.examples}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#4a90d9',
                        background: 'rgba(74,144,217,0.1)',
                        padding: '2px 8px',
                        borderRadius: 10,
                      }}
                    >
                      {typeof obj.count === 'number' ? obj.count.toLocaleString() : obj.count}
                    </span>
                  </div>
                ))}
              </div>
            </Section>

            {/* How orbital positions work */}
            <Section title="How Orbital Positions Work">
              <p style={styles.paragraph}>
                Planet and moon positions are not pre-recorded animations. They're computed in
                real-time using <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Keplerian orbital mechanics</strong> — the
                same math used in actual spaceflight. Each body has 6 orbital parameters (semi-major
                axis, eccentricity, inclination, longitude of ascending node, argument of perihelion,
                and mean anomaly at epoch) from the J2000 reference frame.
              </p>
              <p style={styles.paragraph}>
                Every frame, the app solves <strong style={{ color: 'rgba(255,255,255,0.85)' }}>Kepler's equation</strong> using
                Newton-Raphson iteration to compute each body's exact position at the current time.
                This means the time slider (1900–2100) shows where planets actually were or will be.
              </p>
              <div style={styles.infoBox}>
                <strong>Scale modes:</strong> In <em>Compressed</em> mode, distances are logarithmically
                scaled so all planets fit on screen. In <em>Realistic</em> mode, true proportional
                distances are used — planets become tiny dots, and you need to fly to them. Toggle
                with the button in the top-right.
              </div>
            </Section>

            {/* Controls */}
            <Section title="Controls">
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Action</th>
                      <th style={styles.th}>Desktop</th>
                      <th style={styles.th}>Mobile</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONTROLS.map((c) => (
                      <tr key={c.action}>
                        <td style={styles.td}>{c.action}</td>
                        <td style={{ ...styles.td, color: 'rgba(255,255,255,0.6)' }}>{c.desktop}</td>
                        <td style={{ ...styles.td, color: 'rgba(255,255,255,0.6)' }}>{c.mobile}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* Live time */}
            <Section title="Real-Time Positions">
              <p style={styles.paragraph}>
                All orbital positions are computed for the current date and time. The bottom bar
                shows a live indicator with today's date. Planet positions update continuously
                as the Earth rotates.
              </p>
            </Section>

            {/* Live data sources */}
            <Section title="Live NASA Data Sources">
              <p style={styles.paragraph}>
                ASTRA pulls live data from 6 NASA API endpoints. All requests are proxied through
                a caching layer to stay within rate limits. Data refreshes automatically at the
                intervals shown below.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                {DATA_SOURCES.map((source) => (
                  <div
                    key={source.name}
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 10,
                      padding: '16px 18px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <div>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#4a90d9' }}>
                          {source.name}
                        </span>
                        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>
                          {source.fullName}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: 10,
                          color: 'rgba(255,255,255,0.4)',
                          background: 'rgba(255,255,255,0.05)',
                          padding: '2px 8px',
                          borderRadius: 8,
                        }}
                      >
                        {source.updates}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
                      {source.description}
                    </p>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                      <strong style={{ color: 'rgba(255,255,255,0.5)' }}>Where to find it:</strong>{' '}
                      {source.where}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Live ticker */}
            <Section title="The Live Ticker">
              <p style={styles.paragraph}>
                The scrolling bar above the time controls combines three live data feeds into a
                single stream:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
                <div style={styles.tickerItem}>
                  <span style={{ fontSize: 16 }}>🔥</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                      Earth Events (EONET)
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      Active wildfires, volcanoes, storms, floods, icebergs
                    </div>
                  </div>
                </div>
                <div style={styles.tickerItem}>
                  <span style={{ fontSize: 16 }}>☀️</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                      Solar Flares (DONKI)
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      Recent X-ray flare classifications and timing
                    </div>
                  </div>
                </div>
                <div style={styles.tickerItem}>
                  <span style={{ fontSize: 16 }}>☄️</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>
                      Near-Earth Asteroids (NEO)
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                      Closest upcoming asteroid passes with distance in lunar units
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* Space weather badge */}
            <Section title="Space Weather Badge">
              <p style={styles.paragraph}>
                The badge in the top-right corner shows current solar activity based on the number
                of solar flares detected in the last 30 days:
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                {[
                  { label: 'QUIET', color: '#44cc88', desc: '0–1 flares' },
                  { label: 'ACTIVE', color: '#ffaa00', desc: '2–4 flares' },
                  { label: 'STORM', color: '#ff4444', desc: '5+ flares' },
                ].map((level) => (
                  <div
                    key={level.label}
                    style={{
                      flex: 1,
                      textAlign: 'center',
                      padding: '12px 8px',
                      background: 'rgba(255,255,255,0.02)',
                      border: `1px solid ${level.color}30`,
                      borderRadius: 8,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: level.color,
                        boxShadow: `0 0 8px ${level.color}`,
                        margin: '0 auto 6px',
                      }}
                    />
                    <div style={{ fontSize: 11, fontWeight: 700, color: level.color, letterSpacing: 1 }}>
                      {level.label}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                      {level.desc}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Rendering */}
            <Section title="Rendering & Visual Effects">
              <p style={styles.paragraph}>
                The 3D scene uses Three.js via react-three-fiber with a cinematic post-processing
                pipeline:
              </p>
              <ul style={styles.list}>
                <li><strong style={styles.strong}>Planet textures</strong> — 2K NASA surface maps for all planets, with normal mapping for terrain detail</li>
                <li><strong style={styles.strong}>Atmosphere shaders</strong> — Custom GLSL Rayleigh scattering simulation on planets with atmospheres</li>
                <li><strong style={styles.strong}>Sun</strong> — Custom volumetric glow shader with animated FBM noise + billboard corona</li>
                <li><strong style={styles.strong}>Saturn's rings</strong> — Procedural texture with the Cassini Division gap</li>
                <li><strong style={styles.strong}>Earth's clouds</strong> — Separate rotating cloud layer over the surface</li>
                <li><strong style={styles.strong}>Bloom</strong> — HDR glow on the Sun and atmosphere edges</li>
                <li><strong style={styles.strong}>ACES Filmic tone mapping</strong> — Hollywood color science for deep blacks and rich highlights</li>
                <li><strong style={styles.strong}>Chromatic aberration</strong> — Subtle lens effect at screen edges</li>
                <li><strong style={styles.strong}>Film grain + vignette</strong> — Cinematic finish</li>
                <li><strong style={styles.strong}>Logarithmic depth buffer</strong> — Handles the enormous scale from Sun surface to Kuiper Belt</li>
              </ul>
            </Section>

            {/* Adaptive quality */}
            <Section title="Performance">
              <p style={styles.paragraph}>
                ASTRA automatically detects your device and adjusts visual quality:
              </p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                {[
                  { tier: 'High', desc: 'Discrete GPU — full effects, 8K textures', color: '#44cc88' },
                  { tier: 'Medium', desc: 'Integrated GPU — reduced bloom, 4K textures', color: '#ffaa00' },
                  { tier: 'Low', desc: 'Mobile — simplified shaders, 2K textures', color: '#ff8c5a' },
                ].map((t) => (
                  <div
                    key={t.tier}
                    style={{
                      flex: 1,
                      minWidth: 180,
                      padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 8,
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: t.color }}>{t.tier}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
              <p style={{ ...styles.paragraph, marginTop: 12 }}>
                If FPS drops below 25, quality automatically downgrades. If FPS stays above 55,
                it upgrades. Works on desktop and mobile.
              </p>
            </Section>

            {/* Credits */}
            <Section title="Credits & Data Sources">
              <ul style={styles.list}>
                <li>Planetary data: NASA Jet Propulsion Laboratory</li>
                <li>Orbital elements: J2000 epoch reference frame</li>
                <li>Planet textures: Solar System Scope (CC BY 4.0)</li>
                <li>APIs: NASA Open APIs (api.nasa.gov), EPIC, EONET, JPL</li>
                <li>3D Engine: Three.js + react-three-fiber</li>
              </ul>
              <p style={{ ...styles.paragraph, marginTop: 16, fontSize: 11 }}>
                All NASA data is public domain. Texture maps are used under Creative Commons
                Attribution 4.0.
              </p>
            </Section>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'rgba(255,255,255,0.9)',
          marginBottom: 16,
          paddingBottom: 8,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {title}
      </h2>
      {children}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  paragraph: {
    fontSize: 13,
    lineHeight: 1.8,
    color: 'rgba(255,255,255,0.55)',
  },
  strong: {
    color: 'rgba(255,255,255,0.8)',
  },
  list: {
    marginTop: 12,
    paddingLeft: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    fontSize: 13,
    lineHeight: 1.6,
    color: 'rgba(255,255,255,0.55)',
  },
  infoBox: {
    marginTop: 16,
    padding: '14px 16px',
    background: 'rgba(74,144,217,0.06)',
    border: '1px solid rgba(74,144,217,0.15)',
    borderRadius: 8,
    fontSize: 12,
    lineHeight: 1.7,
    color: 'rgba(255,255,255,0.6)',
  },
  th: {
    textAlign: 'left' as const,
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    fontWeight: 600,
  },
  td: {
    padding: '8px 12px',
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    color: 'rgba(255,255,255,0.75)',
  },
  tickerItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: 8,
  },
}
