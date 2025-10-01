/**
 * Website Data - Simple Database Loading
 * Just loads content from database - elderly user just saves and it works
 */

// Get episodes
async function getEpisodes() {
    console.log('📖 Loading episodes from database...');
    
    try {
        const response = await fetch('tables/episodes?limit=100');
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Episodes from database:', result.data.length);
            return result.data.sort((a, b) => (b.created_at || 0) - (a.created_at || 0));
        }
    } catch (error) {
        console.error('Failed to load episodes:', error);
    }
    
    // Fallback if database fails
    return [
        {
            id: 'ep1',
            title: 'The Awakening of the Thames Stones',
            meta_description: 'Discover how the ancient clan stones first awakened along the Thames.',
            content: '<p>Long ago, when London was just a collection of villages along the Thames, five mysterious stones appeared overnight...</p>',
            created_at: Date.now(),
            image_url: null,
            page_type: 'episode',
            status: 'published'
        }
    ];
}

// Get clans
async function getClans() {
    console.log('🔮 Loading clans from database...');
    
    try {
        const response = await fetch('tables/clans?limit=100');
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Clans from database:', result.data.length);
            return result.data;
        }
    } catch (error) {
        console.error('Failed to load clans:', error);
    }
    
    // Fallback if database fails
    return [
        {
            id: 'clan1',
            name: 'River Clan',
            stone_description: 'The River Clan stone emerged from the Thames itself.',
            offering: 'The power to understand any language and flow like water.',
            resonance_note: 'Place your hand on flowing water and whisper "I hear your stories."',
            color_primary: '#0EA5E9',
            color_secondary: '#06B6D4',
            emblem_url: null,
            status: 'active'
        }
    ];
}

// Get locations
async function getLocations() {
    console.log('🗺️ Loading locations from database...');
    
    try {
        const response = await fetch('tables/locations?limit=100');
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Locations from database:', result.data.length);
            return result.data;
        }
    } catch (error) {
        console.error('Failed to load locations:', error);
    }
    
    // Fallback if database fails  
    return [
        {
            id: 'loc1',
            name: 'The Hidden Pool of Hampstead Heath',
            latitude: 51.5558,
            longitude: -0.1608,
            magical_description: 'A magical pool that appears at dawn and dusk.',
            what_to_look_for: 'Look for the ancient oak tree with silver bark.',
            image_url: null,
            status: 'active'
        }
    ];
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
        about_content: 'Welcome to a London where magic hides in plain sight.',
        footer_tagline: 'Where London magic lives ✨'
    };
}

console.log('🌐 Website data loaded (database only)');