/**
 * Simple Save System
 * Elderly user just clicks save - content appears everywhere
 */

// Save episode to database
async function saveEpisodeToDatabase(episode) {
    try {
        console.log('💾 Saving episode:', episode.title);
        
        // Try to update first
        let response = await fetch(`tables/episodes/${episode.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(episode)
        });
        
        // If update fails, create new
        if (!response.ok) {
            response = await fetch('tables/episodes', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(episode)
            });
        }
        
        if (response.ok) {
            console.log('✅ Episode saved successfully');
            return true;
        } else {
            console.error('❌ Failed to save episode');
            return false;
        }
    } catch (error) {
        console.error('❌ Error saving episode:', error);
        return false;
    }
}

// Save clan to database
async function saveClanToDatabase(clan) {
    try {
        console.log('💾 Saving clan:', clan.name);
        
        let response = await fetch(`tables/clans/${clan.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(clan)
        });
        
        if (!response.ok) {
            response = await fetch('tables/clans', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(clan)
            });
        }
        
        if (response.ok) {
            console.log('✅ Clan saved successfully');
            return true;
        } else {
            console.error('❌ Failed to save clan');
            return false;
        }
    } catch (error) {
        console.error('❌ Error saving clan:', error);
        return false;
    }
}

// Save location to database
async function saveLocationToDatabase(location) {
    try {
        console.log('💾 Saving location:', location.name);
        
        let response = await fetch(`tables/locations/${location.id}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(location)
        });
        
        if (!response.ok) {
            response = await fetch('tables/locations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(location)
            });
        }
        
        if (response.ok) {
            console.log('✅ Location saved successfully');
            return true;
        } else {
            console.error('❌ Failed to save location');
            return false;
        }
    } catch (error) {
        console.error('❌ Error saving location:', error);
        return false;
    }
}

// Delete from database
async function deleteFromDatabase(type, id) {
    try {
        const response = await fetch(`tables/${type}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('✅ Deleted successfully');
            return true;
        } else {
            console.error('❌ Failed to delete');
            return false;
        }
    } catch (error) {
        console.error('❌ Error deleting:', error);
        return false;
    }
}

console.log('💾 Simple save system loaded');