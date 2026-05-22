import localforage from 'localforage';

// Configure localforage to use IndexedDB explicitly for maximum performance
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'VigilantX_Offline_DB',
  version: 1.0,
  storeName: 'emergency_shelters',
  description: 'Scalable offline geographic database for disaster shelters'
});

/**
 * Caches the entire shelter database from Supabase into IndexedDB.
 * This runs silently in the background when the app loads (if online).
 * It can hold millions of records without using active RAM.
 */
export async function cacheSheltersOffline(sheltersArray) {
  try {
    if (!sheltersArray || sheltersArray.length === 0) return;
    await localforage.setItem('all_shelters', sheltersArray);
    console.log(`[IndexedDB] Successfully cached ${sheltersArray.length} shelters for offline use.`);
  } catch (err) {
    console.error('[IndexedDB] Failed to cache shelters:', err);
  }
}

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'but', 'not', 'you', 'are', 'was', 'how', 'why', 'who', 'now', 
  'our', 'out', 'can', 'new', 'all', 'any', 'one', 'with', 'from', 'this', 'that', 
  'they', 'your', 'have', 'were', 'been', 'would', 'should', 'could', 'will', 'some', 
  'them', 'their', 'there', 'here', 'more', 'about', 'just', 'very', 'then', 'than', 
  'into', 'need', 'help', 'stuck', 'flood', 'water', 'rising', 'fire', 'medical', 
  'injured', 'unconscious', 'stranded', 'cannot', 'move', 'send', 'rescue', 'team',
  'food', 'water', 'supplies', 'assistance', 'building', 'collapsed', 'people', 'trapped'
]);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Queries the offline IndexedDB for shelters matching the user's message.
 * This is non-blocking and handles massive datasets efficiently.
 */
export async function findSheltersOffline(userMessage) {
  try {
    const shelters = await localforage.getItem('all_shelters');
    if (!shelters || shelters.length === 0) return null;

    const lowerMsg = userMessage.toLowerCase();
    const words = lowerMsg.split(/[\s,.-]+/);
    
    // Filter out stop words and keep words with length >= 3
    const queryWords = words.filter(word => word.length >= 3 && !STOP_WORDS.has(word));
    
    if (queryWords.length === 0) return null;

    const matchedShelters = shelters.filter(shelter => {
      if (!shelter.address && !shelter.name) return false;
      const searchableText = `${shelter.name} ${shelter.address}`.toLowerCase();
      
      // Match if any of the query words exist in the searchableText as whole words
      return queryWords.some(word => {
        const escWord = escapeRegExp(word);
        const regex = new RegExp('\\b' + escWord + '\\b', 'i');
        return regex.test(searchableText);
      });
    });

    // Return the top 3 matches, sorted by current capacity (most empty first)
    if (matchedShelters.length > 0) {
      return matchedShelters
        .sort((a, b) => (a.current_occupancy / Math.max(1, a.capacity)) - (b.current_occupancy / Math.max(1, b.capacity)))
        .slice(0, 3);
    }
    
    return null;
  } catch (err) {
    console.error('[IndexedDB] Offline query failed:', err);
    return null;
  }
}
