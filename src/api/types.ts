export interface APODData {
  date: string
  title: string
  explanation: string
  url: string
  hdurl?: string
  media_type: 'image' | 'video'
  copyright?: string
}

export interface NEOData {
  id: string
  name: string
  nasa_jpl_url: string
  absolute_magnitude_h: number
  estimated_diameter: {
    kilometers: { estimated_diameter_min: number; estimated_diameter_max: number }
  }
  is_potentially_hazardous_asteroid: boolean
  close_approach_data: CloseApproach[]
  orbital_data?: {
    orbit_id: string
    semi_major_axis: string
    eccentricity: string
    inclination: string
    ascending_node_longitude: string
    perihelion_argument: string
    mean_anomaly: string
    epoch_osculation: string
    orbital_period: string
  }
}

export interface CloseApproach {
  close_approach_date: string
  relative_velocity: { kilometers_per_hour: string }
  miss_distance: { kilometers: string; lunar: string }
  orbiting_body: string
}

export interface MarsRoverPhoto {
  id: number
  sol: number
  img_src: string
  earth_date: string
  camera: { name: string; full_name: string }
  rover: { name: string; status: string; landing_date: string; launch_date: string }
}

export interface EPICImage {
  identifier: string
  date: string
  caption: string
  image: string
  coords: { centroid_coordinates: { lat: number; lon: number } }
}

export interface DONKIEvent {
  messageType: string
  messageID: string
  messageURL: string
  messageIssueTime: string
  messageBody: string
}

export interface DONKICME {
  activityID: string
  startTime: string
  sourceLocation: string
  note: string
  instruments: { displayName: string }[]
}

export interface DONKIFlare {
  flrID: string
  beginTime: string
  peakTime: string
  endTime: string
  classType: string
  sourceLocation: string
}

export interface DONKIStorm {
  gstID: string
  startTime: string
  allKpIndex: { kpIndex: number; observedTime: string; source: string }[]
  linkedEvents: { activityID: string }[] | null
}

export interface DONKISEP {
  sepID: string
  eventTime: string
  instruments: { displayName: string }[]
  linkedEvents: { activityID: string }[] | null
}

export interface DONKIIPS {
  activityID: string
  eventTime: string
  location: string
  instruments: { displayName: string }[]
}

export interface EONETEvent {
  id: string
  title: string
  description: string
  categories: { id: string; title: string }[]
  sources: { id: string; url: string }[]
  geometry: { date: string; type: string; coordinates: [number, number] }[]
}

export interface ExoplanetData {
  pl_name: string
  hostname: string
  disc_year: number | null
  discoverymethod: string | null
  pl_orbper: number | null  // orbital period (days)
  pl_rade: number | null    // radius (Earth radii)
  pl_bmasse: number | null  // mass (Earth masses)
  pl_eqt: number | null     // equilibrium temperature (K)
  sy_dist: number | null    // distance (parsecs)
  pl_orbsmax: number | null // semi-major axis (AU)
  st_spectype: string | null // stellar spectral type
  st_teff: number | null    // stellar temperature (K)
}

export interface SpacecraftPosition {
  x: number  // AU, heliocentric
  y: number
  z: number
  vx: number // km/s
  vy: number
  vz: number
  speed: number // km/s
  name: string
}
