// The Hidden World of London - Main JavaScript

// Global variables
let currentPage = 1;
let episodesPerPage = 6;
let allEpisodes = [];
let allClans = [];
let allLocations = [];
let publicMap = null;
let publicMapMarkers = [];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize all app functionality
async function initializeApp() {
    try {
        // Set up navigation
        setupNavigation();
        
        // Load initial data
        await loadAllData();
        
        // Render content
        renderEpisodes();
        renderClans();
        renderLocations();
        
        // Initialize public map
        initializePublicMap();
        
        // Set up interactive elements
        setupInteractivity();
        
        // Load saved content and make elements editable
        loadSavedContent();
        makeContentEditable();
        
        console.log('Hidden World app initialized successfully');
    } catch (error) {
        console.error('Error initializing app:', error);
        showMessage('Error loading content. Please refresh the page.', 'error');
    }
}

// Navigation setup
function setupNavigation() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Close mobile menu if open
                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                }
            }
        });
    });
}

// Load all data from API
async function loadAllData() {
    try {
        // Load episodes (published pages of type 'episode')
        const episodesResponse = await fetch('tables/pages?limit=100');
        const episodesData = await episodesResponse.json();
        allEpisodes = episodesData.data.filter(page => 
            page.page_type === 'episode' && page.status === 'published'
        ).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        // Load clans
        const clansResponse = await fetch('tables/clans?limit=100');
        const clansData = await clansResponse.json();
        allClans = clansData.data.filter(clan => clan.status === 'active');

        // Load locations
        const locationsResponse = await fetch('tables/locations?limit=100');
        const locationsData = await locationsResponse.json();
        allLocations = locationsData.data.filter(location => location.status === 'active');

    } catch (error) {
        console.error('Error loading data:', error);
        throw error;
    }
}

// Render episodes section
function renderEpisodes() {
    const episodesGrid = document.getElementById('episodes-grid');
    if (!episodesGrid) return;

    const episodesToShow = allEpisodes.slice(0, currentPage * episodesPerPage);
    
    if (episodesToShow.length === 0) {
        episodesGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-scroll text-4xl text-slate-600 mb-4"></i>
                <p class="text-slate-400 text-lg">No episodes published yet. The stories are still being written...</p>
            </div>
        `;
        return;
    }

    episodesGrid.innerHTML = episodesToShow.map((episode, index) => `
        <div class="episode-card fade-in stagger-${(index % 3) + 1}">
            ${episode.image_url ? `
                <div class="mb-4 rounded-lg overflow-hidden">
                    <img src="${episode.image_url}" alt="${episode.title}" class="w-full h-48 object-cover">
                </div>
            ` : ''}
            <div class="flex items-center mb-3">
                <i class="fas fa-bookmark text-london-gold mr-2"></i>
                <span class="text-sm text-slate-400">Episode ${index + 1}</span>
            </div>
            <h3 class="text-xl font-cinzel font-semibold mb-3 text-white">${episode.title}</h3>
            <div class="text-slate-300 mb-4 line-clamp-3">
                ${episode.meta_description || 'A new chapter in London\'s hidden story...'}
            </div>
            <div class="flex items-center justify-between">
                <button onclick="viewEpisode('${episode.id}')" class="text-london-gold hover:text-yellow-300 transition-colors">
                    <i class="fas fa-book-open mr-1"></i>Read More
                </button>
                <span class="text-xs text-slate-500">
                    ${formatDate(episode.created_at)}
                </span>
            </div>
        </div>
    `).join('');
}

// Render clans section
function renderClans() {
    const clansGrid = document.getElementById('clans-grid');
    if (!clansGrid) return;

    clansGrid.innerHTML = allClans.map((clan, index) => `
        <div class="magic-card clan-${clan.name.toLowerCase().split(' ')[0]} fade-in stagger-${(index % 3) + 1}">
            <div class="text-center mb-4">
                ${clan.emblem_url ? `
                    <img src="${clan.emblem_url}" alt="${clan.name} emblem" class="w-16 h-16 mx-auto mb-3">
                ` : `
                    <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" 
                         style="background: linear-gradient(135deg, ${clan.color_primary}, ${clan.color_secondary})">
                        <i class="fas fa-gem text-white text-2xl"></i>
                    </div>
                `}
                <h3 class="text-xl font-cinzel font-semibold text-london-gold">${clan.name}</h3>
            </div>
            
            <div class="space-y-4 text-sm">
                <div>
                    <h4 class="font-semibold text-white mb-2">Origin:</h4>
                    <div class="text-slate-300">${clan.stone_description || 'Ancient origins lost to time...'}</div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-white mb-2">Offers:</h4>
                    <div class="text-slate-300">${clan.offering || 'Hidden powers waiting to be discovered...'}</div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-white mb-2">Resonance:</h4>
                    <div class="text-slate-300 italic">${clan.resonance_note || 'The stone whispers its secrets to those who listen...'}</div>
                </div>
            </div>
            
            <div class="mt-6 text-center">
                <button onclick="exploreClan('${clan.id}')" 
                        class="bg-london-gold hover:bg-yellow-500 text-slate-900 font-semibold px-4 py-2 rounded-lg transition-all transform hover:scale-105">
                    <i class="fas fa-search mr-1"></i>Explore
                </button>
            </div>
        </div>
    `).join('');
}

// Render locations section
function renderLocations() {
    const locationsGrid = document.getElementById('locations-grid');
    if (!locationsGrid) return;

    locationsGrid.innerHTML = allLocations.map((location, index) => `
        <div class="location-card fade-in stagger-${(index % 3) + 1}">
            ${location.image_url ? `
                <div class="mb-4 rounded-lg overflow-hidden">
                    <img src="${location.image_url}" alt="${location.name}" class="w-full h-32 object-cover">
                </div>
            ` : ''}
            
            <div class="mb-3">
                <h3 class="text-lg font-cinzel font-semibold text-london-gold mb-2">
                    <i class="fas fa-map-marker-alt mr-2"></i>${location.name}
                </h3>
            </div>
            
            <div class="space-y-3 text-sm">
                <div>
                    <h4 class="font-semibold text-sea-light mb-1">The Magic:</h4>
                    <div class="text-slate-300">${location.magical_description || 'A place where the veil grows thin...'}</div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-sea-light mb-1">Look For:</h4>
                    <div class="text-slate-300">${location.what_to_look_for || 'Signs and wonders for those who know how to see...'}</div>
                </div>
            </div>
            
            <div class="mt-4 flex justify-between items-center">
                <button onclick="exploreLocation('${location.id}')" 
                        class="text-sea-light hover:text-london-gold transition-colors">
                    <i class="fas fa-compass mr-1"></i>Explore
                </button>
                ${location.latitude && location.longitude ? `
                    <button onclick="showOnMap(${location.latitude}, ${location.longitude})" 
                            class="text-slate-400 hover:text-white transition-colors">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Interactive functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function loadMoreEpisodes() {
    currentPage++;
    renderEpisodes();
    
    // Hide load more button if all episodes are shown
    if (currentPage * episodesPerPage >= allEpisodes.length) {
        const loadMoreBtn = document.querySelector('button[onclick="loadMoreEpisodes()"]');
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }
}

function viewEpisode(episodeId) {
    // Find the episode
    const episode = allEpisodes.find(ep => ep.id === episodeId);
    if (!episode) return;
    
    // Create modal or redirect to episode page
    showEpisodeModal(episode);
}

function showEpisodeModal(episode) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-london-gold/20">
                <div class="flex justify-between items-start">
                    <h2 class="text-2xl font-cinzel font-semibold text-london-gold">${episode.title}</h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <p class="text-slate-400 mt-2">${formatDate(episode.created_at)}</p>
            </div>
            <div class="p-6">
                ${episode.image_url ? `
                    <img src="${episode.image_url}" alt="${episode.title}" class="w-full rounded-lg mb-6">
                ` : ''}
                <div class="prose prose-invert max-w-none">
                    ${episode.content || '<p class="text-slate-300">This episode is still being written...</p>'}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function exploreClan(clanId) {
    const clan = allClans.find(c => c.id === clanId);
    if (!clan) return;
    
    // Show detailed clan information
    showClanModal(clan);
}

function showClanModal(clan) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-london-gold/20">
                <div class="flex justify-between items-start">
                    <div class="flex items-center">
                        ${clan.emblem_url ? `
                            <img src="${clan.emblem_url}" alt="${clan.name} emblem" class="w-12 h-12 mr-3">
                        ` : `
                            <div class="w-12 h-12 mr-3 rounded-full flex items-center justify-center" 
                                 style="background: linear-gradient(135deg, ${clan.color_primary}, ${clan.color_secondary})">
                                <i class="fas fa-gem text-white"></i>
                            </div>
                        `}
                        <h2 class="text-2xl font-cinzel font-semibold text-london-gold">${clan.name}</h2>
                    </div>
                    <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            <div class="p-6 space-y-6">
                <div>
                    <h3 class="text-lg font-cinzel font-semibold text-london-gold mb-3">
                        <i class="fas fa-scroll mr-2"></i>Stone Origin
                    </h3>
                    <div class="text-slate-300 prose prose-invert">
                        ${clan.stone_description || 'The origins of this clan stone are shrouded in mystery...'}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-cinzel font-semibold text-london-gold mb-3">
                        <i class="fas fa-gift mr-2"></i>What It Offers
                    </h3>
                    <div class="text-slate-300 prose prose-invert">
                        ${clan.offering || 'This stone holds secrets waiting to be discovered...'}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-cinzel font-semibold text-london-gold mb-3">
                        <i class="fas fa-hand-holding-heart mr-2"></i>Resonance Ritual
                    </h3>
                    <div class="text-slate-300 prose prose-invert italic">
                        ${clan.resonance_note || 'The stone will reveal its awakening ritual to those ready to listen...'}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function exploreLocation(locationId) {
    const location = allLocations.find(l => l.id === locationId);
    if (!location) return;
    
    showLocationModal(location);
}

function showLocationModal(location) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="p-6 border-b border-london-gold/20">
                <div class="flex justify-between items-start">
                    <h2 class="text-2xl font-cinzel font-semibold text-london-gold">
                        <i class="fas fa-map-marker-alt mr-2"></i>${location.name}
                    </h2>
                    <button onclick="this.closest('.fixed').remove()" class="text-slate-400 hover:text-white">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
            </div>
            <div class="p-6 space-y-6">
                ${location.image_url ? `
                    <img src="${location.image_url}" alt="${location.name}" class="w-full rounded-lg">
                ` : ''}
                
                <div>
                    <h3 class="text-lg font-cinzel font-semibold text-sea-light mb-3">
                        <i class="fas fa-sparkles mr-2"></i>The Magic Here
                    </h3>
                    <div class="text-slate-300 prose prose-invert">
                        ${location.magical_description || 'This place holds ancient magic...'}
                    </div>
                </div>
                
                <div>
                    <h3 class="text-lg font-cinzel font-semibold text-sea-light mb-3">
                        <i class="fas fa-eye mr-2"></i>What to Look For
                    </h3>
                    <div class="text-slate-300 prose prose-invert">
                        ${location.what_to_look_for || 'Keep your eyes open for signs of the hidden world...'}
                    </div>
                </div>
                
                ${location.latitude && location.longitude ? `
                    <div class="text-center">
                        <button onclick="showOnMap(${location.latitude}, ${location.longitude})" 
                                class="bg-london-gold hover:bg-yellow-500 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-all">
                            <i class="fas fa-map mr-2"></i>View on Map
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function showOnMap(latitude, longitude) {
    // Open location in Google Maps
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    window.open(url, '_blank');
}

// Setup additional interactivity
function setupInteractivity() {
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe all cards
    document.querySelectorAll('.magic-card, .episode-card, .location-card').forEach(card => {
        observer.observe(card);
    });
}

// Utility functions
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message message-${type} fixed top-20 right-4 z-50 max-w-sm`;
    message.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-2"></i>
            <span>${text}</span>
        </div>
    `;
    
    document.body.appendChild(message);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (message.parentNode) {
            message.remove();
        }
    }, 5000);
}

// Public Map Functions
function initializePublicMap() {
    const mapElement = document.getElementById('public-locations-map');
    if (!mapElement || !window.L) return;
    
    // Initialize Leaflet map
    publicMap = L.map(mapElement).setView([51.5074, -0.1278], 12);
    
    // Add magical tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(publicMap);
    
    updatePublicMapMarkers();
}

function updatePublicMapMarkers() {
    if (!publicMap) return;
    
    // Clear existing markers
    publicMapMarkers.forEach(marker => publicMap.removeLayer(marker));
    publicMapMarkers = [];
    
    // Create custom sparkly icon
    const sparkleIcon = L.divIcon({
        html: `
            <div style="
                width: 40px; 
                height: 40px; 
                background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #feca57);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 20px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                animation: bounce 2s infinite;
                border: 3px solid white;
            ">✨</div>
            <style>
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
            </style>
        `,
        className: 'sparkle-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });
    
    // Add sparkly markers for each active location
    allLocations.filter(location => location.status === 'active').forEach((location, index) => {
        if (location.latitude && location.longitude) {
            const marker = L.marker([parseFloat(location.latitude), parseFloat(location.longitude)], {
                icon: sparkleIcon,
                title: location.name
            }).addTo(publicMap);
            
            const popupContent = `
                <div style="font-family: 'Fredoka One', cursive; color: #1e293b; max-width: 300px;">
                    <h3 style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px;">
                        ✨ ${location.name} ✨
                    </h3>
                    ${location.image_url ? `
                        <img src="${location.image_url}" alt="${location.name}" 
                             style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                    ` : ''}
                    <div style="margin-bottom: 10px; font-family: 'Nunito', sans-serif;">
                        <h4 style="color: #4ecdc4; margin: 0 0 5px 0; font-size: 14px;">🔮 The Magic Here:</h4>
                        <p style="margin: 0; font-size: 13px; line-height: 1.4;">
                            ${stripHtml(location.magical_description || 'A place where magic dwells...')}
                        </p>
                    </div>
                    <div style="font-family: 'Nunito', sans-serif;">
                        <h4 style="color: #96ceb4; margin: 0 0 5px 0; font-size: 14px;">👀 Look For:</h4>
                        <p style="margin: 0; font-size: 13px; line-height: 1.4;">
                            ${stripHtml(location.what_to_look_for || 'Magical signs and wonders...')}
                        </p>
                    </div>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            
            marker.on('click', () => {
                // Add magical sound effect (if browser supports it)
                playMagicalSound('sparkle');
            });
            
            publicMapMarkers.push(marker);
        }
    });
    
    // Add magical floating elements
    addMagicalEffects();
}

function addMagicalEffects() {
    // Add floating sparkles animation to the hero section
    const hero = document.querySelector('#home');
    if (hero && !hero.querySelector('.floating-sparkles')) {
        const sparkles = document.createElement('div');
        sparkles.className = 'floating-sparkles absolute inset-0 pointer-events-none';
        sparkles.innerHTML = Array.from({length: 20}, (_, i) => `
            <div class="absolute animate-ping" 
                 style="left: ${Math.random() * 100}%; 
                        top: ${Math.random() * 100}%; 
                        animation-delay: ${Math.random() * 5}s;
                        animation-duration: ${2 + Math.random() * 3}s;">
                ${['✨', '🌟', '⭐', '💫', '🔮'][Math.floor(Math.random() * 5)]}
            </div>
        `).join('');
        hero.appendChild(sparkles);
    }
}

// Enhanced child-friendly rendering functions
function renderEpisodes() {
    const episodesGrid = document.getElementById('episodes-grid');
    if (!episodesGrid) return;

    const episodesToShow = allEpisodes.slice(0, currentPage * episodesPerPage);
    
    if (episodesToShow.length === 0) {
        episodesGrid.innerHTML = `
            <div class="col-span-full text-center py-12 rainbow-border">
                <div class="p-8">
                    <div class="text-6xl mb-4">📚</div>
                    <p class="text-slate-300 text-lg mb-4">No episodes published yet...</p>
                    <p class="text-slate-400">🔮 The magical stories are still being written! ✨</p>
                </div>
            </div>
        `;
        return;
    }

    episodesGrid.innerHTML = episodesToShow.map((episode, index) => {
        const emojis = ['📖', '🏰', '🔮', '✨', '🌟', '🗝️', '🦄', '🧙‍♀️'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        return `
            <div class="episode-card">
                ${episode.image_url ? `
                    <div class="mb-4 rounded-lg overflow-hidden fun-shadow">
                        <img src="${episode.image_url}" alt="${episode.title}" 
                             class="w-full h-48 object-cover">
                    </div>
                ` : `
                    <div class="mb-4 h-48 rounded-lg flex items-center justify-center text-6xl bg-gradient-to-br from-purple-600/20 to-blue-600/20">
                        ${randomEmoji}
                    </div>
                `}
                <div class="flex items-center mb-3">
                    ${episode.logo_url ? `
                        <img src="${episode.logo_url}" alt="${episode.title} logo" class="logo-transparent w-8 h-8 mr-2">
                    ` : `
                        <span class="text-2xl mr-2">📖</span>
                    `}
                    <span class="text-sm text-slate-400 font-fredoka">Episode ${index + 1}</span>
                    <span class="ml-auto text-xl">✨</span>
                </div>
                <h3 class="text-xl font-fredoka font-semibold mb-3 text-white magical-text">
                    ${episode.title}
                </h3>
                <div class="text-slate-300 mb-4 line-clamp-3 font-nunito">
                    ${episode.meta_description || 'A new chapter in London\'s hidden story... 🌟'}
                </div>
                <div class="flex items-center justify-between">
                    <button onclick="viewEpisode('${episode.id}')" 
                            class="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-fredoka px-6 py-2 rounded-full transition-colors shadow-lg">
                        <span>🔮 Read More!</span>
                    </button>
                    <span class="text-xs text-slate-500 font-nunito">
                        ${formatDate(episode.created_at)}
                    </span>
                </div>
            </div>
        `;
    }).join('');
}

// Enhanced clan rendering with more child-friendly design
function renderClans() {
    const clansGrid = document.getElementById('clans-grid');
    if (!clansGrid) return;

    const clanEmojis = {
        'Sea Clan': ['🌊', '🐋', '🏴‍☠️', '⚓'],
        'Earth Clan': ['🌱', '🏔️', '🌳', '🦎'],
        'Sky Clan': ['☁️', '🦅', '⚡', '🌙'],
        'Fire Clan': ['🔥', '🐉', '🌋', '⭐'],
        'Ice Clan': ['❄️', '🦢', '💎', '🌨️']
    };

    clansGrid.innerHTML = allClans.map((clan, index) => {
        const emojis = clanEmojis[clan.name] || ['✨', '🔮', '⭐', '🌟'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        
        return `
            <div class="magic-card clan-${clan.name.toLowerCase().split(' ')[0]} bounce-in sparkle-effect" 
                 style="animation-delay: ${index * 0.2}s;">
                <div class="text-center mb-4">
                    ${clan.emblem_url ? `
                        <div class="inline-block mb-3">
                            <img src="${clan.emblem_url}" alt="${clan.name} emblem" 
                                 class="logo-transparent w-20 h-20 rounded-full fun-shadow border-2 border-purple-400">
                        </div>
                    ` : `
                        <div class="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center fun-shadow border-2 border-purple-400" 
                             style="background: linear-gradient(135deg, ${clan.color_primary}, ${clan.color_secondary})">
                            ${clan.logo_url ? `
                                <img src="${clan.logo_url}" alt="${clan.name} logo" class="logo-transparent w-12 h-12">
                            ` : `
                                <span class="text-3xl">${randomEmoji}</span>
                            `}
                        </div>
                    `}
                    <h3 class="text-xl font-fredoka font-semibold magical-text">${clan.name}</h3>
                </div>
                
                <div class="space-y-4 text-sm font-nunito">
                    <div class="bg-purple-500/20 border border-purple-400/40 rounded-lg">
                        <div class="p-3">
                            <h4 class="font-semibold text-white mb-2 flex items-center">
                                📜 <span class="ml-2">Origin Story:</span>
                            </h4>
                            <div class="text-slate-300">${clan.stone_description || 'Ancient origins lost to time... 🕰️'}</div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-500/20 border border-blue-400/40 rounded-lg">
                        <div class="p-3">
                            <h4 class="font-semibold text-white mb-2 flex items-center">
                                🎁 <span class="ml-2">Magic Powers:</span>
                            </h4>
                            <div class="text-slate-300">${clan.offering || 'Hidden powers waiting to be discovered... ✨'}</div>
                        </div>
                    </div>
                    
                    <div class="bg-green-500/20 border border-green-400/40 rounded-lg">
                        <div class="p-3">
                            <h4 class="font-semibold text-white mb-2 flex items-center">
                                🔮 <span class="ml-2">How to Connect:</span>
                            </h4>
                            <div class="text-slate-300 italic">${clan.resonance_note || 'The stone whispers its secrets to those who listen... 👂'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="mt-6 text-center">
                    <button onclick="exploreClan('${clan.id}')" 
                            class="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 
                                   text-white font-fredoka px-6 py-3 rounded-full transition-all transform hover:scale-105 shadow-lg">
                        <span>🧭 Explore ${randomEmoji}</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Search functionality (for future enhancement)
function searchContent(query) {
    // Search through episodes, clans, and locations
    const results = {
        episodes: allEpisodes.filter(episode => 
            episode.title.toLowerCase().includes(query.toLowerCase()) ||
            episode.content.toLowerCase().includes(query.toLowerCase())
        ),
        clans: allClans.filter(clan =>
            clan.name.toLowerCase().includes(query.toLowerCase()) ||
            clan.stone_description.toLowerCase().includes(query.toLowerCase())
        ),
        locations: allLocations.filter(location =>
            location.name.toLowerCase().includes(query.toLowerCase()) ||
            location.magical_description.toLowerCase().includes(query.toLowerCase())
        )
    };
    
    return results;
}

// Homepage editing functionality (admin only)
function makeContentEditable() {
    // Check if user is admin
    const isAdmin = checkAdminStatus();
    
    if (!isAdmin) {
        // Remove admin class from body
        document.body.classList.remove('admin-logged-in');
        return;
    }
    
    // Add admin class to body to enable editing styles
    document.body.classList.add('admin-logged-in');
    
    const editableElements = document.querySelectorAll('.editable-content');
    
    editableElements.forEach(element => {
        element.addEventListener('click', function() {
            const section = this.dataset.section;
            const field = this.dataset.field;
            const currentContent = this.innerHTML;
            
            const newContent = prompt(`Edit ${section} ${field}:`, stripHtml(currentContent));
            if (newContent !== null && newContent !== stripHtml(currentContent)) {
                this.innerHTML = newContent;
                saveContentChange(section, field, newContent);
            }
        });
    });
}

function checkAdminStatus() {
    // Check if admin is logged in by looking for stored admin session
    const adminUser = localStorage.getItem('hiddenworld_admin');
    return adminUser !== null;
}

function saveContentChange(section, field, content) {
    // Store in localStorage for now (could be expanded to save to database)
    const edits = JSON.parse(localStorage.getItem('homepage_edits') || '{}');
    if (!edits[section]) {
        edits[section] = {};
    }
    edits[section][field] = content;
    localStorage.setItem('homepage_edits', JSON.stringify(edits));
    
    console.log('Content saved:', section, field, content);
    showMessage('Content updated! Changes are saved locally.', 'success');
}

function loadSavedContent() {
    const edits = JSON.parse(localStorage.getItem('homepage_edits') || '{}');
    
    Object.keys(edits).forEach(section => {
        Object.keys(edits[section]).forEach(field => {
            const element = document.querySelector(`[data-section="${section}"][data-field="${field}"]`);
            if (element) {
                element.innerHTML = edits[section][field];
            }
        });
    });
}

// Child-friendly utility functions
function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

// Add magical sound effects for interactions
function playMagicalSound(type = 'sparkle') {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch(type) {
            case 'sparkle':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
                break;
            case 'magic':
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    } catch (e) {
        // Ignore audio errors
    }
}