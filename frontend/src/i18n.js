import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: { dashboard: "Command Dashboard", map: "Live Threat Map", emergency: "Emergency Response", shelters: "Shelter Network", predictions: "AI Predictions", reports: "Incident Reports", navigation: "Navigation" },
      status: { online: "SYS ONLINE", offline: "OFFLINE MODE", activeIncidents: "Active Incidents", critical: "CRITICAL", language: "Interface Language" },
      map: { title: "LIVE THREAT MAP", realtime: "REAL-TIME", layers: "LAYERS", incidents: "INCIDENTS", heatmap: "HEAT ZONES", shelters: "SHELTERS", evac: "EVAC ROUTES", satellite: "SATELLITE", wind: "WIND", rain: "RAIN", temp: "TEMP", legend: "MAP LEGEND" },
      dashboard: {
        activeDisasters: "Active Disasters", nationwide: "Nationwide monitoring", civiliansAffected: "Civilians Affected", needsAssistance: "Needs assistance",
        sheltersActive: "Shelters Active", sheltered: "sheltered", rescuePending: "Rescue Pending", aiQueue: "AI-prioritized queue",
        criticalAlerts: "Critical Alerts", broadcasting: "Broadcasting active", activeAlerts: "ACTIVE ALERTS", total: "TOTAL",
        shelterStatus: "SHELTER STATUS", capacity: "CAPACITY", totalSheltered: "total", allShelters: "All Shelters",
        rescueQueue: "RESCUE QUEUE", pending: "PENDING", incidentRegister: "ACTIVE INCIDENT REGISTER", incidentsRecorded: "incidents recorded",
        headers: { incident: "Incident", type: "Type", severity: "Severity", affected: "Affected", coordinates: "Coordinates", source: "Source", reported: "Reported" }
      },
      enums: {
        severity: { critical: "Critical", high: "High", moderate: "Moderate", low: "Low" },
        type: { flood: "Flood", wildfire: "Wildfire", earthquake: "Earthquake", storm: "Storm", landslide: "Landslide" },
        shelter: { open: "OPEN", crowded: "CROWDED", full: "FULL" }
      },
      disasters: {
        flood_title: "Severe Flooding — Assam Valley", flood_desc: "Brahmaputra river overflow affecting 12 districts. 45,000 civilians displaced.",
        wildfire_title: "Forest Fire — Uttarakhand Hills", wildfire_desc: "Wildfire spreading across 3,200 hectares. Wind-driven spread toward villages.",
        earthquake_title: "Earthquake M5.8 — Manipur", earthquake_desc: "5.8 magnitude earthquake. Several buildings damaged. Aftershocks expected.",
        storm_title: "Cyclone Biparjoy — Bay of Bengal", storm_desc: "Cyclone approaching Odisha coast. Wind speeds 120 km/h. Evacuation ordered.",
        landslide_title: "Landslide — NH-44 Himachal Pradesh", landslide_desc: "Major landslide blocking national highway. 2 vehicles buried. Rescue ongoing."
      },
      alerts: {
        a1_title: "🚨 CRITICAL: Brahmaputra Overflow — Evacuate Immediately", a1_msg: "All residents in zones A1-A7 of Assam must evacuate immediately. Water level rising at 2m/hour.",
        a2_title: "🔥 Forest Fire Alert — Wind Shift Warning", a2_msg: "Wind direction has shifted. Villages of Mana and Badrinath are now in fire path. Evacuate north.",
        a3_title: "🔴 Earthquake Aftershock Risk — Do Not Enter Buildings", a3_msg: "M5.8 earthquake struck Manipur. Aftershocks M4.0+ expected. Stay outdoors in open areas.",
        a4_title: "🌀 Cyclone Warning — Odisha Coastal Belt", a4_msg: "Cyclone landfall expected in 18 hours. Coastal communities evacuate to designated shelters.",
        a5_title: "⚠️ NH-44 Blocked — Use Alternate Route", a5_msg: "National Highway 44 blocked near Rohtang Pass. Use alternate via Manali-Leh road."
      },
      shelters: {
        s1: "Guwahati Relief Camp Alpha", s2: "Dibrugarh Emergency Shelter", s3: "Dehradun Army Relief Center",
        s4: "Imphal Red Cross Shelter", s5: "Bhubaneswar Cyclone Shelter", s6: "Shimla Mountain Rescue Base", s7: "Thiruvananthapuram Flood Relief"
      },
      rescues: {
        r1: "Stranded on rooftop with elderly parents. Need boat rescue.", r2: "Pregnant woman, water level at chest height. Immediate help needed.",
        r3: "Trapped in burning area, fire spreading fast. 3 children with me.", r4: "Building partially collapsed. 2 injured. Need medical team.",
        r5: "Family of 6 needs evacuation. No transport available."
      }
    }
  },
  hi: {
    translation: {
      nav: { dashboard: "कमांड डैशबोर्ड", map: "लाइव थ्रेट मैप", emergency: "आपातकालीन प्रतिक्रिया", shelters: "आश्रय नेटवर्क", predictions: "AI भविष्यवाणियां", reports: "घटना रिपोर्ट", navigation: "नेविगेशन" },
      status: { online: "सिस्टम ऑनलाइन", offline: "ऑफ़लाइन मोड", activeIncidents: "सक्रिय घटनाएं", critical: "गंभीर", language: "इंटरफ़ेस भाषा" },
      map: { title: "लाइव थ्रेट मैप", realtime: "रीयल-टाइम", layers: "परतें (LAYERS)", incidents: "घटनाएं", heatmap: "हीट ज़ोन", shelters: "आश्रय", evac: "निकासी मार्ग", satellite: "सैटेलाइट", wind: "हवा", rain: "बारिश", temp: "तापमान", legend: "मैप लीजेंड" },
      dashboard: {
        activeDisasters: "सक्रिय आपदाएं", nationwide: "राष्ट्रव्यापी निगरानी", civiliansAffected: "प्रभावित नागरिक", needsAssistance: "सहायता की आवश्यकता है",
        sheltersActive: "सक्रिय आश्रय", sheltered: "आश्रय प्राप्त", rescuePending: "लंबित बचाव", aiQueue: "AI-प्राथमिकता कतार",
        criticalAlerts: "गंभीर अलर्ट", broadcasting: "प्रसारण सक्रिय", activeAlerts: "सक्रिय अलर्ट", total: "कुल",
        shelterStatus: "आश्रय स्थिति", capacity: "क्षमता", totalSheltered: "कुल", allShelters: "सभी आश्रय",
        rescueQueue: "बचाव कतार", pending: "लंबित", incidentRegister: "सक्रिय घटना रजिस्टर", incidentsRecorded: "दर्ज घटनाएं",
        headers: { incident: "घटना", type: "प्रकार", severity: "गंभीरता", affected: "प्रभावित", coordinates: "निर्देशांक", source: "स्रोत", reported: "दर्ज की गई" }
      },
      enums: {
        severity: { critical: "गंभीर", high: "उच्च", moderate: "मध्यम", low: "कम" },
        type: { flood: "बाढ़", wildfire: "जंगल की आग", earthquake: "भूकंप", storm: "तूफान", landslide: "भूस्खलन" },
        shelter: { open: "खुला", crowded: "भीड़भाड़", full: "पूर्ण" }
      },
      disasters: {
        flood_title: "गंभीर बाढ़ — असम घाटी", flood_desc: "ब्रह्मपुत्र नदी के उफान से 12 जिले प्रभावित। 45,000 नागरिक विस्थापित।",
        wildfire_title: "जंगल की आग — उत्तराखंड हिल्स", wildfire_desc: "3,200 हेक्टेयर में फैली जंगल की आग। हवा के कारण गांवों की ओर फैल रही है।",
        earthquake_title: "भूकंप M5.8 — मणिपुर", earthquake_desc: "5.8 तीव्रता का भूकंप। कई इमारतें क्षतिग्रस्त। आफ्टरशॉक्स की उम्मीद है।",
        storm_title: "चक्रवात बिपारजॉय — बंगाल की खाड़ी", storm_desc: "चक्रवात ओडिशा तट के करीब आ रहा है। हवा की गति 120 किमी/घंटा। निकासी का आदेश।",
        landslide_title: "भूस्खलन — NH-44 हिमाचल प्रदेश", landslide_desc: "बड़े भूस्खलन ने राष्ट्रीय राजमार्ग को अवरुद्ध कर दिया। 2 वाहन दबे। बचाव कार्य जारी।"
      },
      alerts: {
        a1_title: "🚨 गंभीर: ब्रह्मपुत्र उफान — तुरंत खाली करें", a1_msg: "असम के A1-A7 जोन के सभी निवासी तुरंत खाली करें। जल स्तर 2m/घंटा बढ़ रहा है।",
        a2_title: "🔥 जंगल की आग चेतावनी — हवा की दिशा में बदलाव", a2_msg: "हवा की दिशा बदल गई है। माणा और बद्रीनाथ गांव आग की चपेट में हैं। उत्तर की ओर खाली करें।",
        a3_title: "🔴 भूकंप के झटके का जोखिम — इमारतों में प्रवेश न करें", a3_msg: "मणिपुर में M5.8 का भूकंप आया। M4.0+ झटके आने की उम्मीद है। खुले क्षेत्रों में बाहर रहें।",
        a4_title: "🌀 चक्रवात चेतावनी — ओडिशा तटीय क्षेत्र", a4_msg: "18 घंटों में चक्रवात के टकराने की उम्मीद है। तटीय समुदाय आश्रयों में चले जाएं।",
        a5_title: "⚠️ NH-44 अवरुद्ध — वैकल्पिक मार्ग का उपयोग करें", a5_msg: "रोहतांग दर्रे के पास NH-44 अवरुद्ध। मनाली-लेह रोड के माध्यम से वैकल्पिक मार्ग का उपयोग करें।"
      },
      shelters: {
        s1: "गुवाहाटी राहत शिविर अल्फा", s2: "डिब्रूगढ़ आपातकालीन आश्रय", s3: "देहरादून सेना राहत केंद्र",
        s4: "इंफाल रेड क्रॉस आश्रय", s5: "भुवनेश्वर चक्रवात आश्रय", s6: "शिमला माउंटेन रेस्क्यू बेस", s7: "तिरुवनंतपुरम बाढ़ राहत"
      },
      rescues: {
        r1: "बुजुर्ग माता-पिता के साथ छत पर फंसा हूं। नाव बचाव की जरूरत है।", r2: "गर्भवती महिला, पानी छाती तक है। तत्काल मदद चाहिए।",
        r3: "ज्वलंत क्षेत्र में फंसा हूं, आग तेजी से फैल रही है। मेरे साथ 3 बच्चे हैं।", r4: "इमारत आंशिक रूप से ढह गई। 2 घायल। मेडिकल टीम की जरूरत है।",
        r5: "6 लोगों के परिवार को निकासी की आवश्यकता है। परिवहन उपलब्ध नहीं है।"
      }
    }
  },
  bn: {
    translation: {
      nav: { dashboard: "কমান্ড ড্যাশবোর্ড", map: "লাইভ থ্রেট ম্যাপ", emergency: "জরুরী প্রতিক্রিয়া", shelters: "আশ্রয় নেটওয়ার্ক", predictions: "AI পূর্বাভাস", reports: "ঘটনা রিপোর্ট", navigation: "নেভিগেশন" },
      status: { online: "সিস্টেম অনলাইন", offline: "অফলাইন মোড", activeIncidents: "সক্রিয় ঘটনা", critical: "গুরুতর", language: "ইন্টারফেস ভাষা" },
      map: { title: "লাইভ থ্রেট ম্যাপ", realtime: "রিয়েল-টাইম", layers: "স্তর (LAYERS)", incidents: "ঘটনা", heatmap: "হিট জোন", shelters: "আশ্রয়", evac: "উদ্ধার পথ", satellite: "স্যাটেলাইট", wind: "বাতাস", rain: "বৃষ্টি", temp: "তাপমাত্রা", legend: "ম্যাপ লিজেন্ড" },
      dashboard: {
        activeDisasters: "সক্রিয় দুর্যোগ", nationwide: "দেশব্যাপী পর্যবেক্ষণ", civiliansAffected: "ক্ষতিগ্রস্ত নাগরিক", needsAssistance: "সাহায্য প্রয়োজন",
        sheltersActive: "সক্রিয় আশ্রয়", sheltered: "আশ্রিত", rescuePending: "উদ্ধার অপেক্ষমান", aiQueue: "AI-অগ্রাধিকার লাইন",
        criticalAlerts: "গুরুতর সতর্কতা", broadcasting: "সম্প্রচার সক্রিয়", activeAlerts: "সক্রিয় সতর্কতা", total: "মোট",
        shelterStatus: "আশ্রয় অবস্থা", capacity: "ক্ষমতা", totalSheltered: "মোট", allShelters: "সমস্ত আশ্রয়",
        rescueQueue: "উদ্ধার লাইন", pending: "অপেক্ষমান", incidentRegister: "সক্রিয় ঘটনা রেজিস্টার", incidentsRecorded: "ঘটনা রেকর্ড করা হয়েছে",
        headers: { incident: "ঘটনা", type: "প্রকার", severity: "তীব্রতা", affected: "ক্ষতিগ্রস্ত", coordinates: "স্থানাঙ্ক", source: "উৎস", reported: "রিপোর্ট করা হয়েছে" }
      },
      enums: {
        severity: { critical: "গুরুতর", high: "উচ্চ", moderate: "মাঝারি", low: "কম" },
        type: { flood: "বন্যা", wildfire: "দাবানল", earthquake: "ভূমিকম্প", storm: "ঝড়", landslide: "ভূমিধস" },
        shelter: { open: "খোলা", crowded: "ভিড়", full: "পূর্ণ" }
      },
      disasters: {
        flood_title: "ভয়াবহ বন্যা — আসাম উপত্যকা", flood_desc: "ব্রহ্মপুত্র নদীর জলে ১২টি জেলা ক্ষতিগ্রস্ত। ৪৫,০০০ নাগরিক বাস্তুচ্যুত।",
        wildfire_title: "দাবানল — উত্তরাখণ্ড হিলস", wildfire_desc: "৩,২০০ হেক্টর জুড়ে দাবানল ছড়িয়ে পড়ছে। বাতাসের কারণে গ্রামের দিকে অগ্রসর হচ্ছে।",
        earthquake_title: "ভূমিকম্প M5.8 — মণিপুর", earthquake_desc: "৫.৮ মাত্রার ভূমিকম্প। বেশ কিছু ভবন ক্ষতিগ্রস্ত। আফটারশক প্রত্যাশিত।",
        storm_title: "ঘূর্ণিঝড় বিপর্যয় — বঙ্গোপসাগর", storm_desc: "ঘূর্ণিঝড় ওড়িশা উপকূলের দিকে ধেয়ে আসছে। বাতাসের গতি ১২০ কিমি/ঘণ্টা। সরিয়ে নেওয়ার নির্দেশ।",
        landslide_title: "ভূমিধস — NH-44 হিমাচল প্রদেশ", landslide_desc: "বড় ভূমিধসে জাতীয় মহাসড়ক অবরুদ্ধ। ২টি গাড়ি চাপা পড়েছে। উদ্ধার কাজ চলছে।"
      },
      alerts: {
        a1_title: "🚨 গুরুতর: ব্রহ্মপুত্র উপচে পড়ছে — অবিলম্বে সরিয়ে নিন", a1_msg: "আসামের A1-A7 জোনের সকল বাসিন্দাদের অবিলম্বে সরিয়ে নিতে হবে। জলের স্তর ২মি/ঘন্টা বৃদ্ধি পাচ্ছে।",
        a2_title: "🔥 দাবানল সতর্কতা — বাতাসের দিক পরিবর্তনের সতর্কতা", a2_msg: "বাতাসের দিক পরিবর্তন হয়েছে। মানা ও বদ্রীনাথ গ্রাম এখন আগুনের পথে। উত্তর দিকে সরিয়ে নিন।",
        a3_title: "🔴 ভূমিকম্পের আফটারশক ঝুঁকি — ভবনে প্রবেশ করবেন না", a3_msg: "মণিপুরে M5.8 ভূমিকম্প আঘাত হেনেছে। M4.0+ আফটারশকের সম্ভাবনা। খোলা জায়গায় বাইরে থাকুন।",
        a4_title: "🌀 ঘূর্ণিঝড় সতর্কতা — ওড়িশা উপকূলীয় বেল্ট", a4_msg: "১৮ ঘণ্টার মধ্যে ঘূর্ণিঝড় আছড়ে পড়ার সম্ভাবনা। উপকূলীয় সম্প্রদায়গুলোকে আশ্রয়কেন্দ্রে সরিয়ে নেওয়া হচ্ছে।",
        a5_title: "⚠️ NH-44 অবরুদ্ধ — বিকল্প পথ ব্যবহার করুন", a5_msg: "রোহতাং পাসের কাছে জাতীয় সড়ক 44 অবরুদ্ধ। মানালি-লেহ রাস্তা দিয়ে বিকল্প পথ ব্যবহার করুন।"
      },
      shelters: {
        s1: "গুয়াহাটি রিলিফ ক্যাম্প আলফা", s2: "ডিব্রুগড় জরুরী আশ্রয়কেন্দ্র", s3: "দেরাদুন আর্মি রিলিফ সেন্টার",
        s4: "ইম্ফল রেড ক্রস শেল্টার", s5: "ভুবনেশ্বর সাইক্লোন শেল্টার", s6: "সিমলা মাউন্টেন রেসকিউ বেস", s7: "তিরুবনন্তপুরম বন্যা ত্রাণ"
      },
      rescues: {
        r1: "বয়স্ক বাবা-মায়ের সাথে ছাদে আটকা পড়েছি। নৌকা উদ্ধারের প্রয়োজন।", r2: "গর্ভবতী মহিলা, জল বুক পর্যন্ত। অবিলম্বে সাহায্য প্রয়োজন।",
        r3: "জ্বলন্ত এলাকায় আটকা পড়েছি, আগুন দ্রুত ছড়াচ্ছে। সাথে ৩টি শিশু।", r4: "ভবন আংশিক ধসে পড়েছে। ২ জন আহত। মেডিকেল টিম প্রয়োজন।",
        r5: "৬ জনের পরিবারের স্থানান্তর প্রয়োজন। কোন পরিবহন নেই।"
      }
    }
  },
  te: {
    translation: {
      nav: { dashboard: "కమాండ్ డాష్‌బోర్డ్", map: "లైవ్ థ్రెట్ మ్యాప్", emergency: "అత్యవసర ప్రతిస్పందన", shelters: "షెల్టర్ నెట్‌వర్క్", predictions: "AI అంచనాలు", reports: "సంఘటన నివేదికలు", navigation: "నావిగేషన్" },
      status: { online: "సిస్టమ్ ఆన్‌లైన్", offline: "ఆఫ్‌లైన్ మోడ్", activeIncidents: "క్రియాశీల సంఘటనలు", critical: "తీవ్రమైన", language: "ఇంటర్‌ఫేస్ భాష" },
      map: { title: "లైవ్ థ్రెట్ మ్యాప్", realtime: "రియల్-టైమ్", layers: "పొరలు (LAYERS)", incidents: "సంఘటనలు", heatmap: "హీట్ జోన్‌లు", shelters: "షెల్టర్‌లు", evac: "తరలింపు మార్గాలు", satellite: "శాటిలైట్", wind: "గాలి", rain: "వర్షం", temp: "ఉష్ణోగ్రత", legend: "మ్యాప్ లెజెండ్" },
      dashboard: {
        activeDisasters: "క్రియాశీల విపత్తులు", nationwide: "దేశవ్యాప్త పర్యవేక్షణ", civiliansAffected: "ప్రభావిత పౌరులు", needsAssistance: "సహాయం అవసరం",
        sheltersActive: "క్రియాశీల షెల్టర్లు", sheltered: "ఆశ్రయం పొందారు", rescuePending: "పెండింగ్‌లో ఉన్న రక్షణ", aiQueue: "AI-ప్రాధాన్యత క్యూ",
        criticalAlerts: "క్లిష్టమైన హెచ్చరికలు", broadcasting: "ప్రసారం చురుకుగా ఉంది", activeAlerts: "క్రియాశీల హెచ్చరికలు", total: "మొత్తం",
        shelterStatus: "షెల్టర్ స్థితి", capacity: "సామర్థ్యం", totalSheltered: "మొత్తం", allShelters: "అన్ని షెల్టర్లు",
        rescueQueue: "రక్షణ క్యూ", pending: "పెండింగ్‌లో ఉన్నాయి", incidentRegister: "క్రియాశీల సంఘటన రిజిస్టర్", incidentsRecorded: "నమోదైన సంఘటనలు",
        headers: { incident: "సంఘటన", type: "రకం", severity: "తీవ్రత", affected: "ప్రభావితం", coordinates: "కోఆర్డినేట్స్", source: "మూలం", reported: "నివేదించబడింది" }
      },
      enums: {
        severity: { critical: "క్లిష్టమైన", high: "అధిక", moderate: "మితమైన", low: "తక్కువ" },
        type: { flood: "వరద", wildfire: "అడవి మంటలు", earthquake: "భూకంపం", storm: "తుఫాను", landslide: "కొండచరియలు" },
        shelter: { open: "తెరిచి ఉంది", crowded: "రద్దీగా ఉంది", full: "నిండిపోయింది" }
      },
      disasters: {
        flood_title: "తీవ్రమైన వరదలు — అస్సాం వ్యాలీ", flood_desc: "బ్రహ్మపుత్ర నది ఉప్పొంగడం వల్ల 12 జిల్లాలు ప్రభావితమయ్యాయి. 45,000 మంది నిరాశ్రయులయ్యారు.",
        wildfire_title: "అడవి మంటలు — ఉత్తరాఖండ్ హిల్స్", wildfire_desc: "3,200 హెక్టార్లలో అడవి మంటలు వ్యాపించాయి. బలమైన గాలుల వల్ల గ్రామాల వైపు వ్యాపిస్తోంది.",
        earthquake_title: "భూకంపం M5.8 — మణిపూర్", earthquake_desc: "5.8 తీవ్రతతో భూకంపం. పలు భవనాలకు నష్టం. ఆఫ్టర్‌షాక్స్ ఆశించబడతాయి.",
        storm_title: "తుఫాను బిపర్‌జాయ్ — బంగాళాఖాతం", storm_desc: "తుఫాను ఒడిశా తీరం వైపు వస్తోంది. గాలి వేగం గంటకు 120 కి.మీ. తరలింపు ఆదేశాలు జారీ.",
        landslide_title: "కొండచరియలు — NH-44 హిమాచల్ ప్రదేశ్", landslide_desc: "జాతీయ రహదారిని అడ్డుకున్న భారీ కొండచరియలు. 2 వాహనాలు కూరుకుపోయాయి. రక్షణ చర్యలు కొనసాగుతున్నాయి."
      },
      alerts: {
        a1_title: "🚨 క్లిష్టమైన: బ్రహ్మపుత్ర ఉప్పొంగడం — వెంటనే తరలిపోండి", a1_msg: "అస్సాంలోని A1-A7 జోన్ల నివాసితులు వెంటనే ఖాళీ చేయాలి. నీటి మట్టం గంటకు 2 మీటర్లు పెరుగుతోంది.",
        a2_title: "🔥 అడవి మంటల హెచ్చరిక — గాలి దిశ మార్పు", a2_msg: "గాలి దిశ మారింది. మానా మరియు బద్రీనాథ్ గ్రామాలు మంటల దారిలో ఉన్నాయి. ఉత్తరం వైపు తరలిపోండి.",
        a3_title: "🔴 భూకంపం ఆఫ్టర్‌షాక్ ప్రమాదం — భవనాల్లోకి ప్రవేశించకండి", a3_msg: "మణిపూర్‌లో M5.8 భూకంపం వచ్చింది. M4.0+ ఆఫ్టర్‌షాక్స్ ఆశించబడతాయి. బహిరంగ ప్రదేశాల్లో ఉండండి.",
        a4_title: "🌀 తుఫాను హెచ్చరిక — ఒడిశా తీరప్రాంతం", a4_msg: "18 గంటల్లో తుఫాను తీరం దాటే అవకాశం ఉంది. తీరప్రాంత ప్రజలను సురక్షిత ప్రాంతాలకు తరలించండి.",
        a5_title: "⚠️ NH-44 మూసుకుపోయింది — ప్రత్యామ్నాయ మార్గాన్ని ఉపయోగించండి", a5_msg: "రోహ్‌తాంగ్ పాస్ వద్ద జాతీయ రహదారి 44 మూసుకుపోయింది. మనాలి-లేహ్ రోడ్ గుండా ప్రత్యామ్నాయ మార్గం ఉపయోగించండి."
      },
      shelters: {
        s1: "గౌహతి రిలీఫ్ క్యాంప్ ఆల్ఫా", s2: "దిబ్రూగర్ ఎమర్జెన్సీ షెల్టర్", s3: "డెహ్రాడూన్ ఆర్మీ రిలీఫ్ సెంటర్",
        s4: "ఇంఫాల్ రెడ్ క్రాస్ షెల్టర్", s5: "భువనేశ్వర్ సైక్లోన్ షెల్టర్", s6: "సిమ్లా మౌంటైన్ రెస్క్యూ బేస్", s7: "తిరువనంతపురం వరద సహాయం"
      },
      rescues: {
        r1: "వృద్ధ తల్లిదండ్రులతో పైకప్పుపై చిక్కుకున్నాను. పడవ రక్షణ అవసరం.", r2: "గర్భిణీ స్త్రీ, ఛాతీ వరకు నీరు. తక్షణ సహాయం అవసరం.",
        r3: "మంటల ప్రాంతంలో చిక్కుకున్నాను, మంటలు వేగంగా వ్యాపిస్తున్నాయి. నాతో పాటు ముగ్గురు పిల్లలు ఉన్నారు.", r4: "భవనం పాక్షికంగా కూలిపోయింది. 2 గాయపడ్డారు. వైద్య బృందం అవసరం.",
        r5: "6 మంది ఉన్న కుటుంబానికి తరలింపు అవసరం. రవాణా సౌకర్యం లేదు."
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false }
  });

export default i18n;
