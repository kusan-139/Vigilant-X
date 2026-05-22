-- Run this in the Supabase SQL Editor to create your database tables

-- 1. Disasters Table
CREATE TABLE disasters (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    radius_km FLOAT,
    status TEXT DEFAULT 'active',
    affected INTEGER DEFAULT 0,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'user_report'
);

-- 2. Shelters Table
CREATE TABLE shelters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    lat FLOAT NOT NULL,
    lng FLOAT NOT NULL,
    capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open',
    facilities TEXT[] DEFAULT '{}',
    contact TEXT
);

-- 3. Alerts Table
CREATE TABLE alerts (
    id TEXT PRIMARY KEY,
    disaster_id TEXT REFERENCES disasters(id),
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 4. Rescue Requests Table
CREATE TABLE rescue_requests (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact TEXT NOT NULL,
    lat FLOAT,
    lng FLOAT,
    situation TEXT NOT NULL,
    emergency_type TEXT DEFAULT 'rescue',
    priority_score FLOAT DEFAULT 0.0,
    status TEXT DEFAULT 'pending',
    age_group TEXT DEFAULT 'adult',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insert some initial mock data
INSERT INTO disasters (id, type, severity, title, description, lat, lng, radius_km, affected, source) VALUES
('d1', 'flood', 'critical', 'Severe Flooding — Assam Valley', 'Brahmaputra river overflow affecting 12 districts. 45,000 civilians displaced.', 26.2006, 92.9376, 45, 45000, 'gdacs'),
('d2', 'wildfire', 'high', 'Forest Fire — Uttarakhand Hills', 'Wildfire spreading across 3,200 hectares. Wind-driven spread toward villages.', 30.3165, 78.0322, 18, 8200, 'nasa_firms');

INSERT INTO shelters (id, name, address, lat, lng, capacity, current_occupancy, contact) VALUES
('s1', 'Guwahati Relief Camp Alpha', 'Nehru Stadium, Guwahati, Assam', 26.1445, 91.7362, 2000, 1680, '+91-361-2730000'),
('s2', 'Dibrugarh Emergency Shelter', 'District Sports Complex, Dibrugarh', 27.4728, 94.9120, 1200, 1190, '+91-373-2324000');

INSERT INTO alerts (id, disaster_id, severity, title, message) VALUES
('a1', 'd1', 'critical', '🚨 CRITICAL: Brahmaputra Overflow — Evacuate Immediately', 'All residents in zones A1-A7 of Assam must evacuate immediately. Water level rising at 2m/hour.');

INSERT INTO rescue_requests (id, name, contact, lat, lng, situation, emergency_type, priority_score, status, age_group) VALUES
('r1', 'Raju Sharma', '+91-98765-43210', 26.2106, 92.9100, 'Stranded on rooftop with elderly parents. Need boat rescue.', 'rescue', 92.0, 'pending', 'elderly');

-- 6. Shelter Check-Ins Table
CREATE TABLE shelter_checkins (
    id TEXT PRIMARY KEY,
    shelter_id TEXT REFERENCES shelters(id),
    name TEXT NOT NULL,
    condition TEXT NOT NULL,
    location TEXT NOT NULL,
    checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
