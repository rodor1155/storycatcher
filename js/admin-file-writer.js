/**
 * Admin File Writer
 * Updates JSON files when admin makes changes
 */

class AdminFileWriter {
    constructor() {
        this.baseUrl = '';
    }
    
    // Save episodes to JSON file
    async saveEpisodesToFile(episodes) {
        try {
            console.log('💾 Saving episodes to file...', episodes.length);
            
            // Also save to localStorage as backup
            localStorage.setItem('hiddenworld_episodes', JSON.stringify(episodes));
            
            // Try to update the JSON file via database
            if (window.dataManager && window.dataManager.databaseAvailable) {
                // If database is available, save each episode
                for (const episode of episodes) {
                    await window.dataManager.saveEpisode(episode);
                }
                console.log('✅ Episodes saved to database');
            } else {
                console.log('ℹ️ Database not available, saved to localStorage only');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to save episodes:', error.message);
            return false;
        }
    }
    
    // Save clans to JSON file
    async saveClansToFile(clans) {
        try {
            console.log('💾 Saving clans to file...', clans.length);
            
            // Also save to localStorage as backup
            localStorage.setItem('hiddenworld_clans', JSON.stringify(clans));
            
            // Try to update via database
            if (window.dataManager && window.dataManager.databaseAvailable) {
                for (const clan of clans) {
                    await window.dataManager.saveClan(clan);
                }
                console.log('✅ Clans saved to database');
            } else {
                console.log('ℹ️ Database not available, saved to localStorage only');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to save clans:', error.message);
            return false;
        }
    }
    
    // Save locations to JSON file
    async saveLocationsToFile(locations) {
        try {
            console.log('💾 Saving locations to file...', locations.length);
            
            // Also save to localStorage as backup
            localStorage.setItem('hiddenworld_locations', JSON.stringify(locations));
            
            // Try to update via database
            if (window.dataManager && window.dataManager.databaseAvailable) {
                for (const location of locations) {
                    await window.dataManager.saveLocation(location);
                }
                console.log('✅ Locations saved to database');
            } else {
                console.log('ℹ️ Database not available, saved to localStorage only');
            }
            
            return true;
        } catch (error) {
            console.error('❌ Failed to save locations:', error.message);
            return false;
        }
    }
    
    // Update website data bridge
    updateWebsiteData(type, data) {
        // This function will trigger the main website to refresh
        try {
            // Send message to main window if it's open
            if (window.opener && !window.opener.closed) {
                window.opener.postMessage('contentUpdated', '*');
            }
            
            // Also try parent window
            if (window.parent && window.parent !== window) {
                window.parent.postMessage('contentUpdated', '*');
            }
            
        } catch (error) {
            console.log('ℹ️ Could not notify main window:', error.message);
        }
    }
}

// Create global instance
window.adminFileWriter = new AdminFileWriter();

console.log('📁 Admin File Writer initialized');