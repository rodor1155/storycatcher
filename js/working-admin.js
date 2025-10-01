// Working Admin System - Simple and Reliable
const ADMIN_PASSWORD = 'hiddenworld2024';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (isLoggedIn()) {
        showDashboard();
        loadAllContent();
    }
});

// Login function
function login() {
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('hiddenworld_admin_auth', 'true');
        showDashboard();
        loadAllContent();
    } else {
        document.getElementById('login-error').classList.remove('hidden');
        document.getElementById('password').value = '';
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    login();
}

// Check if logged in
function isLoggedIn() {
    return localStorage.getItem('hiddenworld_admin_auth') === 'true';
}

// Show dashboard
function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    showTab('episodes');
}

// Logout
function logout() {
    localStorage.removeItem('hiddenworld_admin_auth');
    location.reload();
}

// Show tabs
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // Update button states
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.remove('bg-gray-200', 'text-gray-700');
    document.querySelector(`[onclick="showTab('${tabName}')"]`).classList.add('bg-blue-500', 'text-white');
}

// Load all content from database
async function loadAllContent() {
    await loadEpisodes();
    await loadClans(); 
    await loadLocations();
}

// EPISODES
async function loadEpisodes() {
    try {
        const response = await fetch('tables/episodes?limit=100');
        const result = await response.json();
        const episodes = result.data || [];
        
        const container = document.getElementById('episodes-list');
        
        if (episodes.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">No episodes yet. Add your first episode!</p>';
            return;
        }
        
        container.innerHTML = episodes.map(episode => `
            <div class="bg-white p-4 border rounded-lg shadow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-800">${episode.title}</h3>
                    <div class="flex space-x-2">
                        <button onclick="editEpisode('${episode.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                        <button onclick="deleteEpisode('${episode.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                    </div>
                </div>
                <p class="text-gray-600 text-sm">${episode.meta_description}</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load episodes:', error);
        document.getElementById('episodes-list').innerHTML = '<p class="text-red-500">Failed to load episodes</p>';
    }
}

async function saveEpisode() {
    const title = document.getElementById('episode-title').value;
    const description = document.getElementById('episode-description').value;
    const content = document.getElementById('episode-content').value;
    
    if (!title || !description || !content) {
        alert('Please fill in all fields');
        return;
    }
    
    const episode = {
        id: 'ep' + Date.now(),
        title: title,
        meta_description: description,
        content: content,
        created_at: Date.now(),
        page_type: 'episode',
        status: 'published'
    };
    
    try {
        const response = await fetch('tables/episodes', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(episode)
        });
        
        if (response.ok) {
            alert('Episode saved! It will appear on the website immediately.');
            // Clear form
            document.getElementById('episode-title').value = '';
            document.getElementById('episode-description').value = '';
            document.getElementById('episode-content').value = '';
            // Reload list
            loadEpisodes();
        } else {
            alert('Failed to save episode');
        }
    } catch (error) {
        alert('Error saving episode: ' + error.message);
    }
}

async function deleteEpisode(episodeId) {
    if (!confirm('Are you sure you want to delete this episode?')) return;
    
    try {
        const response = await fetch(`tables/episodes/${episodeId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Episode deleted!');
            loadEpisodes();
        } else {
            alert('Failed to delete episode');
        }
    } catch (error) {
        alert('Error deleting episode: ' + error.message);
    }
}

// CLANS
async function loadClans() {
    try {
        const response = await fetch('tables/clans?limit=100');
        const result = await response.json();
        const clans = result.data || [];
        
        const container = document.getElementById('clans-list');
        
        if (clans.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">No clans yet. Add your first clan!</p>';
            return;
        }
        
        container.innerHTML = clans.map(clan => `
            <div class="bg-white p-4 border rounded-lg shadow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-800">${clan.name}</h3>
                    <div class="flex space-x-2">
                        <button onclick="editClan('${clan.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                        <button onclick="deleteClan('${clan.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                    </div>
                </div>
                <p class="text-gray-600 text-sm">${clan.stone_description.substring(0, 100)}...</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load clans:', error);
        document.getElementById('clans-list').innerHTML = '<p class="text-red-500">Failed to load clans</p>';
    }
}

async function saveClan() {
    const name = document.getElementById('clan-name').value;
    const origin = document.getElementById('clan-origin').value;
    const powers = document.getElementById('clan-powers').value;
    const connection = document.getElementById('clan-connection').value;
    const color1 = document.getElementById('clan-color1').value;
    const color2 = document.getElementById('clan-color2').value;
    
    if (!name || !origin || !powers || !connection) {
        alert('Please fill in all fields');
        return;
    }
    
    const clan = {
        id: 'clan' + Date.now(),
        name: name,
        stone_description: origin,
        offering: powers,
        resonance_note: connection,
        color_primary: color1,
        color_secondary: color2,
        status: 'active'
    };
    
    try {
        const response = await fetch('tables/clans', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(clan)
        });
        
        if (response.ok) {
            alert('Clan saved! It will appear on the website immediately.');
            // Clear form
            document.getElementById('clan-name').value = '';
            document.getElementById('clan-origin').value = '';
            document.getElementById('clan-powers').value = '';
            document.getElementById('clan-connection').value = '';
            // Reload list
            loadClans();
        } else {
            alert('Failed to save clan');
        }
    } catch (error) {
        alert('Error saving clan: ' + error.message);
    }
}

async function deleteClan(clanId) {
    if (!confirm('Are you sure you want to delete this clan?')) return;
    
    try {
        const response = await fetch(`tables/clans/${clanId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Clan deleted!');
            loadClans();
        } else {
            alert('Failed to delete clan');
        }
    } catch (error) {
        alert('Error deleting clan: ' + error.message);
    }
}

// LOCATIONS
async function loadLocations() {
    try {
        const response = await fetch('tables/locations?limit=100');
        const result = await response.json();
        const locations = result.data || [];
        
        const container = document.getElementById('locations-list');
        
        if (locations.length === 0) {
            container.innerHTML = '<p class="text-gray-500 italic">No locations yet. Add your first location!</p>';
            return;
        }
        
        container.innerHTML = locations.map(location => `
            <div class="bg-white p-4 border rounded-lg shadow">
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-bold text-gray-800">${location.name}</h3>
                    <div class="flex space-x-2">
                        <button onclick="editLocation('${location.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
                        <button onclick="deleteLocation('${location.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                    </div>
                </div>
                <p class="text-gray-600 text-sm">${location.magical_description.substring(0, 100)}...</p>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Failed to load locations:', error);
        document.getElementById('locations-list').innerHTML = '<p class="text-red-500">Failed to load locations</p>';
    }
}

async function saveLocation() {
    const name = document.getElementById('location-name').value;
    const lat = document.getElementById('location-lat').value;
    const lng = document.getElementById('location-lng').value;
    const magic = document.getElementById('location-magic').value;
    const lookFor = document.getElementById('location-lookfor').value;
    
    if (!name || !lat || !lng || !magic || !lookFor) {
        alert('Please fill in all fields');
        return;
    }
    
    const location = {
        id: 'loc' + Date.now(),
        name: name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        magical_description: magic,
        what_to_look_for: lookFor,
        status: 'active'
    };
    
    try {
        const response = await fetch('tables/locations', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(location)
        });
        
        if (response.ok) {
            alert('Location saved! It will appear on the website immediately.');
            // Clear form
            document.getElementById('location-name').value = '';
            document.getElementById('location-lat').value = '';
            document.getElementById('location-lng').value = '';
            document.getElementById('location-magic').value = '';
            document.getElementById('location-lookfor').value = '';
            // Reload list
            loadLocations();
        } else {
            alert('Failed to save location');
        }
    } catch (error) {
        alert('Error saving location: ' + error.message);
    }
}

async function deleteLocation(locationId) {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
        const response = await fetch(`tables/locations/${locationId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Location deleted!');
            loadLocations();
        } else {
            alert('Failed to delete location');
        }
    } catch (error) {
        alert('Error deleting location: ' + error.message);
    }
}

// Placeholder edit functions (would need forms to edit existing content)
function editEpisode(id) { alert('Edit episode feature - would open edit form'); }
function editClan(id) { alert('Edit clan feature - would open edit form'); }
function editLocation(id) { alert('Edit location feature - would open edit form'); }

console.log('✅ Working admin system loaded');