/**
 * Admin Data Updater
 * Updates JSON files when content is changed in admin
 */

// Update JSON files with current localStorage data
async function updateJSONFiles() {
    console.log('🔄 Updating JSON files...');
    
    try {
        // Get current data from localStorage
        const episodes = JSON.parse(localStorage.getItem('hiddenworld_episodes') || '[]');
        const clans = JSON.parse(localStorage.getItem('hiddenworld_clans') || '[]');
        const locations = JSON.parse(localStorage.getItem('hiddenworld_locations') || '[]');
        
        // Update episodes JSON
        await updateFile('data/episodes.json', episodes);
        console.log('✅ Updated episodes.json');
        
        // Update clans JSON  
        await updateFile('data/clans.json', clans);
        console.log('✅ Updated clans.json');
        
        // Update locations JSON
        await updateFile('data/locations.json', locations);
        console.log('✅ Updated locations.json');
        
        console.log('🎉 All JSON files updated successfully!');
        
        // Trigger a refresh of the main website
        if (window.opener) {
            window.opener.postMessage('contentUpdated', '*');
        }
        
    } catch (error) {
        console.error('❌ Failed to update JSON files:', error);
        // Show user-friendly message
        showError('Failed to sync content. Changes saved locally but may not appear on other devices.');
    }
}

// Update a specific JSON file
async function updateFile(filepath, data) {
    // In a real environment, this would make a POST request to update the file
    // For now, we'll use the RESTful API if available
    try {
        const response = await fetch('api/update-file', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                filepath: filepath,
                data: data
            })
        });
        
        if (!response.ok) {
            throw new Error('File update failed');
        }
        
        return true;
    } catch (error) {
        console.warn('⚠️ JSON file update not available, content remains local only');
        return false;
    }
}

// Enhanced save functions that update JSON files
async function saveEpisodeWithSync(episode) {
    // Save to localStorage first
    const episodes = JSON.parse(localStorage.getItem('hiddenworld_episodes') || '[]');
    const existingIndex = episodes.findIndex(ep => ep.id === episode.id);
    
    if (existingIndex >= 0) {
        episodes[existingIndex] = episode;
    } else {
        episodes.push(episode);
    }
    
    localStorage.setItem('hiddenworld_episodes', JSON.stringify(episodes));
    
    // Update JSON file
    await updateFile('data/episodes.json', episodes);
}

async function saveClanWithSync(clan) {
    // Save to localStorage first
    const clans = JSON.parse(localStorage.getItem('hiddenworld_clans') || '[]');
    const existingIndex = clans.findIndex(c => c.id === clan.id);
    
    if (existingIndex >= 0) {
        clans[existingIndex] = clan;
    } else {
        clans.push(clan);
    }
    
    localStorage.setItem('hiddenworld_clans', JSON.stringify(clans));
    
    // Update JSON file
    await updateFile('data/clans.json', clans);
}

async function saveLocationWithSync(location) {
    // Save to localStorage first
    const locations = JSON.parse(localStorage.getItem('hiddenworld_locations') || '[]');
    const existingIndex = locations.findIndex(l => l.id === location.id);
    
    if (existingIndex >= 0) {
        locations[existingIndex] = location;
    } else {
        locations.push(location);
    }
    
    localStorage.setItem('hiddenworld_locations', JSON.stringify(locations));
    
    // Update JSON file
    await updateFile('data/locations.json', locations);
}

async function deleteEpisodeWithSync(episodeId) {
    // Remove from localStorage
    const episodes = JSON.parse(localStorage.getItem('hiddenworld_episodes') || '[]');
    const filtered = episodes.filter(ep => ep.id !== episodeId);
    localStorage.setItem('hiddenworld_episodes', JSON.stringify(filtered));
    
    // Update JSON file
    await updateFile('data/episodes.json', filtered);
}

async function deleteClanWithSync(clanId) {
    // Remove from localStorage
    const clans = JSON.parse(localStorage.getItem('hiddenworld_clans') || '[]');
    const filtered = clans.filter(c => c.id !== clanId);
    localStorage.setItem('hiddenworld_clans', JSON.stringify(filtered));
    
    // Update JSON file
    await updateFile('data/clans.json', filtered);
}

async function deleteLocationWithSync(locationId) {
    // Remove from localStorage
    const locations = JSON.parse(localStorage.getItem('hiddenworld_locations') || '[]');
    const filtered = locations.filter(l => l.id !== locationId);
    localStorage.setItem('hiddenworld_locations', JSON.stringify(filtered));
    
    // Update JSON file
    await updateFile('data/locations.json', filtered);
}

console.log('📁 Admin data updater loaded');