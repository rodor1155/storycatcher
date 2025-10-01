/**
 * Universal Data Manager
 * Handles both localStorage (for immediate feedback) and database (for cross-device sync)
 * Database is the primary source, localStorage is used as fallback/cache
 */

class DataManager {
    constructor() {
        this.useDatabase = true; // Primary mode: use database
        this.cache = new Map(); // In-memory cache for performance
        
        // Storage keys for localStorage fallback
        this.STORAGE_KEYS = {
            episodes: 'hiddenworld_episodes',
            clans: 'hiddenworld_clans', 
            locations: 'hiddenworld_locations',
            main_page_content: 'hiddenworld_mainpage_content'
        };
    }

    // === EPISODES ===
    async getEpisodes() {
        try {
            if (this.useDatabase) {
                const response = await fetch('tables/episodes');
                if (response.ok) {
                    const result = await response.json();
                    console.log('📖 Loaded episodes from database:', result.data.length);
                    return result.data.map(this.convertFromDb);
                }
            }
        } catch (error) {
            console.warn('⚠️ Database unavailable, using localStorage:', error);
        }
        
        // Fallback to localStorage
        return this.getFromLocalStorage('episodes');
    }

    async saveEpisode(episode) {
        try {
            if (this.useDatabase) {
                const dbEpisode = this.convertToDb(episode);
                
                // Check if episode exists
                const existing = await this.getEpisodeById(episode.id);
                
                let response;
                if (existing) {
                    // Update existing episode
                    response = await fetch(`tables/episodes/${episode.id}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(dbEpisode)
                    });
                } else {
                    // Create new episode
                    response = await fetch('tables/episodes', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({...dbEpisode, id: episode.id})
                    });
                }
                
                if (response.ok) {
                    console.log('✅ Episode saved to database:', episode.id);
                    // Also save to localStorage as backup
                    this.saveToLocalStorage('episodes', episode);
                    return await response.json();
                }
            }
        } catch (error) {
            console.warn('⚠️ Database save failed, using localStorage only:', error);
        }
        
        // Fallback to localStorage
        this.saveToLocalStorage('episodes', episode);
        return episode;
    }

    async getEpisodeById(episodeId) {
        try {
            if (this.useDatabase) {
                const response = await fetch(`tables/episodes/${episodeId}`);
                if (response.ok) {
                    return this.convertFromDb(await response.json());
                }
            }
        } catch (error) {
            console.warn('⚠️ Database lookup failed:', error);
        }
        
        // Fallback to localStorage
        const episodes = this.getFromLocalStorage('episodes');
        return episodes.find(ep => ep.id === episodeId);
    }

    async deleteEpisode(episodeId) {
        try {
            if (this.useDatabase) {
                const response = await fetch(`tables/episodes/${episodeId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    console.log('🗑️ Episode deleted from database:', episodeId);
                }
            }
        } catch (error) {
            console.warn('⚠️ Database delete failed:', error);
        }
        
        // Also remove from localStorage
        this.removeFromLocalStorage('episodes', episodeId);
    }

    // === CLANS ===
    async getClans() {
        try {
            if (this.useDatabase) {
                const response = await fetch('tables/clans');
                if (response.ok) {
                    const result = await response.json();
                    console.log('🔮 Loaded clans from database:', result.data.length);
                    return result.data.map(this.convertFromDb);
                }
            }
        } catch (error) {
            console.warn('⚠️ Database unavailable, using localStorage:', error);
        }
        
        return this.getFromLocalStorage('clans');
    }

    async saveClan(clan) {
        try {
            if (this.useDatabase) {
                const dbClan = this.convertToDb(clan);
                
                const existing = await this.getClanById(clan.id);
                let response;
                
                if (existing) {
                    response = await fetch(`tables/clans/${clan.id}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(dbClan)
                    });
                } else {
                    response = await fetch('tables/clans', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({...dbClan, id: clan.id})
                    });
                }
                
                if (response.ok) {
                    console.log('✅ Clan saved to database:', clan.id);
                    this.saveToLocalStorage('clans', clan);
                    return await response.json();
                }
            }
        } catch (error) {
            console.warn('⚠️ Database save failed:', error);
        }
        
        this.saveToLocalStorage('clans', clan);
        return clan;
    }

    async getClanById(clanId) {
        try {
            if (this.useDatabase) {
                const response = await fetch(`tables/clans/${clanId}`);
                if (response.ok) {
                    return this.convertFromDb(await response.json());
                }
            }
        } catch (error) {
            console.warn('⚠️ Database lookup failed:', error);
        }
        
        const clans = this.getFromLocalStorage('clans');
        return clans.find(clan => clan.id === clanId);
    }

    async deleteClan(clanId) {
        try {
            if (this.useDatabase) {
                await fetch(`tables/clans/${clanId}`, { method: 'DELETE' });
            }
        } catch (error) {
            console.warn('⚠️ Database delete failed:', error);
        }
        
        this.removeFromLocalStorage('clans', clanId);
    }

    // === LOCATIONS ===
    async getLocations() {
        try {
            if (this.useDatabase) {
                const response = await fetch('tables/locations');
                if (response.ok) {
                    const result = await response.json();
                    console.log('🗺️ Loaded locations from database:', result.data.length);
                    return result.data.map(this.convertFromDb);
                }
            }
        } catch (error) {
            console.warn('⚠️ Database unavailable, using localStorage:', error);
        }
        
        return this.getFromLocalStorage('locations');
    }

    async saveLocation(location) {
        try {
            if (this.useDatabase) {
                const dbLocation = this.convertToDb(location);
                
                const existing = await this.getLocationById(location.id);
                let response;
                
                if (existing) {
                    response = await fetch(`tables/locations/${location.id}`, {
                        method: 'PUT',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(dbLocation)
                    });
                } else {
                    response = await fetch('tables/locations', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({...dbLocation, id: location.id})
                    });
                }
                
                if (response.ok) {
                    console.log('✅ Location saved to database:', location.id);
                    this.saveToLocalStorage('locations', location);
                    return await response.json();
                }
            }
        } catch (error) {
            console.warn('⚠️ Database save failed:', error);
        }
        
        this.saveToLocalStorage('locations', location);
        return location;
    }

    async getLocationById(locationId) {
        try {
            if (this.useDatabase) {
                const response = await fetch(`tables/locations/${locationId}`);
                if (response.ok) {
                    return this.convertFromDb(await response.json());
                }
            }
        } catch (error) {
            console.warn('⚠️ Database lookup failed:', error);
        }
        
        const locations = this.getFromLocalStorage('locations');
        return locations.find(loc => loc.id === locationId);
    }

    async deleteLocation(locationId) {
        try {
            if (this.useDatabase) {
                await fetch(`tables/locations/${locationId}`, { method: 'DELETE' });
            }
        } catch (error) {
            console.warn('⚠️ Database delete failed:', error);
        }
        
        this.removeFromLocalStorage('locations', locationId);
    }

    // === UTILITY METHODS ===
    
    convertToDb(item) {
        // Convert from localStorage format to database format
        const converted = {...item};
        delete converted.created_at; // Let database handle timestamps
        delete converted.updated_at;
        return converted;
    }
    
    convertFromDb(item) {
        // Convert from database format to localStorage format
        return {
            ...item,
            created_at: item.created_at || Date.now(),
            updated_at: item.updated_at || Date.now()
        };
    }

    getFromLocalStorage(type) {
        const stored = localStorage.getItem(this.STORAGE_KEYS[type]);
        if (stored) {
            return JSON.parse(stored);
        }
        return this.getDefaultData(type);
    }

    saveToLocalStorage(type, item) {
        const items = this.getFromLocalStorage(type);
        const index = items.findIndex(existing => existing.id === item.id);
        
        if (index >= 0) {
            items[index] = item;
        } else {
            items.push(item);
        }
        
        localStorage.setItem(this.STORAGE_KEYS[type], JSON.stringify(items));
    }

    removeFromLocalStorage(type, itemId) {
        const items = this.getFromLocalStorage(type);
        const filtered = items.filter(item => item.id !== itemId);
        localStorage.setItem(this.STORAGE_KEYS[type], JSON.stringify(filtered));
    }

    getDefaultData(type) {
        const defaults = {
            episodes: [
                {
                    id: 'ep1',
                    title: 'The Awakening of the Thames Stones',
                    meta_description: 'Discover how the ancient clan stones first awakened along the Thames, calling to children who could hear their magical whispers.',
                    content: '<p>Long ago, when London was just a collection of villages along the Thames, five mysterious stones appeared overnight. Each stone hummed with a different magical frequency...</p><p>The River Clan stone emerged first, glowing blue-green like the deepest part of the Thames. Children walking along the river banks began to hear whispers in languages they had never learned...</p>',
                    created_at: Date.now() - 86400000,
                    image_url: null,
                    page_type: 'episode',
                    status: 'published'
                }
            ],
            clans: [
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
                }
            ],
            locations: [
                {
                    id: 'loc1',
                    name: 'The Hidden Pool of Hampstead Heath',
                    latitude: 51.5558,
                    longitude: -0.1608,
                    magical_description: 'Deep within Hampstead Heath lies a pool that only appears at dawn and dusk, when the light is neither day nor night. The water reflects not your face, but your heart\'s deepest wish.',
                    what_to_look_for: 'Look for the ancient oak tree with silver bark that seems to shimmer. The pool appears in its shadow when you whisper "Show me wonder."',
                    image_url: null,
                    status: 'active'
                }
            ],
            main_page_content: []
        };
        
        return defaults[type] || [];
    }
}

// Create global instance
window.dataManager = new DataManager();

console.log('🌐 Data Manager initialized with database support');