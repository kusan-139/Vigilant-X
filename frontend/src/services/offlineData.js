// Built-in Offline Geographic Database for Shelters
// This allows the PWA to recommend shelters instantly even without internet

export const OFFLINE_SHELTERS = {
  maharashtra: {
    mumbai: [
      { name: "Mumbai Central Relief Camp", lat: 18.9690, lng: 72.8205, capacity: 500, type: "All-Purpose" },
      { name: "Andheri Sports Complex Shelter", lat: 19.1235, lng: 72.8361, capacity: 800, type: "Flood Relief" },
      { name: "Dharavi Community Hall", lat: 19.0402, lng: 72.8553, capacity: 300, type: "Emergency Medical" }
    ],
    pune: [
      { name: "Shivaji Nagar Evacuation Center", lat: 18.5314, lng: 73.8446, capacity: 400, type: "All-Purpose" },
      { name: "Kothrud Disaster Hub", lat: 18.5074, lng: 73.8077, capacity: 600, type: "Medical & Food" }
    ],
    nagpur: [
      { name: "Nagpur Central Shelter", lat: 21.1458, lng: 79.0882, capacity: 450, type: "All-Purpose" }
    ]
  },
  assam: {
    guwahati: [
      { name: "Dispur High School Relief Camp", lat: 26.1433, lng: 91.7898, capacity: 600, type: "Flood Relief" },
      { name: "Paltan Bazaar Community Center", lat: 26.1806, lng: 91.7533, capacity: 350, type: "All-Purpose" }
    ],
    silchar: [
      { name: "Silchar Flood Evacuation Hub", lat: 24.8333, lng: 92.7789, capacity: 500, type: "Flood Relief" }
    ]
  },
  "west bengal": {
    kolkata: [
      { name: "Salt Lake Stadium Shelter", lat: 22.5646, lng: 88.4095, capacity: 2000, type: "Cyclone Relief" },
      { name: "Howrah Indoor Stadium", lat: 22.5800, lng: 88.3297, capacity: 1000, type: "Flood Relief" }
    ],
    darjeeling: [
      { name: "Darjeeling Mall Road Safehouse", lat: 27.0377, lng: 88.2636, capacity: 250, type: "Landslide Relief" }
    ]
  },
  delhi: {
    "new delhi": [
      { name: "Pragati Maidan Emergency Center", lat: 28.6186, lng: 77.2435, capacity: 1500, type: "All-Purpose" },
      { name: "Dwarka Sector 10 Shelter", lat: 28.5833, lng: 77.0560, capacity: 700, type: "Fire/Medical" }
    ]
  },
  "tamil nadu": {
    chennai: [
      { name: "Marina Beach Community Center", lat: 13.0475, lng: 80.2824, capacity: 1200, type: "Cyclone Relief" },
      { name: "Velachery Flood Camp", lat: 12.9815, lng: 80.2180, capacity: 800, type: "Flood Relief" }
    ],
    coimbatore: [
      { name: "VOC Park Relief Center", lat: 11.0028, lng: 76.9669, capacity: 600, type: "All-Purpose" }
    ]
  },
  kerala: {
    kochi: [
      { name: "Kaloor Stadium Relief Hub", lat: 9.9961, lng: 76.3006, capacity: 1500, type: "Flood Relief" },
      { name: "Fort Kochi Safe Zone", lat: 9.9656, lng: 76.2421, capacity: 400, type: "Cyclone Relief" }
    ],
    thiruvananthapuram: [
      { name: "Central Stadium Camp", lat: 8.4960, lng: 76.9497, capacity: 800, type: "All-Purpose" }
    ]
  },
  gujarat: {
    ahmedabad: [
      { name: "Sardar Patel Stadium Shelter", lat: 23.0917, lng: 72.5973, capacity: 3000, type: "Earthquake/All-Purpose" },
      { name: "Maninagar Community Hall", lat: 22.9972, lng: 72.6033, capacity: 500, type: "Medical & Food" }
    ],
    surat: [
      { name: "Adajan Flood Relief Center", lat: 21.1959, lng: 72.7933, capacity: 1000, type: "Flood Relief" }
    ]
  }
};

/**
 * Parses user text to extract state and city, then returns matching shelters.
 */
export function extractLocationAndShelters(text) {
  if (!text) return null;
  const lowerText = text.toLowerCase();
  
  for (const [stateName, cities] of Object.entries(OFFLINE_SHELTERS)) {
    if (lowerText.includes(stateName)) {
      for (const [cityName, shelters] of Object.entries(cities)) {
        if (lowerText.includes(cityName)) {
          return { state: stateName, city: cityName, shelters };
        }
      }
      // If state matches but no specific city, return the first city's shelters as a generic fallback
      const firstCity = Object.keys(cities)[0];
      return { state: stateName, city: firstCity, shelters: cities[firstCity] };
    }
    
    // Check cities directly without state
    for (const [cityName, shelters] of Object.entries(cities)) {
      if (lowerText.includes(cityName)) {
        return { state: stateName, city: cityName, shelters };
      }
    }
  }
  
  return null;
}
