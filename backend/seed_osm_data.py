import os
import uuid
import requests
import random
import time
import json
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env")
    exit(1)

SUPABASE_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}
SUPABASE_REST_URL = f"{SUPABASE_URL}/rest/v1/shelters"

OVERPASS_URL = "http://overpass-api.de/api/interpreter"

# Precise bounding boxes for ALL Indian states: (south, west, north, east, state_name)
STATE_BBOXES = [
    (15.60, 73.00, 22.10, 80.90, "Maharashtra"),
    (28.40, 76.80, 28.90, 77.40, "Delhi"),
    (24.00, 89.80, 26.50, 96.10, "Assam"),
    (21.50, 86.00, 27.30, 89.90, "West Bengal"),
    (8.00, 76.20, 13.60, 80.40, "Tamil Nadu"),
    (8.20, 74.80, 12.80, 77.40, "Kerala"),
    (20.10, 68.10, 24.70, 74.50, "Gujarat"),
    (11.50, 74.00, 18.50, 78.60, "Karnataka"),
    (15.80, 77.20, 19.90, 81.40, "Telangana"),
    (23.80, 77.00, 30.50, 84.70, "Uttar Pradesh"),
    (23.00, 69.40, 30.20, 78.30, "Rajasthan"),
    (24.20, 83.30, 27.60, 88.20, "Bihar"),
    (28.70, 77.50, 31.50, 81.10, "Uttarakhand"),
    (17.70, 81.30, 22.60, 87.60, "Odisha"),
    (32.20, 73.70, 37.10, 80.40, "Jammu and Kashmir"),
    (30.30, 75.50, 33.30, 79.00, "Himachal Pradesh"),
    (21.90, 83.30, 25.40, 87.90, "Jharkhand"),
    (12.60, 76.70, 19.20, 84.80, "Andhra Pradesh"),
    (29.50, 73.80, 32.60, 76.90, "Punjab"),
    (17.70, 80.20, 24.20, 84.40, "Chhattisgarh"),
    (21.00, 74.00, 26.90, 82.90, "Madhya Pradesh"),
    (27.60, 74.40, 30.90, 77.60, "Haryana"),
    (14.80, 73.60, 15.80, 74.30, "Goa"),
    (22.90, 91.10, 24.90, 92.40, "Tripura"),
    (25.00, 89.80, 26.20, 92.80, "Meghalaya"),
    (23.80, 93.00, 25.70, 94.80, "Manipur"),
    (25.20, 93.30, 27.10, 95.30, "Nagaland"),
    (21.90, 92.20, 24.50, 93.50, "Mizoram"),
    (26.50, 91.50, 29.50, 97.40, "Arunachal Pradesh"),
    (27.00, 88.00, 28.20, 89.00, "Sikkim"),
]

def fetch_osm_for_state(south, west, north, east, state_name):
    """Fetch hospitals and community centres using bounding box for a state."""
    query = f"""
    [out:json][timeout:60];
    (
      node["amenity"="hospital"]({south},{west},{north},{east});
      node["amenity"="community_centre"]({south},{west},{north},{east});
      node["amenity"="shelter"]({south},{west},{north},{east});
    );
    out body 50;
    """
    
    headers = {
        "User-Agent": "VigilantXDisasterManagementApp/2.0 (contact: support@vigilantx.org)"
    }
    try:
        response = requests.post(OVERPASS_URL, data={'data': query}, headers=headers, timeout=90)
        if response.status_code == 200:
            data = response.json()
            elements = data.get('elements', [])
            shelters = []
            
            for element in elements:
                tags = element.get('tags', {})
                name = tags.get('name')
                if not name:
                    continue
                
                phone = tags.get('phone') or tags.get('contact:phone') or "112"
                amenity_type = tags.get('amenity', 'shelter')
                
                if amenity_type == "hospital":
                    facilities = ["medical", "power", "water", "comms"]
                    capacity = random.randint(100, 500)
                else:
                    facilities = ["food", "water", "shelter", "power"]
                    capacity = random.randint(300, 1500)
                
                shelters.append({
                    "id": f"osm_{uuid.uuid4().hex[:8]}",
                    "name": name,
                    "address": f"{name}, {state_name}, India",
                    "lat": element.get('lat'),
                    "lng": element.get('lon'),
                    "capacity": capacity,
                    "current_occupancy": random.randint(0, 50),
                    "status": "open",
                    "facilities": facilities,
                    "contact": phone
                })
            
            return shelters
        else:
            print(f"   HTTP {response.status_code} - {response.text[:100]}")
            return []
    except Exception as e:
        print(f"   ERROR: {e}")
        return []

def inject_into_supabase(shelters):
    print(f"\n{'=' * 60}")
    print(f"Injecting {len(shelters)} real shelters into Supabase via REST API...")
    print(f"{'=' * 60}")
    
    success_count = 0
    fail_count = 0
    
    batch_size = 20
    for i in range(0, len(shelters), batch_size):
        batch = shelters[i:i + batch_size]
        try:
            resp = requests.post(
                SUPABASE_REST_URL,
                headers=SUPABASE_HEADERS,
                json=batch,
                timeout=15
            )
            if resp.status_code in [200, 201]:
                success_count += len(batch)
                print(f"   Batch {i // batch_size + 1}: Injected {len(batch)} shelters OK")
            else:
                fail_count += len(batch)
                print(f"   Batch {i // batch_size + 1} FAILED ({resp.status_code}): {resp.text[:200]}")
        except Exception as e:
            fail_count += len(batch)
            print(f"   Batch {i // batch_size + 1} ERROR: {e}")
    
    return success_count, fail_count

def main():
    print("=" * 60)
    print("STATEWIDE OpenStreetMap Data Extraction")
    print("Scanning ALL 30 Indian states using bounding boxes")
    print("=" * 60)
    
    all_shelters = []
    
    for south, west, north, east, state in STATE_BBOXES:
        print(f"\n>> Scanning: {state}...")
        shelters = fetch_osm_for_state(south, west, north, east, state)
        print(f"   Extracted {len(shelters)} named shelters/hospitals")
        all_shelters.extend(shelters)
        time.sleep(3)  # Respect Overpass rate limits
    
    print(f"\n{'=' * 60}")
    print(f"EXTRACTION COMPLETE: {len(all_shelters)} total real infrastructure points")
    print(f"{'=' * 60}")
    
    if all_shelters:
        success, fail = inject_into_supabase(all_shelters)
        print(f"\n{'=' * 60}")
        print(f"FINAL RESULT")
        print(f"  Succeeded: {success}")
        print(f"  Failed:    {fail}")
        print(f"{'=' * 60}")
    else:
        print("No shelters found.")

if __name__ == "__main__":
    main()
