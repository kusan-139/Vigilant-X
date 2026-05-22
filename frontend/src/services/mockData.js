// ─────────────────────────────────────────────────────────────
//  VIGILANT-X MOCK DATA — Realistic disaster scenarios for India
// ─────────────────────────────────────────────────────────────

export const mockDisasters = [
  {
    id: 'd1', type: 'flood', severity: 'critical',
    title: 'Severe Flooding — Assam Valley',
    description: 'Brahmaputra river overflow affecting 12 districts. 45,000 civilians displaced.',
    lat: 26.2006, lng: 92.9376, radius_km: 45,
    status: 'active', affected: 45000,
    reported_at: new Date(Date.now() - 3600000).toISOString(),
    source: 'gdacs', wind_speed: null, rainfall_mm: 280,
  },
  {
    id: 'd2', type: 'wildfire', severity: 'high',
    title: 'Forest Fire — Uttarakhand Hills',
    description: 'Wildfire spreading across 3,200 hectares. Wind-driven spread toward villages.',
    lat: 30.3165, lng: 78.0322, radius_km: 18,
    status: 'contained', affected: 8200,
    reported_at: new Date(Date.now() - 7200000).toISOString(),
    source: 'nasa_firms', wind_speed: 34, rainfall_mm: 0,
  },
  {
    id: 'd3', type: 'earthquake', severity: 'high',
    title: 'Earthquake M5.8 — Manipur',
    description: '5.8 magnitude earthquake. Several buildings damaged. Aftershocks expected.',
    lat: 24.6637, lng: 93.9063, radius_km: 30,
    status: 'active', affected: 12000,
    reported_at: new Date(Date.now() - 1800000).toISOString(),
    source: 'usgs', wind_speed: null, rainfall_mm: null,
  },
  {
    id: 'd4', type: 'storm', severity: 'moderate',
    title: 'Cyclone Biparjoy — Bay of Bengal',
    description: 'Cyclone approaching Odisha coast. Wind speeds 120 km/h. Evacuation ordered.',
    lat: 19.8135, lng: 85.8312, radius_km: 60,
    status: 'active', affected: 28000,
    reported_at: new Date(Date.now() - 5400000).toISOString(),
    source: 'gdacs', wind_speed: 120, rainfall_mm: 150,
  },
  {
    id: 'd5', type: 'landslide', severity: 'moderate',
    title: 'Landslide — NH-44 Himachal Pradesh',
    description: 'Major landslide blocking national highway. 2 vehicles buried. Rescue ongoing.',
    lat: 32.2432, lng: 77.1892, radius_km: 5,
    status: 'active', affected: 350,
    reported_at: new Date(Date.now() - 900000).toISOString(),
    source: 'user_report', wind_speed: null, rainfall_mm: 90,
  },
  {
    id: 'd6', type: 'flood', severity: 'low',
    title: 'Flash Flood — Kerala Backwaters',
    description: 'Localized flooding in low-lying areas after heavy rains.',
    lat: 9.4981, lng: 76.3388, radius_km: 12,
    status: 'contained', affected: 1800,
    reported_at: new Date(Date.now() - 14400000).toISOString(),
    source: 'user_report', wind_speed: null, rainfall_mm: 120,
  },
];

export const mockShelters = [
  {
    id: 's1', name: 'Guwahati Relief Camp Alpha',
    address: 'Nehru Stadium, Guwahati, Assam',
    lat: 26.1445, lng: 91.7362, capacity: 2000, current_occupancy: 1680,
    status: 'open', facilities: ['medical', 'food', 'water', 'power'],
    contact: '+91-361-2730000',
  },
  {
    id: 's2', name: 'Dibrugarh Emergency Shelter',
    address: 'District Sports Complex, Dibrugarh',
    lat: 27.4728, lng: 94.9120, capacity: 1200, current_occupancy: 1190,
    status: 'open', facilities: ['food', 'water'],
    contact: '+91-373-2324000',
  },
  {
    id: 's3', name: 'Dehradun Army Relief Center',
    address: 'FRI Campus, Dehradun, Uttarakhand',
    lat: 30.3752, lng: 78.0322, capacity: 800, current_occupancy: 340,
    status: 'open', facilities: ['medical', 'food', 'water', 'power'],
    contact: '+91-135-2754000',
  },
  {
    id: 's4', name: 'Imphal Red Cross Shelter',
    address: 'Red Cross Bhavan, Imphal, Manipur',
    lat: 24.8170, lng: 93.9368, capacity: 600, current_occupancy: 420,
    status: 'open', facilities: ['medical', 'food', 'water'],
    contact: '+91-385-2410000',
  },
  {
    id: 's5', name: 'Bhubaneswar Cyclone Shelter',
    address: 'Kalinga Stadium, Bhubaneswar, Odisha',
    lat: 20.2961, lng: 85.8245, capacity: 3000, current_occupancy: 2100,
    status: 'open', facilities: ['medical', 'food', 'water', 'power'],
    contact: '+91-674-2581000',
  },
  {
    id: 's6', name: 'Shimla Mountain Rescue Base',
    address: 'HP University Campus, Shimla',
    lat: 31.1048, lng: 77.1734, capacity: 400, current_occupancy: 95,
    status: 'open', facilities: ['medical', 'food', 'water'],
    contact: '+91-177-2625000',
  },
  {
    id: 's7', name: 'Thiruvananthapuram Flood Relief',
    address: 'Central Stadium, Thiruvananthapuram',
    lat: 8.5241, lng: 76.9366, capacity: 1500, current_occupancy: 600,
    status: 'open', facilities: ['medical', 'food', 'water', 'power'],
    contact: '+91-471-2518000',
  },
];

export const mockAlerts = [
  {
    id: 'a1', disaster_id: 'd1', severity: 'critical',
    title: '🚨 CRITICAL: Brahmaputra Overflow — Evacuate Immediately',
    message: 'All residents in zones A1-A7 of Assam must evacuate immediately. Water level rising at 2m/hour.',
    issued_at: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'a2', disaster_id: 'd2', severity: 'high',
    title: '🔥 Forest Fire Alert — Wind Shift Warning',
    message: 'Wind direction has shifted. Villages of Mana and Badrinath are now in fire path. Evacuate north.',
    issued_at: new Date(Date.now() - 1800000).toISOString(),
    expires_at: new Date(Date.now() + 43200000).toISOString(),
  },
  {
    id: 'a3', disaster_id: 'd3', severity: 'high',
    title: '🔴 Earthquake Aftershock Risk — Do Not Enter Buildings',
    message: 'M5.8 earthquake struck Manipur. Aftershocks M4.0+ expected. Stay outdoors in open areas.',
    issued_at: new Date(Date.now() - 1200000).toISOString(),
    expires_at: new Date(Date.now() + 21600000).toISOString(),
  },
  {
    id: 'a4', disaster_id: 'd4', severity: 'moderate',
    title: '🌀 Cyclone Warning — Odisha Coastal Belt',
    message: 'Cyclone landfall expected in 18 hours. Coastal communities evacuate to designated shelters.',
    issued_at: new Date(Date.now() - 7200000).toISOString(),
    expires_at: new Date(Date.now() + 72000000).toISOString(),
  },
  {
    id: 'a5', disaster_id: 'd5', severity: 'moderate',
    title: '⚠️ NH-44 Blocked — Use Alternate Route',
    message: 'National Highway 44 blocked near Rohtang Pass. Use alternate via Manali-Leh road.',
    issued_at: new Date(Date.now() - 600000).toISOString(),
    expires_at: new Date(Date.now() + 28800000).toISOString(),
  },
];

export const mockRescueRequests = [
  {
    id: 'r1', name: 'Raju Sharma', contact: '+91-98765-43210',
    lat: 26.2106, lng: 92.9100, situation: 'Stranded on rooftop with elderly parents. Need boat rescue.',
    emergency_type: 'rescue', priority_score: 92, status: 'pending',
    age_group: 'elderly', submitted_at: new Date(Date.now() - 1200000).toISOString(),
  },
  {
    id: 'r2', name: 'Priya Devi', contact: '+91-87654-32109',
    lat: 26.1950, lng: 92.8800, situation: 'Pregnant woman, water level at chest height. Immediate help needed.',
    emergency_type: 'medical', priority_score: 98, status: 'pending',
    age_group: 'adult', submitted_at: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: 'r3', name: 'Arun Gogoi', contact: '+91-76543-21098',
    lat: 30.3265, lng: 78.0150, situation: 'Trapped in burning area, fire spreading fast. 3 children with me.',
    emergency_type: 'fire', priority_score: 96, status: 'assigned',
    age_group: 'child', submitted_at: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'r4', name: 'Kumari Bala', contact: '+91-65432-10987',
    lat: 24.6700, lng: 93.9000, situation: 'Building partially collapsed. 2 injured. Need medical team.',
    emergency_type: 'medical', priority_score: 88, status: 'pending',
    age_group: 'adult', submitted_at: new Date(Date.now() - 900000).toISOString(),
  },
  {
    id: 'r5', name: 'Mohammed Ismail', contact: '+91-54321-09876',
    lat: 19.8200, lng: 85.8100, situation: 'Family of 6 needs evacuation. No transport available.',
    emergency_type: 'rescue', priority_score: 74, status: 'pending',
    age_group: 'adult', submitted_at: new Date(Date.now() - 2700000).toISOString(),
  },
];

export const mockWeatherData = {
  assam: { temp: 34, humidity: 92, wind_speed: 28, wind_dir: 'NE', condition: 'Heavy Rain', rainfall_mm: 280 },
  uttarakhand: { temp: 18, humidity: 28, wind_speed: 34, wind_dir: 'W', condition: 'Dry & Windy', rainfall_mm: 0 },
  manipur: { temp: 29, humidity: 75, wind_speed: 12, wind_dir: 'S', condition: 'Partly Cloudy', rainfall_mm: 20 },
  odisha: { temp: 31, humidity: 85, wind_speed: 120, wind_dir: 'SW', condition: 'Cyclonic Storm', rainfall_mm: 150 },
};

export const mockPredictions = {
  flood: {
    region: 'Assam',
    risk_level: 'critical',
    expansion_rate: '2.3 km/hour',
    predicted_extent_6h: 52,
    predicted_extent_12h: 67,
    predicted_extent_24h: 89,
    affected_population_24h: 95000,
    confidence: 87,
  },
  wildfire: {
    region: 'Uttarakhand',
    risk_level: 'high',
    spread_direction: 'Northeast',
    spread_speed: '1.8 km/hour',
    containment_probability: 34,
    threat_villages: ['Mana', 'Badrinath', 'Joshimath'],
    confidence: 79,
  },
  risk_zones: [
    { lat: 26.2, lng: 92.9, risk: 'critical', radius: 20000 },
    { lat: 30.3, lng: 78.0, risk: 'high', radius: 15000 },
    { lat: 24.6, lng: 93.9, risk: 'high', radius: 12000 },
    { lat: 19.8, lng: 85.8, risk: 'moderate', radius: 25000 },
    { lat: 32.2, lng: 77.2, risk: 'moderate', radius: 8000 },
  ],
};
