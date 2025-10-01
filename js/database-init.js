// Database Initialization for The Hidden World of London
// This script creates tables and populates them with default content

class DatabaseInitializer {
    constructor() {
        this.contentAPI = window.contentAPI;
        this.initComplete = false;
    }

    async initialize() {
        if (this.initComplete) {
            console.log('✅ Database already initialized');
            return true;
        }

        console.log('🔄 Initializing Hidden World database...');
        
        try {
            // Check if tables exist by trying to fetch data
            const tablesExist = await this.checkTablesExist();
            
            if (!tablesExist) {
                console.log('📋 Tables not found - creating with default content...');
                await this.createDefaultContent();
            }
            
            this.initComplete = true;
            console.log('✅ Database initialization complete!');
            return true;
            
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    async checkTablesExist() {
        try {
            // Try to fetch from each table
            await this.contentAPI.getEpisodes();
            await this.contentAPI.getClans();
            await this.contentAPI.getLocations();
            await this.contentAPI.getMainPageContent();
            return true;
        } catch (error) {
            return false;
        }
    }

    async createDefaultContent() {
        console.log('🎭 Creating default episodes...');
        await this.createDefaultEpisodes();
        
        console.log('🔮 Creating default clans...');
        await this.createDefaultClans();
        
        console.log('🗺️ Creating default locations...');
        await this.createDefaultLocations();
        
        console.log('📄 Creating default main page content...');
        await this.createDefaultMainPageContent();
    }

    async createDefaultEpisodes() {
        const episodes = [
            {
                id: 'ep1',
                title: 'The Awakening of the Thames Stones',
                meta_description: 'Discover how the ancient clan stones first awakened along the Thames, calling to children who could hear their magical whispers.',
                content: '<p>Long ago, when London was just a collection of villages along the Thames, five mysterious stones appeared overnight. Each stone hummed with a different magical frequency...</p><p>The River Clan stone emerged first, glowing blue-green like the deepest part of the Thames. Children walking along the river banks began to hear whispers in languages they had never learned...</p>',
                image_url: null,
                page_type: 'episode',
                status: 'published',
                episode_order: 1
            },
            {
                id: 'ep2',
                title: 'The Secret of Fleet River',
                meta_description: 'Follow Maya as she discovers the hidden Fleet River and learns why some waters remember everything.',
                content: '<p>Maya pressed her ear to the pavement near Blackfriars Bridge. Other children thought she was playing, but Maya could hear something magical...</p><p>Beneath the busy London streets, the Fleet River still flows, carrying messages between the clan stones. Maya was the first to hear its call in over fifty years...</p>',
                image_url: null,
                page_type: 'episode',
                status: 'published',
                episode_order: 2
            },
            {
                id: 'ep3',
                title: 'The Crystal Garden of Covent Garden',
                meta_description: 'Explore the hidden crystal garden where the Earth Clan stone teaches children to speak with growing things.',
                content: '<p>Behind the market stalls of Covent Garden, there is a garden that only appears to children who truly believe in magic...</p><p>Tommy discovered it when he was looking for his lost marble. But what he found instead was a garden where flowers sang and trees offered advice in rustling whispers...</p>',
                image_url: null,
                page_type: 'episode',
                status: 'published',
                episode_order: 3
            }
        ];

        for (const episode of episodes) {
            try {
                await this.contentAPI.post('episodes', episode);
                console.log(`✅ Created episode: ${episode.title}`);
            } catch (error) {
                console.warn(`⚠️ Episode "${episode.title}" might already exist:`, error.message);
            }
        }
    }

    async createDefaultClans() {
        const clans = [
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
                name: 'Earth Clan',
                stone_description: 'Born from the deep clay beneath London, this stone contains the memories of every tree that ever grew in the city. It glows with warm brown and green light, and smells like fresh soil after rain.',
                offering: 'The ability to make plants grow, to speak with animals, and to sense the health of the earth. Members can find lost things by asking the ground to remember, and they always know which direction leads home.',
                resonance_note: 'Plant something with your own hands and whisper "I help you grow." Care for it daily, and the stone will notice your dedication.',
                color_primary: '#16A34A',
                color_secondary: '#84CC16',
                emblem_url: null,
                status: 'active'
            },
            {
                id: 'clan3',
                name: 'Sky Clan',
                stone_description: 'This stone fell from the London sky on a night when all the stars seemed especially bright. It floats slightly above the ground and changes color like the sky throughout the day and night.',
                offering: 'The gift of flying in dreams that feel completely real, the ability to predict weather by feeling it in your bones, and the power to send messages on the wind. Members can breathe comfortably at any height.',
                resonance_note: 'On a windy day, spread your arms wide and say "I am ready to soar." If the wind lifts your hair and fills your heart with lightness, the stone has heard you.',
                color_primary: '#3B82F6',
                color_secondary: '#8B5CF6',
                emblem_url: null,
                status: 'active'
            },
            {
                id: 'clan4',
                name: 'Fire Clan',
                stone_description: 'Forged in the great fire of London and cooled in Thames water, this stone burns without consuming and lights without blinding. It pulses with warmth and casts dancing shadows that tell stories.',
                offering: 'The power to bring warmth to cold hearts, to light any darkness (including the darkness of sadness), and to forge unbreakable friendships. Members can create beautiful things from raw materials and their presence makes others feel brave.',
                resonance_note: 'Light a candle and speak your deepest wish to the flame. If the fire dances in response and fills you with courage, you have the Fire Clan\'s attention.',
                color_primary: '#EF4444',
                color_secondary: '#F59E0B',
                emblem_url: null,
                status: 'active'
            },
            {
                id: 'clan5',
                name: 'Shadow Clan',
                stone_description: 'The most mysterious stone, it appears as black as midnight but reflects all colors when moonlight touches it. It emerged during London\'s darkest hour and teaches that shadows are not evil, but necessary for light to have meaning.',
                offering: 'The ability to move unseen when needed, to understand hidden emotions, and to help others face their fears. Members can step into shadows to travel quickly across the city and they see clearly in complete darkness.',
                resonance_note: 'Stand alone in a shadow and say "I am not afraid of the dark within me or around me." If you feel peaceful rather than frightened, the Shadow Clan recognizes your wisdom.',
                color_primary: '#6366F1',
                color_secondary: '#8B5CF6',
                emblem_url: null,
                status: 'active'
            }
        ];

        for (const clan of clans) {
            try {
                await this.contentAPI.post('clans', clan);
                console.log(`✅ Created clan: ${clan.name}`);
            } catch (error) {
                console.warn(`⚠️ Clan "${clan.name}" might already exist:`, error.message);
            }
        }
    }

    async createDefaultLocations() {
        const locations = [
            {
                id: 'loc1',
                name: "Cleopatra's Needle",
                latitude: 51.5081,
                longitude: -0.1195,
                magical_description: "Here, where Cleopatra's Needle pierces the London sky, the ancient Egyptian magic still hums in the stone. The Thames whispers secrets of empires past, and children who touch the bronze sphinxes at sunset can hear hieroglyphs telling their stories.",
                what_to_look_for: "Look for the bronze sphinxes at the base - they have tiny scratches that form letters in ancient languages. Notice how the light changes around the obelisk at different times of day, and listen for the sound of ancient chanting on windy afternoons.",
                image_url: null,
                status: 'active'
            },
            {
                id: 'loc2',
                name: "Fleet River",
                latitude: 51.5134,
                longitude: -0.1044,
                magical_description: "The Fleet River still flows beneath your feet, carrying messages between the clan stones. Listen carefully to the stones—they remember when this was a rushing waterway that powered London's first mills and carried away the city's secrets.",
                what_to_look_for: "Find the Fleet River marker near the bridge, and notice the subtle sound of water that shouldn't be there. Place your ear to the ground near the marker - children with clan stone connections can hear the river's whispered messages.",
                image_url: null,
                status: 'active'
            },
            {
                id: 'loc3',
                name: "Blackfriars Bridge",
                latitude: 51.511,
                longitude: -0.103,
                magical_description: "Where the ancient bridge crosses the Fleet of memory, two worlds meet. The stones here have witnessed a thousand years of London's secrets, from Roman roads to medieval monasteries to the magical awakening of the clan stones.",
                what_to_look_for: "Stand on the bridge and feel for the vibration beneath—the old river's pulse still beats strong. Look for the small carved symbols on the bridge stones that only appear when the light is just right, usually just after rain.",
                image_url: null,
                status: 'active'
            }
        ];

        for (const location of locations) {
            try {
                await this.contentAPI.post('locations', location);
                console.log(`✅ Created location: ${location.name}`);
            } catch (error) {
                console.warn(`⚠️ Location "${location.name}" might already exist:`, error.message);
            }
        }
    }

    async createDefaultMainPageContent() {
        const mainPageSections = [
            {
                id: 'hero-title',
                section: 'hero',
                title: 'There is a <span class="magical-text sparkle-effect">✨ hidden world ✨</span><br>beneath London...'
            },
            {
                id: 'hero-subtitle',
                section: 'hero',
                subtitle: '🏰 Where ancient stones hold memories, 🌊 forgotten rivers whisper secrets, and the city\'s ✨ magical heart ✨ beats beneath the cobblestones. 🗝️'
            },
            {
                id: 'episodes-title',
                section: 'episodes',
                title: '📚 Recent Episodes'
            },
            {
                id: 'episodes-description',
                section: 'episodes',
                description: 'Follow the unfolding story through glimpses and fragments from the hidden world'
            },
            {
                id: 'stones-title',
                section: 'stones',
                title: '🔮 The Clan Stones'
            },
            {
                id: 'stones-description',
                section: 'stones',
                description: 'Each clan stone carries the essence of London\'s hidden elements. Choose your path and discover what the stones may offer you.'
            },
            {
                id: 'london-title',
                section: 'london',
                title: '🗺️ Hidden London'
            },
            {
                id: 'london-description',
                section: 'london',
                description: 'Discover the magical locations scattered across London where the veil between worlds grows thin'
            },
            {
                id: 'about-content',
                section: 'about',
                content: '<div class="text-lg text-slate-300 space-y-6 leading-relaxed"><p>The Hidden World of London is a magical journey of discovery, designed to spark curiosity and wonder in children and adults alike. Through painted stones, hidden locations, and mythical storytelling, we invite you to see London through new eyes.</p><p>Our project celebrates the rich history and mythology of London while creating new stories for the next generation. Every stone is painted with non-toxic materials, every location is safe to explore, and every story is crafted with kindness and imagination.</p><p class="text-london-gold font-semibold">This is London as you\'ve never seen it before—magical, mysterious, and waiting for you to discover its secrets.</p></div><div class="mt-12"><h3 class="text-xl font-cinzel font-semibold mb-4">For Parents & Guardians</h3><p class="text-slate-300">All activities are designed with safety in mind. Stones are painted with child-safe, non-toxic materials. Location clues encourage observation and imagination without requiring dangerous exploration. This is a project about wonder, discovery, and the magic that surrounds us in everyday London.</p></div>'
            },
            {
                id: 'footer-tagline',
                section: 'footer',
                title: 'Where magic meets the everyday, and London reveals its deepest secrets'
            }
        ];

        for (const section of mainPageSections) {
            try {
                await this.contentAPI.post('mainpage_content', section);
                console.log(`✅ Created main page section: ${section.id}`);
            } catch (error) {
                console.warn(`⚠️ Main page section "${section.id}" might already exist:`, error.message);
            }
        }
    }
}

// Initialize database when this script loads
window.databaseInit = new DatabaseInitializer();

// Auto-initialize when API is ready
document.addEventListener('DOMContentLoaded', function() {
    if (window.contentAPI) {
        window.databaseInit.initialize().catch(console.error);
    } else {
        // Wait for API to load
        setTimeout(() => {
            if (window.contentAPI) {
                window.databaseInit.initialize().catch(console.error);
            }
        }, 1000);
    }
});

console.log('🗃️ Database initializer loaded');