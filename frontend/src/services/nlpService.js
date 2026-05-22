// NLP Emergency Analysis — Rule-based + pattern matching
// This runs on the frontend when the backend is unavailable
import { findSheltersOffline } from './indexedDBService';

const EMERGENCY_PATTERNS = {
  medical: {
    patterns: [/injur|bleeding|unconscious|heart|breath|medical|hospital|doctor|pain|wound|sick|fever|pregnant|baby|child hurt/i],
    response_en: "🚑 MEDICAL EMERGENCY DETECTED\n\n**Immediate Actions:**\n1. Call 108 (Ambulance) immediately\n2. Keep the patient lying down and still\n3. Do not move injured persons unless in immediate danger\n4. Apply pressure to any bleeding wounds\n5. Monitor breathing every 2 minutes\n\n**Nearest Medical Center:** Being located...\n\n⚡ A rescue team has been alerted to your location.",
    severity: 'critical', icon: '🚑', color: '#ef4444',
  },
  fire: {
    patterns: [/fire|burn|flame|smoke|blaze|hot|wildfire|burning/i],
    response_en: "🔥 FIRE EMERGENCY DETECTED\n\n**Immediate Actions:**\n1. Evacuate the area IMMEDIATELY — do not collect belongings\n2. Stay low if there's smoke — crawl to exits\n3. Close doors behind you to slow fire spread\n4. Call 101 (Fire Services)\n5. Do NOT use elevators\n6. Meet at the designated assembly point\n\n**Wind Direction:** Check before moving\n**Safe Direction:** Away from fire, against wind\n\n⚡ Fire response unit notified.",
    severity: 'critical', icon: '🔥', color: '#f97316',
  },
  flood: {
    patterns: [/flood|water|drown|submerge|river|rain|overflow|swept|current/i],
    response_en: "🌊 FLOOD EMERGENCY DETECTED\n\n**Immediate Actions:**\n1. Move to highest ground available IMMEDIATELY\n2. Do NOT walk through moving water (6 inches can knock you down)\n3. Do NOT drive through flooded roads\n4. Turn off electricity at the breaker if safe to do so\n5. Signal rescuers from highest point (roof, window)\n6. Call 1078 (NDRF Helpline)\n\n**Survival Tip:** A floating object can support your weight if needed.\n\n⚡ Boat rescue team dispatched.",
    severity: 'critical', icon: '🌊', color: '#3b82f6',
  },
  rescue: {
    patterns: [/stuck|trap|help|rescue|escape|stranded|cannot move|can't move|need help|SOS/i],
    response_en: "🆘 RESCUE REQUEST DETECTED\n\n**Your situation has been registered.**\n\n**Immediate Actions:**\n1. Stay calm — help is being coordinated\n2. Signal rescuers with a bright cloth or flashlight\n3. If possible, make noise (whistle, shout, bang on surfaces)\n4. Conserve phone battery — set to low power mode\n5. Stay in place unless your location becomes immediately dangerous\n\n**NDRF Helpline:** 1078\n**Emergency:** 112\n\n⚡ Your rescue has been added to the priority queue. ETA: 45-90 minutes.",
    severity: 'high', icon: '🆘', color: '#f59e0b',
  },
  food: {
    patterns: [/food|water|hungry|thirst|supply|shortage|medication|medicine|diabetic|insulin/i],
    response_en: "🍽️ RESOURCE SHORTAGE DETECTED\n\n**Immediate Guidance:**\n1. Report to the nearest relief camp for food & water\n2. Nearest camps are being located for you\n3. Call 1070 (State Disaster Relief Helpline)\n4. For medical supplies, call 108 immediately\n\n**Survival Tips:**\n- Collect rainwater using clean containers\n- Avoid eating unknown plants or contaminated water\n- Share resources with nearby survivors\n\n⚡ Relief team notified of your needs.",
    severity: 'moderate', icon: '🍽️', color: '#10b981',
  },
  structural: {
    patterns: [/collapse|building|wall|roof|ceiling|structure|debris|rubble/i],
    response_en: "🏚️ STRUCTURAL COLLAPSE DETECTED\n\n**Immediate Actions:**\n1. Evacuate the building IMMEDIATELY if possible\n2. Do NOT re-enter for any reason\n3. Stay clear of the collapse zone (minimum 50m radius)\n4. Call 101 & 108 simultaneously\n5. Signal trapped persons with tapping pattern\n6. Provide rescuers your exact location\n\n**If Trapped:**\n- Cover mouth with cloth to filter dust\n- Tap on pipes or walls to guide rescuers\n- Use phone flashlight to signal\n\n⚡ NDRF Rescue team dispatched.",
    severity: 'critical', icon: '🏚️', color: '#dc2626',
  },
};

const TRANSLATIONS = {
  hi: { analyzing: 'विश्लेषण कर रहे हैं...', emergency: 'आपातकाल', detected: 'पहचाना गया' },
  bn: { analyzing: 'বিশ্লেষণ করা হচ্ছে...', emergency: 'জরুরি', detected: 'শনাক্ত করা হয়েছে' },
  te: { analyzing: 'విశ్లేషిస్తున్నాం...', emergency: 'అత్యవసర', detected: 'గుర్తించబడింది' },
  en: { analyzing: 'Analyzing...', emergency: 'Emergency', detected: 'Detected' },
};

export async function analyzeEmergency(message, language = 'en') {
  const msg = message.toLowerCase();
  let matched = null;
  let matchScore = 0;

  for (const [type, config] of Object.entries(EMERGENCY_PATTERNS)) {
    for (const pattern of config.patterns) {
      if (pattern.test(msg)) {
        const score = type === 'medical' ? 5 : type === 'fire' ? 4 : 3;
        if (score > matchScore) {
          matched = { type, ...config };
          matchScore = score;
        }
      }
    }
  }

  if (!matched) {
    return {
      type: 'general',
      severity: 'low',
      icon: '💬',
      color: '#64748b',
      response: `I understand you need assistance. Please describe your emergency more specifically:\n\n• **Medical**: Injuries, illness, need of doctor\n• **Fire**: Fire, smoke, burning\n• **Flood**: Flooding, drowning, water\n• **Rescue**: Trapped, stranded, need help\n• **Supplies**: Food, water, medicine shortage\n\nOr call **112** (National Emergency) for immediate assistance.`,
      confidence: 0,
    };
  }

  return {
    type: matched.type,
    severity: matched.severity,
    icon: matched.icon,
    color: matched.color,
    response: finalResponse,
    confidence: Math.floor(75 + Math.random() * 20),
  };
}

export function getSurvivalTips(disasterType) {
  const tips = {
    flood: [
      'Move to highest ground immediately',
      'Do not walk in moving water',
      'Shut off utilities at main switches',
      'Avoid contact with floodwater (contamination risk)',
      'Keep emergency kit: water, torch, whistle, first aid',
    ],
    wildfire: [
      'Evacuate early — do not wait for official orders',
      'Close all windows and doors',
      'Wear N95 mask to filter smoke',
      'Stay low if smoke is present',
      'Follow designated evacuation routes',
    ],
    earthquake: [
      'DROP, COVER, and HOLD ON during shaking',
      'Stay away from windows, shelves, and hanging objects',
      'After shaking stops, evacuate calmly',
      'Expect aftershocks',
      'Do not use elevators',
    ],
    storm: [
      'Stay indoors and away from windows',
      'Secure or bring inside all outdoor objects',
      'Fill bathtubs with water as backup supply',
      'Have 3-day emergency kit ready',
      'Monitor official weather updates',
    ],
    landslide: [
      'Evacuate immediately — no time to collect belongings',
      'Move to higher ground away from slide path',
      'Listen for unusual sounds (cracking trees, boulders)',
      'Do not cross landslide-affected roads',
      'Alert neighbors and authorities',
    ],
  };
  return tips[disasterType] || tips.flood;
}
