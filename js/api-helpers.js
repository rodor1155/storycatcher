// API Helper Functions for The Hidden World of London
// Replaces localStorage with RESTful Table API for multi-user support

// API Base Functions
class HiddenWorldAPI {
    constructor() {
        this.baseURL = 'tables/';
    }

    // Generic GET request
    async get(table, recordId = null, params = {}) {
        try {
            let url = `${this.baseURL}${table}`;
            if (recordId) {
                url += `/${recordId}`;
            } else if (Object.keys(params).length > 0) {
                const searchParams = new URLSearchParams(params);
                url += `?${searchParams.toString()}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API GET Error (${table}):`, error);
            throw error;
        }
    }

    // Generic POST request
    async post(table, data) {
        try {
            const response = await fetch(`${this.baseURL}${table}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API POST Error (${table}):`, error);
            throw error;
        }
    }

    // Generic PUT request
    async put(table, recordId, data) {
        try {
            const response = await fetch(`${this.baseURL}${table}/${recordId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API PUT Error (${table}):`, error);
            throw error;
        }
    }

    // Generic DELETE request
    async delete(table, recordId) {
        try {
            const response = await fetch(`${this.baseURL}${table}/${recordId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            console.error(`API DELETE Error (${table}):`, error);
            throw error;
        }
    }
}

// Content-Specific API Functions
class ContentAPI extends HiddenWorldAPI {
    
    // Episodes
    async getEpisodes(params = { limit: 100 }) {
        const response = await this.get('episodes', null, params);
        // Sort by episode_order for consistent display
        if (response.data) {
            response.data.sort((a, b) => (a.episode_order || 0) - (b.episode_order || 0));
        }
        return response.data || [];
    }

    async getEpisode(episodeId) {
        return await this.get('episodes', episodeId);
    }

    async createEpisode(episodeData) {
        // Auto-assign episode order if not provided
        if (!episodeData.episode_order) {
            const episodes = await this.getEpisodes();
            episodeData.episode_order = episodes.length + 1;
        }
        return await this.post('episodes', episodeData);
    }

    async updateEpisode(episodeId, episodeData) {
        return await this.put('episodes', episodeId, episodeData);
    }

    async deleteEpisode(episodeId) {
        return await this.delete('episodes', episodeId);
    }

    async reorderEpisodes(reorderedEpisodes) {
        // Update episode_order for all episodes
        const promises = reorderedEpisodes.map((episode, index) => {
            return this.put('episodes', episode.id, {
                ...episode,
                episode_order: index + 1
            });
        });
        
        return await Promise.all(promises);
    }

    // Clans
    async getClans(params = { limit: 100 }) {
        const response = await this.get('clans', null, params);
        return response.data || [];
    }

    async getClan(clanId) {
        return await this.get('clans', clanId);
    }

    async createClan(clanData) {
        return await this.post('clans', clanData);
    }

    async updateClan(clanId, clanData) {
        return await this.put('clans', clanId, clanData);
    }

    async deleteClan(clanId) {
        return await this.delete('clans', clanId);
    }

    // Locations
    async getLocations(params = { limit: 100 }) {
        const response = await this.get('locations', null, params);
        return response.data || [];
    }

    async getLocation(locationId) {
        return await this.get('locations', locationId);
    }

    async createLocation(locationData) {
        return await this.post('locations', locationData);
    }

    async updateLocation(locationId, locationData) {
        return await this.put('locations', locationId, locationData);
    }

    async deleteLocation(locationId) {
        return await this.delete('locations', locationId);
    }

    // Main Page Content
    async getMainPageContent(params = { limit: 100 }) {
        const response = await this.get('mainpage_content', null, params);
        
        // Convert array back to structured object
        const content = {
            hero: { title: '', subtitle: '' },
            episodes: { title: '', description: '' },
            stones: { title: '', description: '' },
            london: { title: '', description: '' },
            about: { content: '' },
            footer: { tagline: '' }
        };

        if (response.data) {
            response.data.forEach(item => {
                if (item.section && content[item.section]) {
                    if (item.title) content[item.section].title = item.title;
                    if (item.subtitle) content[item.section].subtitle = item.subtitle;
                    if (item.description) content[item.section].description = item.description;
                    if (item.content) content[item.section].content = item.content;
                }
            });
        }

        return content;
    }

    async updateMainPageContent(contentData) {
        const updates = [];
        
        // Convert structured object back to individual records
        for (const [section, data] of Object.entries(contentData)) {
            if (section === 'updated_at') continue;
            
            for (const [field, value] of Object.entries(data)) {
                if (value) {
                    const recordId = `${section}-${field}`;
                    const updateData = {
                        id: recordId,
                        section: section,
                        [field]: value
                    };
                    
                    updates.push(this.updateMainPageRecord(recordId, updateData));
                }
            }
        }
        
        return await Promise.all(updates);
    }

    async updateMainPageRecord(recordId, data) {
        try {
            // Try to update existing record
            return await this.put('mainpage_content', recordId, data);
        } catch (error) {
            // If record doesn't exist, create it
            if (error.message.includes('404')) {
                return await this.post('mainpage_content', data);
            }
            throw error;
        }
    }
}

// Global API instance
window.contentAPI = new ContentAPI();

// Migration helper - check if we need to migrate from localStorage
async function checkForLocalStorageMigration() {
    const localStorage_keys = [
        'hiddenworld_episodes',
        'hiddenworld_clans', 
        'hiddenworld_locations',
        'hiddenworld_mainpage_content'
    ];
    
    let hasLocalData = false;
    for (const key of localStorage_keys) {
        if (localStorage.getItem(key)) {
            hasLocalData = true;
            break;
        }
    }
    
    if (hasLocalData) {
        const migrate = confirm(
            'Found existing content in local storage. Would you like to migrate it to the cloud database?\n\n' +
            'This will make your content accessible from any device and allow collaboration.\n\n' +
            'Click OK to migrate, or Cancel to use cloud database only.'
        );
        
        if (migrate) {
            await migrateFromLocalStorage();
        }
    }
}

// Migration function
async function migrateFromLocalStorage() {
    console.log('🔄 Migrating content from localStorage to cloud database...');
    
    try {
        // Migrate episodes
        const episodes = JSON.parse(localStorage.getItem('hiddenworld_episodes') || '[]');
        for (let i = 0; i < episodes.length; i++) {
            episodes[i].episode_order = i + 1;
            await window.contentAPI.createEpisode(episodes[i]);
        }
        console.log(`✅ Migrated ${episodes.length} episodes`);
        
        // Migrate clans
        const clans = JSON.parse(localStorage.getItem('hiddenworld_clans') || '[]');
        for (const clan of clans) {
            await window.contentAPI.createClan(clan);
        }
        console.log(`✅ Migrated ${clans.length} clans`);
        
        // Migrate locations
        const locations = JSON.parse(localStorage.getItem('hiddenworld_locations') || '[]');
        for (const location of locations) {
            await window.contentAPI.createLocation(location);
        }
        console.log(`✅ Migrated ${locations.length} locations`);
        
        // Migrate main page content
        const mainPageContent = JSON.parse(localStorage.getItem('hiddenworld_mainpage_content') || '{}');
        if (Object.keys(mainPageContent).length > 0) {
            await window.contentAPI.updateMainPageContent(mainPageContent);
            console.log(`✅ Migrated main page content`);
        }
        
        // Clear localStorage after successful migration
        const clearLocal = confirm(
            'Migration completed successfully! 🎉\n\n' +
            'Would you like to clear the old local storage data?\n' +
            '(Recommended - your content is now safely stored in the cloud)'
        );
        
        if (clearLocal) {
            localStorage.removeItem('hiddenworld_episodes');
            localStorage.removeItem('hiddenworld_clans');
            localStorage.removeItem('hiddenworld_locations');
            localStorage.removeItem('hiddenworld_mainpage_content');
            console.log('🧹 Cleared old localStorage data');
        }
        
        alert('Content migration completed successfully! Your content is now stored in the cloud and accessible from any device.');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        alert('Migration failed: ' + error.message + '\n\nYou can try again later or contact support.');
    }
}

console.log('🌐 API Helpers loaded - ready for multi-user content management!');