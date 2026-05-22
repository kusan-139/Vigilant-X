import { useState, useRef, useEffect } from 'react';
import { analyzeEmergency, getSurvivalTips } from '../../services/nlpService';
import { findSheltersOffline } from '../../services/indexedDBService';
import { emergencyAPI, shelterAPI } from '../../services/api';
import useStore from '../../store';
import { Send, Mic, MicOff, Bot, User, Phone, AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';

const QUICK_ACTIONS = [
  { label: '🌊  Flood Rescue',    msg: 'I am stuck in flood water, water rising fast, need rescue' },
  { label: '🔥  Fire Emergency',  msg: 'There is fire near my building, I cannot escape' },
  { label: '🚑  Medical Aid',     msg: 'Someone is injured and unconscious, need medical help urgently' },
  { label: '🆘  Stranded/Trapped',msg: 'I am stranded and cannot move, please send rescue team' },
  { label: '🍽️  Food & Water',   msg: 'I have no food or water, need supplies and assistance' },
  { label: '🏚️  Collapse',       msg: 'A building has collapsed, people are trapped under debris' },
];

const WELCOME_MSG = {
  id: 'welcome', role: 'bot', severity: null,
  timestamp: new Date().toISOString(),
  content: `**VIGILANT-X EMERGENCY RESPONSE SYSTEM**\nAuthorized Emergency AI — Operational\n\nDescribe your emergency situation. I will provide immediate guidance and dispatch appropriate response teams.\n\n**National Emergency Hotlines:**\n• Emergency Services: **112**\n• Ambulance: **108**\n• Fire Brigade: **101**\n• NDRF Disaster Helpline: **1078**\n• State Relief: **1070**\n\nState your emergency now.`,
};

function MessageBubble({ msg }) {
  const isBot = msg.role === 'bot';
  
  // Safely extract the text whether it is a string or a JSON object
  const safeContent = typeof msg.content === 'string' 
    ? msg.content 
    : msg.content?.response || msg.content?.guidance || JSON.stringify(msg.content || "Error");
    
  const lines = safeContent.split('\n');

  const formatLine = (line, i) => {
    if (!line) return <br key={i} />;
    const bold = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    const parts = line.split(/\*\*(.+?)\*\*/);
    return (
      <p key={i} className="mt-0.5">
        {parts.map((p, j) =>
          j % 2 === 1 ? <strong key={j} className="text-navy font-bold">{p}</strong> : p
        )}
      </p>
    );
  };

  return (
    <div className={`flex gap-2.5 ${isBot ? 'flex-row' : 'flex-row-reverse'} animate-fade-in`}>
      <div className={`w-7 h-7 rounded flex items-center justify-center flex-shrink-0 mt-1 border ${
        isBot ? 'bg-blue-50 border-blue-200 text-steel' : 'bg-teal-50 border-teal-200 text-teal-600'
      }`}>
        {isBot ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
      </div>
      <div className={`max-w-[86%] ${isBot ? 'chat-bubble-bot' : 'chat-bubble-user'} ${
        msg.severity === 'critical' ? 'bg-red-50 border-red-200' : ''
      }`}>
        {msg.severity === 'critical' && (
          <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-red-200">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
            <span className="text-[10px] font-bold tracking-widest text-red-700">
              CRITICAL EMERGENCY DETECTED
            </span>
          </div>
        )}
        <div className={`text-[12px] leading-relaxed ${isBot ? 'text-slate-700' : 'text-slate-700'}`}>
          {lines.map((line, i) => formatLine(line, i))}
        </div>
        <div className="text-[10px] mt-2 font-mono text-slate-400">
          {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

export default function EmergencyBot() {
  const [messages, setMessages] = useState([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [rescueDispatched, setRescueDispatched] = useState(false);
  const messagesEndRef = useRef(null);
  const { language, addRescueRequest, userLocation } = useStore();

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date().toISOString() }]);
    setInput('');
    setIsAnalyzing(true);
    await new Promise((r) => setTimeout(r, 1100));

    let result = null;

    // HYBRID ARCHITECTURE: Try online Gemini API first
    if (navigator.onLine) {
      try {
        const response = await emergencyAPI.analyze(text, 20.5937, 78.9629, language);
        if (response.data && response.data.type) {
          result = response.data;
        }
      } catch (err) {
        console.warn("Backend / Gemini API failed. Falling back to Offline Option B.");
      }
    }

    // FALLBACK (Option B): Use local offline heuristic engine
    if (!result) {
      result = await analyzeEmergency(text, language);
    }

    if ((result.severity === 'critical' || result.severity === 'high') && !rescueDispatched) {
      addRescueRequest({
        id: `r${Date.now()}`,
        name: 'Emergency Chat User',
        contact: 'Via System',
        lat: userLocation?.lat || 20.5937, 
        lng: userLocation?.lng || 78.9629,
        situation: text,
        emergency_type: result.type,
        priority_score: result.severity === 'critical' ? 93 + Math.random() * 6 : 72 + Math.random() * 18,
        status: 'pending',
        age_group: 'adult',
        submitted_at: new Date().toISOString(),
      });
      setRescueDispatched(true);
    }
    // 1. Properly format the AI's advice (whether it is a string or an array)
    let aiText = result.response || result.guidance || "I am here to help.";
    if (Array.isArray(aiText)) {
      aiText = aiText.map(item => `• ${item}`).join('\n');
    }
    
    // Add the bold title to the top of the message
    let botMessage = `**${result.title || 'Emergency Guidance'}**\n\n${aiText}`;

    // 2. Fetch real nearby shelters smartly
    try {
      let recommended = [];
      
      // Attempt 1: If the user has GPS enabled, find shelters physically closest to them
      if (userLocation && userLocation.lat && userLocation.lng) {
        const shelterRes = await shelterAPI.getRecommended(userLocation.lat, userLocation.lng);
        recommended = shelterRes?.data?.recommended || [];
      }

      if (recommended.length > 0) {
        botMessage += `\n\n**📍 Nearest Safe Shelters (Based on your GPS)**\n`;
        recommended.forEach((shelter, idx) => {
          botMessage += `${idx + 1}. **${shelter.name}**\n   Address: ${shelter.address}\n   Contact: **📞 ${shelter.contact || '112'}**\n   Availability: ${shelter.capacity - shelter.current_occupancy} beds open\n\n`;
        });
      } else {
        // Attempt 2: If no GPS, use your offline text-scanner to find places like "Assam" or "Mumbai" in their message
        const offlineShelters = await findSheltersOffline(text);
        if (offlineShelters && offlineShelters.length > 0) {
          botMessage += `\n\n**📍 Shelters Located in that Area**\n`;
          offlineShelters.forEach((shelter, idx) => {
            botMessage += `${idx + 1}. **${shelter.name}**\n   Address: ${shelter.address}\n   Contact: **📞 ${shelter.contact || '112'}**\n\n`;
          });
        } else {
          botMessage += `\n\n*(Enable GPS on the map page to see exact nearby shelters, or mention a specific city in your message).*`;
        }
      }
    } catch (err) {
      console.warn("Failed to fetch shelters", err);
    }

    setMessages((prev) => [...prev, {
      id: (Date.now() + 1).toString(),
      role: 'bot', content: botMessage,
      timestamp: new Date().toISOString(),
      severity: result.severity === 'critical' ? 'critical' : null,
    }]);
    setIsAnalyzing(false);
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input requires Chrome browser.'); return; }
    const r = new SR();
    r.lang = { hi: 'hi-IN', bn: 'bn-IN', te: 'te-IN' }[language] || 'en-IN';
    r.continuous = false; r.interimResults = false;
    setIsListening(true);
    r.start();
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = r.onend = () => setIsListening(false);
  };

  return (
    <div className="flex flex-col" style={{ height: '68vh' }}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 flex-shrink-0 bg-slate-50 border-b border-gray-200">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-white border border-slate-200 shadow-sm">
          <ShieldAlert className="w-5 h-5 text-steel" style={{ color: 'var(--steel)' }} />
        </div>
        <div>
          <div className="font-bold text-navy text-sm tracking-wide">EMERGENCY RESPONSE AI</div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-teal-600">
            <span className="status-dot active" style={{ width: '5px', height: '5px' }} />
            ONLINE · NLP ANALYSIS ACTIVE
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {rescueDispatched && (
            <span className="badge-low text-[9px] tracking-widest">RESCUE DISPATCHED</span>
          )}
          <a href="tel:112" className="btn-gov-danger py-1.5 px-3 text-[11px]">
            <Phone className="w-3 h-3" /> CALL 112
          </a>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 py-2.5 flex-shrink-0 bg-white border-b border-gray-200">
        <div className="text-[9px] font-bold tracking-[0.18em] uppercase mb-2 text-slate-500">
          Quick Incident Types
        </div>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <button key={a.label} onClick={() => sendMessage(a.msg)}
              className="text-[11px] px-2.5 py-1 rounded font-medium transition-all bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-navy">
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4 space-y-4">
        {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
        {isAnalyzing && (
          <div className="flex gap-2.5 animate-fade-in">
            <div className="w-7 h-7 rounded flex items-center justify-center bg-blue-50 border border-blue-200">
              <Bot className="w-3.5 h-3.5 text-steel" />
            </div>
            <div className="chat-bubble-bot flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-steel" />
              <span className="text-[11px] tracking-wide text-slate-500">
                Analyzing emergency situation...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 flex-shrink-0 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <button onClick={toggleVoice}
            className={`p-3 rounded-lg flex-shrink-0 transition-all ${
              isListening ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}>
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            className="input-field flex-1"
            placeholder="Describe your emergency situation..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          />
          <button onClick={() => sendMessage(input)}
            disabled={!input.trim() || isAnalyzing}
            className="btn-gov-primary px-4 disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] mt-2 font-mono text-slate-400">
          AI triage + automatic dispatch for critical situations · NDRF: 1078
        </p>
      </div>
    </div>
  );
}
