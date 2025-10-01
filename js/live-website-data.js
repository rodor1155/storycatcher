/**
 * Live Website Data - Works on GitHub Pages with external database
 */

// Supabase configuration (same as admin)
const SUPABASE_URL = 'https://lnogbmmeuzkzqlfgbkng.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxub2dibW1ldXprenFsZmdia25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MjYyNzgsImV4cCI6MjA1MTMwMjI3OH0.MZh1D9VB3IqJAHkUbRQgOJTHvqpEQYN1Nrm6ZE9Yp5Q';

// Database request function
async function supabaseRequest(table) {
    const url = `${SUPABASE_URL}/rest/v1/${table}`;
    
    try {
        const response = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            return await response.json();
        }
        
        throw new Error(`Database error: ${response.status}`);
    } catch (error) {
        console.warn('Database request failed:', error.message);
        return null;
    }
}

// Get episodes for display
async function getEpisodes() {
    try {
        console.log('📖 Loading episodes from database...');
        const episodes = await supabaseRequest('episodes');
        
        if (episodes && episodes.length > 0) {
            console.log('✅ Loaded episodes from database:', episodes.length);
            return episodes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    } catch (error) {
        console.warn('⚠️ Database failed, using fallback:', error.message);
    }
    
    // Fallback to defaults
    console.log('📖 Using default episodes');
    return getDefaultEpisodes();
}

// Get clans for display
async function getClans() {
    try {
        console.log('🔮 Loading clans from database...');
        const clans = await supabaseRequest('clans');
        
        if (clans && clans.length > 0) {
            console.log('✅ Loaded clans from database:', clans.length);
            return clans;
        }
    } catch (error) {
        console.warn('⚠️ Database failed, using fallback:', error.message);
    }
    
    // Fallback to defaults
    console.log('🔮 Using default clans');
    return getDefaultClans();
}

// Get locations for display
async function getLocations() {
    try {
        console.log('🗺️ Loading locations from database...');
        const locations = await supabaseRequest('locations');
        
        if (locations && locations.length > 0) {
            console.log('✅ Loaded locations from database:', locations.length);
            return locations;
        }
    } catch (error) {
        console.warn('⚠️ Database failed, using fallback:', error.message);
    }
    
    // Fallback to defaults
    console.log('🗺️ Using default locations');
    return getDefaultLocations();
}

// Get main page content (still from localStorage for now)
function getMainPageContent() {
    const stored = localStorage.getItem('hiddenworld_mainpage_content');
    if (stored) {
        return JSON.parse(stored);
    }
    
    return {
        hero_title: 'The Hidden World of London',
        hero_subtitle: 'Magical stories and secret places waiting to be discovered by children aged 8-12',
        episodes_heading: 'Magical Episodes',
        stones_heading: 'Discover Your Clan Stone',
        london_heading: 'Secret Places in London',
        about_content: 'Welcome to a London where magic hides in plain sight. Every bridge has a story, every stone remembers, and some children can hear the citys ancient secrets.',
        footer_tagline: 'Where London magic lives ✨'
    };
}

// Default fallback data
function getDefaultEpisodes() {
    return [
        {
            id: 'ep1',
            title: 'The Awakening of the Thames Stones',
            meta_description: 'Discover how the ancient clan stones first awakened along the Thames, calling to children who could hear their magical whispers.',
            content: '<p>Long ago, when London was just a collection of villages along the Thames, five mysterious stones appeared overnight. Each stone hummed with a different magical frequency...</p><p>The River Clan stone emerged first, glowing blue-green like the deepest part of the Thames. Children walking along the river banks began to hear whispers in languages they had never learned...</p>',
            created_at: new Date().toISOString(),
            image_url: null,
            page_type: 'episode',
            status: 'published'
        },
        {
            id: 'ep2',
            title: 'The Secret of Fleet River',
            meta_description: 'Follow Maya as she discovers the hidden Fleet River and learns why some waters remember everything.',
            content: '<p>Maya pressed her ear to the pavement near Blackfriars Bridge. Other children thought she was playing, but Maya could hear something magical...</p><p>Beneath the busy London streets, the Fleet River still flows, carrying messages between the clan stones. Maya was the first to hear its call in over fifty years...</p>',
            created_at: new Date().toISOString(),
            image_url: null,
            page_type: 'episode',
            status: 'published'
        },
        {
            id: 'ep3',
            title: 'The Crystal Garden of Covent Garden',
            meta_description: 'Explore the hidden crystal garden where the Earth Clan stone teaches children to speak with growing things.',
            content: '<p>Behind the market stalls of Covent Garden, there is a garden that only appears to children who truly believe in magic...</p><p>Tommy discovered it when he was looking for his lost marble. But what he found instead was a garden where flowers sang and trees offered advice in rustling whispers...</p>',
            created_at: new Date().toISOString(),
            image_url: null,
            page_type: 'episode',
            status: 'published'
        }
    ];
}

function getDefaultClans() {
    return [
        {
            id: 'clan1',
            name: 'River Clan',
            stone_description: 'The River Clan stone emerged from the Thames itself, carrying the wisdom of waters that have flowed for thousands of years. It glows with the blue-green light of deep water and hums with the rhythm of tides.',
            offering: 'The power to understand any language, to flow around obstacles like water, and to hear the stories that rivers tell. Members can communicate with all water creatures and feel the emotions of anyone who has touched the same water.',
            resonance_note: 'Place your hand on any flowing water and whisper "I hear your stories." The stone will respond when you truly mean it.',
            color_primary: '#0EA5E9',
            color_secondary: '#06B6D4',
            emblem_url: null,
            status: 'active'
        },
        {
            id: 'clan2',
            name: 'Sky Clan',
            stone_description: 'High above London, where the pigeons nest on St. Pauls Cathedral, the Sky Clan stone catches every whisper carried by the wind. It shimmers like captured starlight and hums with the frequency of dreams taking flight.',
            offering: 'The gift of understanding the language of birds, the ability to find lost things by following the wind, and the power to send messages through clouds. Members can sense weather changes and feel the emotions of anyone who has looked up at the same sky.',
            resonance_note: 'Stand on any high place in London, spread your arms wide, and whisper to the wind "I am ready to fly." The stone will call to those who truly wish to soar.',
            color_primary: '#3B82F6',
            color_secondary: '#8B5CF6',
            emblem_url: null,
            status: 'active'
        },
        {
            id: 'clan3',
            name: 'Earth Clan',
            stone_description: 'Deep beneath the streets of London, where the old Roman foundations still stand, the Earth Clan stone pulses with the heartbeat of the city itself. It appears as rough granite but glows with inner warmth like embers in a fireplace.',
            offering: 'The ability to speak with growing things, to find hidden passages and secret doors, and to sense the history held in stones and soil. Members can make plants grow faster and understand the stories that buildings tell.',
            resonance_note: 'Place both hands on bare earth (even in a small garden or park) and whisper "I hear the deep songs." The stone responds to those who listen to what has been growing for centuries.',
            color_primary: '#059669',
            color_secondary: '#D97706',
            emblem_url: null,
            status: 'active'
        },
        {
            id: 'clan4',
            name: 'Fire Clan',
            stone_description: 'Born from the Great Fire of London in 1666, the Fire Clan stone holds the memory of transformation and renewal. It appears as smooth obsidian but warm to the touch, with flames that dance just beneath its surface.',
            offering: 'The power to kindle warmth in cold hearts, to see through illusions and lies, and to light the way in dark places. Members can sense danger before it arrives and inspire courage in others during difficult times.',
            resonance_note: 'Light a single candle and stare into the flame while whispering "I carry light in darkness." The stone calls to those who are willing to be a beacon for others.',
            color_primary: '#DC2626',
            color_secondary: '#F59E0B',
            emblem_url: null,
            status: 'active'
        },
        {
            id: 'clan5',
            name: 'Shadow Clan',
            stone_description: 'The Shadow Clan stone hides in the spaces between light and dark, in the quiet corners where secrets gather. It appears different to each person who sees it, but always seems to absorb light rather than reflect it.',
            offering: 'The gift of moving unseen when needed, of hearing secrets whispered in shadows, and of understanding the thoughts of creatures that prefer darkness. Members can find lost things and help others discover hidden truths about themselves.',
            resonance_note: 'Stand in your own shadow at midday and whisper "I embrace what is hidden." The stone reveals itself to those who are not afraid of mysteries.',
            color_primary: '#6B7280',
            color_secondary: '#4C1D95',
            emblem_url: null,
            status: 'active'
        }
    ];
}

function getDefaultLocations() {
    return [
        {
            id: 'loc1',
            name: 'The Hidden Pool of Hampstead Heath',
            latitude: 51.5558,
            longitude: -0.1608,
            magical_description: 'Deep within Hampstead Heath lies a pool that only appears at dawn and dusk, when the light is neither day nor night. The water reflects not your face, but your hearts deepest wish.',
            what_to_look_for: 'Look for the ancient oak tree with silver bark that seems to shimmer. The pool appears in its shadow when you whisper "Show me wonder."',
            image_url: null,
            status: 'active'
        },
        {
            id: 'loc2',
            name: 'The Whispering Gallery Secret Door',
            latitude: 51.5138,
            longitude: -0.0984,
            magical_description: 'In St. Pauls Cathedral famous Whispering Gallery, there is one stone that whispers back. Touch it with your ear pressed close, and you can hear the conversations of London magical creatures from across the centuries.',
            what_to_look_for: 'Find the stone that feels warm when all others are cool. Its marked with a tiny carving of a feather that only children can see clearly.',
            image_url: null,
            status: 'active'
        },
        {
            id: 'loc3',
            name: 'The Time Garden of Greenwich',
            latitude: 51.4769,
            longitude: -0.0005,
            magical_description: 'Where the Prime Meridian crosses through Greenwich Park, there grows a garden where each flower blooms in a different season. Here, time moves differently, and you might glimpse London as it was, or as it will be.',
            what_to_look_for: 'Stand exactly on the meridian line at sunset. Look for flowers that should not be blooming in the current season - they mark the entrance to the Time Garden.',
            image_url: null,
            status: 'active'
        }
    ];
}

console.log('🌐 Live website data loaded (external database)');