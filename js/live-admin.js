// Live Admin System - Works on GitHub Pages with external database
const ADMIN_PASSWORD = 'hiddenworld2024';

// Supabase configuration (free tier)
const SUPABASE_URL = 'https://lnogbmmeuzkzqlfgbkng.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxub2dibW1ldXprenFsZmdia25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3MjYyNzgsImV4cCI6MjA1MTMwMjI3OH0.MZh1D9VB3IqJAHkUbRQgOJTHvqpEQYN1Nrm6ZE9Yp5Q';

// Initialize when page loads - DON'T auto-hide login
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin system initializing...');
    // Always show login form first - let user authenticate properly
});

// Login functions - work with new HTML structure
function isLoggedIn() {
    return localStorage.getItem('hiddenworld_admin_auth') === 'true';
}

// This function is called by the HTML button
function attemptLogin() {
    const password = document.getElementById('admin-password').value;
    
    if (password === ADMIN_PASSWORD) {
        localStorage.setItem('hiddenworld_admin_auth', 'true');
        showDashboard();
        loadAllContent();
    } else {
        document.getElementById('login-error').style.display = 'block';
        document.getElementById('admin-password').value = '';
    }
}

// Logout function
function adminLogout() {
    localStorage.removeItem('hiddenworld_admin_auth');
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('admin-password').value = '';
    document.getElementById('login-error').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    showAdminTab('episodes');
}

function showAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + '-tab');
    if (selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Update button styles
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('bg-blue-600', 'text-white');
        btn.classList.add('bg-gray-600', 'text-gray-300');
    });
    
    // Find and highlight active button
    const activeBtn = document.querySelector(`[onclick="showAdminTab('${tabName}')"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-600', 'text-gray-300');
        activeBtn.classList.add('bg-blue-600', 'text-white');
    }
}

// Legacy function for compatibility
function showTab(tabName) {
    showAdminTab(tabName);
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
        const result = await response.json();
        return method === 'PATCH' ? result[0] : result; // PATCH returns array, others don't
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
                    <button onclick="editEpisode('${episode.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
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

async function editEpisode(episodeId) {
    try {
        const episodes = await supabaseRequest('GET', 'episodes');
        const episode = episodes.find(ep => ep.id === episodeId);
        if (!episode) {
            alert('Episode not found!');
            return;
        }
        
        // Fill form with existing data
        document.getElementById('episode-title').value = episode.title;
        document.getElementById('episode-description').value = episode.meta_description;
        document.getElementById('episode-content').value = episode.content;
        
        // Change save button to update mode
        const saveBtn = document.querySelector('[onclick="saveEpisode()"]');
        saveBtn.innerHTML = 'Update Episode';
        saveBtn.onclick = () => updateEpisode(episodeId);
        
        // Scroll to form
        document.getElementById('episodes-tab').scrollIntoView();
        
    } catch (error) {
        alert('Failed to load episode: ' + error.message);
    }
}

async function updateEpisode(episodeId) {
    const title = document.getElementById('episode-title').value;
    const description = document.getElementById('episode-description').value;
    const content = document.getElementById('episode-content').value;
    
    if (!title || !description || !content) {
        alert('Please fill in all fields');
        return;
    }
    
    const episode = {
        title: title,
        meta_description: description,
        content: content,
        status: 'published',
        updated_at: new Date().toISOString()
    };
    
    try {
        await supabaseRequest('PATCH', 'episodes', episode, episodeId);
        alert('Episode updated! Changes are live on the website.');
        
        // Reset form and button
        document.getElementById('episode-title').value = '';
        document.getElementById('episode-description').value = '';
        document.getElementById('episode-content').value = '';
        
        const saveBtn = document.querySelector('[onclick^="updateEpisode"]');
        saveBtn.innerHTML = 'Save Episode';
        saveBtn.onclick = saveEpisode;
        
        loadEpisodes();
    } catch (error) {
        alert('Failed to update episode: ' + error.message);
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
                    <button onclick="editClan('${clan.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
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

async function editClan(clanId) {
    try {
        const clans = await supabaseRequest('GET', 'clans');
        const clan = clans.find(c => c.id === clanId);
        if (!clan) {
            alert('Clan not found!');
            return;
        }
        
        // Fill form with existing data
        document.getElementById('clan-name').value = clan.name;
        document.getElementById('clan-origin').value = clan.stone_description;
        document.getElementById('clan-powers').value = clan.offering;
        document.getElementById('clan-connection').value = clan.resonance_note;
        document.getElementById('clan-color1').value = clan.color_primary || '#3B82F6';
        document.getElementById('clan-color2').value = clan.color_secondary || '#1E40AF';
        
        // Change save button to update mode
        const saveBtn = document.querySelector('[onclick="saveClan()"]');
        saveBtn.innerHTML = 'Update Clan';
        saveBtn.onclick = () => updateClan(clanId);
        
        // Switch to clans tab and scroll
        showTab('clans');
        document.getElementById('clans-tab').scrollIntoView();
        
    } catch (error) {
        alert('Failed to load clan: ' + error.message);
    }
}

async function updateClan(clanId) {
    const name = document.getElementById('clan-name').value;
    const origin = document.getElementById('clan-origin').value;
    const powers = document.getElementById('clan-powers').value;
    const connection = document.getElementById('clan-connection').value;
    
    if (!name || !origin || !powers || !connection) {
        alert('Please fill in all fields');
        return;
    }
    
    const clan = {
        name: name,
        stone_description: origin,
        offering: powers,
        resonance_note: connection,
        color_primary: document.getElementById('clan-color1').value,
        color_secondary: document.getElementById('clan-color2').value,
        updated_at: new Date().toISOString()
    };
    
    try {
        await supabaseRequest('PATCH', 'clans', clan, clanId);
        alert('Clan updated! Changes are live on the website.');
        
        // Reset form and button
        document.getElementById('clan-name').value = '';
        document.getElementById('clan-origin').value = '';
        document.getElementById('clan-powers').value = '';
        document.getElementById('clan-connection').value = '';
        
        const saveBtn = document.querySelector('[onclick^="updateClan"]');
        saveBtn.innerHTML = 'Save Clan';
        saveBtn.onclick = saveClan;
        
        loadClans();
    } catch (error) {
        alert('Failed to update clan: ' + error.message);
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
                    <button onclick="editLocation('${location.id}')" class="bg-blue-500 text-white px-3 py-1 rounded text-sm">Edit</button>
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

async function editLocation(locationId) {
    try {
        const locations = await supabaseRequest('GET', 'locations');
        const location = locations.find(l => l.id === locationId);
        if (!location) {
            alert('Location not found!');
            return;
        }
        
        // Fill form with existing data
        document.getElementById('location-name').value = location.name;
        document.getElementById('location-lat').value = location.latitude;
        document.getElementById('location-lng').value = location.longitude;
        document.getElementById('location-magic').value = location.magical_description;
        document.getElementById('location-lookfor').value = location.what_to_look_for;
        
        // Change save button to update mode
        const saveBtn = document.querySelector('[onclick="saveLocation()"]');
        saveBtn.innerHTML = 'Update Location';
        saveBtn.onclick = () => updateLocation(locationId);
        
        // Switch to locations tab and scroll
        showTab('locations');
        document.getElementById('locations-tab').scrollIntoView();
        
    } catch (error) {
        alert('Failed to load location: ' + error.message);
    }
}

async function updateLocation(locationId) {
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
        name: name,
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        magical_description: magic,
        what_to_look_for: lookFor,
        updated_at: new Date().toISOString()
    };
    
    try {
        await supabaseRequest('PATCH', 'locations', location, locationId);
        alert('Location updated! Changes are live on the website.');
        
        // Reset form and button
        document.getElementById('location-name').value = '';
        document.getElementById('location-lat').value = '';
        document.getElementById('location-lng').value = '';
        document.getElementById('location-magic').value = '';
        document.getElementById('location-lookfor').value = '';
        
        const saveBtn = document.querySelector('[onclick^="updateLocation"]');
        saveBtn.innerHTML = 'Save Location';
        saveBtn.onclick = saveLocation;
        
        loadLocations();
    } catch (error) {
        alert('Failed to update location: ' + error.message);
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

// Main Page Content Management
async function loadMainPageContent() {
    try {
        const content = await supabaseRequest('GET', 'mainpage_content');
        if (content && content.length > 0) {
            const data = content[0];
            document.getElementById('main-title').value = data.title || '';
            document.getElementById('main-subtitle').value = data.subtitle || '';
            document.getElementById('about-content').value = data.about || '';
            document.getElementById('footer-tagline').value = data.footer || '';
        } else {
            // Load defaults if no content exists
            document.getElementById('main-title').value = 'The Hidden World of London';
            document.getElementById('main-subtitle').value = 'Magical stories and secret places waiting to be discovered by children aged 8-12';
            document.getElementById('about-content').value = 'Welcome to a London where magic hides in plain sight. Every bridge has a story, every stone remembers, and some children can hear the city\'s ancient secrets.';
            document.getElementById('footer-tagline').value = 'Where London\'s magic lives ✨';
        }
        alert('Current content loaded into form!');
    } catch (error) {
        console.error('Failed to load main page content:', error);
        alert('Failed to load content, showing defaults');
        // Show defaults on error
        document.getElementById('main-title').value = 'The Hidden World of London';
        document.getElementById('main-subtitle').value = 'Magical stories and secret places waiting to be discovered by children aged 8-12';
        document.getElementById('about-content').value = 'Welcome to a London where magic hides in plain sight.';
        document.getElementById('footer-tagline').value = 'Where London\'s magic lives ✨';
    }
}

async function saveMainPageContent() {
    const title = document.getElementById('main-title').value;
    const subtitle = document.getElementById('main-subtitle').value;
    const about = document.getElementById('about-content').value;
    const footer = document.getElementById('footer-tagline').value;
    
    if (!title || !subtitle || !about || !footer) {
        alert('Please fill in all fields');
        return;
    }
    
    const content = {
        id: 'main_content',
        title: title,
        subtitle: subtitle,
        about: about,
        footer: footer,
        updated_at: new Date().toISOString()
    };
    
    try {
        // Try to update first, if not exists, create
        try {
            await supabaseRequest('PATCH', 'mainpage_content', content, 'main_content');
        } catch (updateError) {
            // If update fails, try to create
            await supabaseRequest('POST', 'mainpage_content', content);
        }
        
        alert('Main page content saved! Changes are live on the website immediately.');
    } catch (error) {
        alert('Failed to save content: ' + error.message);
    }
}

console.log('✅ Live admin system loaded with full edit capabilities');