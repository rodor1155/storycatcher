// Live Admin System - Works on GitHub Pages with external database
const ADMIN_PASSWORD = 'hiddenworld2024';

// Supabase configuration (free tier)
const SUPABASE_URL = 'https://lnogbmmeuzkzqlfgbkng.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxub2dibW1ldXprenFsZmdia25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MjYyNzgsImV4cCI6MjA1MTMwMjI3OH0.MZh1D9VB3IqJAHkUbRQgOJTHvqpEQYN1Nrm6ZE9Yp5Q';

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (isLoggedIn()) {
        showDashboard();
        loadAllContent();
    }
});

// Login functions
function isLoggedIn() {
    return localStorage.getItem('hiddenworld_admin_auth') === 'true';
}

function handleLogin(event) {
    event.preventDefault();
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

function logout() {
    localStorage.removeItem('hiddenworld_admin_auth');
    location.reload();
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    showTab('episodes');
}

function showTab(tabName) {
    document.querySelectorAll('[id$="-tab"]').forEach(tab => {
        tab.classList.add('hidden');
    });
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('bg-blue-500', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[onclick="showTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        activeBtn.classList.add('bg-blue-500', 'text-white');
    }
}

// Database functions
async function supabaseRequest(method, table, data = null, id = null) {
    let url = `${SUPABASE_URL}/rest/v1/${table}`;
    if (id) url += `?id=eq.${id}`;
    
    const options = {
        method: method,
        headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
        }
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    
    if (method === 'DELETE') {
        return response.ok;
    }
    
    if (response.ok) {
        return await response.json();
    }
    
    throw new Error(`Supabase error: ${response.status}`);
}

// Load all content
async function loadAllContent() {
    await loadEpisodes();
    await loadClans();
    await loadLocations();
}

// Episodes
async function loadEpisodes() {
    try {
        const episodes = await supabaseRequest('GET', 'episodes');
        displayEpisodes(episodes || []);
    } catch (error) {
        console.error('Failed to load episodes:', error);
        displayEpisodes([]);
    }
}

function displayEpisodes(episodes) {
    const container = document.getElementById('episodes-list');
    if (!container) return;
    
    if (episodes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">No episodes yet. Add your first episode!</p>';
        return;
    }
    
    container.innerHTML = episodes.map(episode => `
        <div class="bg-white p-4 border rounded-lg shadow">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-800">${episode.title}</h3>
                <div class="flex space-x-2">
                    <button onclick="deleteEpisode('${episode.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                </div>
            </div>
            <p class="text-gray-600 text-sm">${episode.meta_description}</p>
        </div>
    `).join('');
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
        page_type: 'episode',
        status: 'published',
        created_at: new Date().toISOString()
    };
    
    try {
        await supabaseRequest('POST', 'episodes', episode);
        alert('Episode saved! It will appear on the website immediately.');
        
        // Clear form
        document.getElementById('episode-title').value = '';
        document.getElementById('episode-description').value = '';
        document.getElementById('episode-content').value = '';
        
        loadEpisodes();
    } catch (error) {
        alert('Failed to save episode: ' + error.message);
    }
}

async function deleteEpisode(episodeId) {
    if (!confirm('Are you sure you want to delete this episode?')) return;
    
    try {
        await supabaseRequest('DELETE', 'episodes', null, episodeId);
        alert('Episode deleted!');
        loadEpisodes();
    } catch (error) {
        alert('Failed to delete episode: ' + error.message);
    }
}

// Clans
async function loadClans() {
    try {
        const clans = await supabaseRequest('GET', 'clans');
        displayClans(clans || []);
    } catch (error) {
        console.error('Failed to load clans:', error);
        displayClans([]);
    }
}

function displayClans(clans) {
    const container = document.getElementById('clans-list');
    if (!container) return;
    
    if (clans.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">No clans yet. Add your first clan!</p>';
        return;
    }
    
    container.innerHTML = clans.map(clan => `
        <div class="bg-white p-4 border rounded-lg shadow">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-800">${clan.name}</h3>
                <div class="flex space-x-2">
                    <button onclick="deleteClan('${clan.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                </div>
            </div>
            <p class="text-gray-600 text-sm">${clan.stone_description ? clan.stone_description.substring(0, 100) + '...' : ''}</p>
        </div>
    `).join('');
}

async function saveClan() {
    const name = document.getElementById('clan-name').value;
    const origin = document.getElementById('clan-origin').value;
    const powers = document.getElementById('clan-powers').value;
    const connection = document.getElementById('clan-connection').value;
    
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
        color_primary: document.getElementById('clan-color1').value,
        color_secondary: document.getElementById('clan-color2').value,
        status: 'active',
        created_at: new Date().toISOString()
    };
    
    try {
        await supabaseRequest('POST', 'clans', clan);
        alert('Clan saved! It will appear on the website immediately.');
        
        // Clear form
        document.getElementById('clan-name').value = '';
        document.getElementById('clan-origin').value = '';
        document.getElementById('clan-powers').value = '';
        document.getElementById('clan-connection').value = '';
        
        loadClans();
    } catch (error) {
        alert('Failed to save clan: ' + error.message);
    }
}

async function deleteClan(clanId) {
    if (!confirm('Are you sure you want to delete this clan?')) return;
    
    try {
        await supabaseRequest('DELETE', 'clans', null, clanId);
        alert('Clan deleted!');
        loadClans();
    } catch (error) {
        alert('Failed to delete clan: ' + error.message);
    }
}

// Locations
async function loadLocations() {
    try {
        const locations = await supabaseRequest('GET', 'locations');
        displayLocations(locations || []);
    } catch (error) {
        console.error('Failed to load locations:', error);
        displayLocations([]);
    }
}

function displayLocations(locations) {
    const container = document.getElementById('locations-list');
    if (!container) return;
    
    if (locations.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">No locations yet. Add your first location!</p>';
        return;
    }
    
    container.innerHTML = locations.map(location => `
        <div class="bg-white p-4 border rounded-lg shadow">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-800">${location.name}</h3>
                <div class="flex space-x-2">
                    <button onclick="deleteLocation('${location.id}')" class="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
                </div>
            </div>
            <p class="text-gray-600 text-sm">${location.magical_description ? location.magical_description.substring(0, 100) + '...' : ''}</p>
        </div>
    `).join('');
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
        status: 'active',
        created_at: new Date().toISOString()
    };
    
    try {
        await supabaseRequest('POST', 'locations', location);
        alert('Location saved! It will appear on the website immediately.');
        
        // Clear form
        document.getElementById('location-name').value = '';
        document.getElementById('location-lat').value = '';
        document.getElementById('location-lng').value = '';
        document.getElementById('location-magic').value = '';
        document.getElementById('location-lookfor').value = '';
        
        loadLocations();
    } catch (error) {
        alert('Failed to save location: ' + error.message);
    }
}

async function deleteLocation(locationId) {
    if (!confirm('Are you sure you want to delete this location?')) return;
    
    try {
        await supabaseRequest('DELETE', 'locations', null, locationId);
        alert('Location deleted!');
        loadLocations();
    } catch (error) {
        alert('Failed to delete location: ' + error.message);
    }
}

console.log('✅ Live admin system loaded');