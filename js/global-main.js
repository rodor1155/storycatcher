// The Hidden World of London - Global Main JavaScript

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
        console.log('🌐 Initializing Hidden World app with GLOBAL database...');
        
        // Set up navigation
        setupNavigation();
        
        // Load initial data from global API
        await loadAllData();
        
        // Render content
        renderEpisodes();
        renderClans();
        renderLocations();
        
        // Initialize public map
        initializePublicMap();
        
        // Set up interactive elements
        setupInteractivity();
        
        // Load main page content from global database
        await loadMainPageContent();
        
        console.log('✅ Hidden World app initialized successfully with global data');
    } catch (error) {
        console.error('❌ Error initializing app:', error);
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

// Load all data from global RESTful API
async function loadAllData() {
    try {
        console.log('🔄 Loading data from GLOBAL RESTful API...');
        
        // Load episodes
        const episodesResponse = await fetch('tables/episodes');
        const episodesResult = await episodesResponse.json();
        allEpisodes = episodesResult.data || [];
        
        // Load clans
        const clansResponse = await fetch('tables/clans');
        const clansResult = await clansResponse.json();
        allClans = clansResult.data || [];
        
        // Load locations
        const locationsResponse = await fetch('tables/locations');
        const locationsResult = await locationsResponse.json();
        allLocations = locationsResult.data || [];
        
        console.log('✅ Global data loaded successfully');
        console.log(`📊 Episodes: ${allEpisodes.length}, Clans: ${allClans.length}, Locations: ${allLocations.length}`);
        
    } catch (error) {
        console.error('❌ Error loading global data:', error.message);
        // Fallback to empty arrays if API fails
        allEpisodes = [];
        allClans = [];
        allLocations = [];
        
        console.log('⚠️ Using empty data due to API error');
    }
}

// Load main page content from global database
async function loadMainPageContent() {
    try {
        console.log('📖 Loading main page content from global database...');
        
        const response = await fetch('tables/main_page');
        const result = await response.json();
        
        // Apply main page content if available
        result.data.forEach(item => {
            if (item.section === 'hero' && item.field === 'title') {
                const titleElement = document.getElementById('main-title');
                if (titleElement && item.content) {
                    titleElement.innerHTML = item.content;
                }
            }
            if (item.section === 'hero' && item.field === 'subtitle') {
                const subtitleElement = document.getElementById('main-subtitle');
                if (subtitleElement && item.content) {
                    subtitleElement.innerHTML = item.content;
                }
            }
            if (item.section === 'episodes' && item.field === 'title') {
                const episodesTitleElement = document.querySelector('[data-section="episodes"][data-field="title"]');
                if (episodesTitleElement && item.content) {
                    episodesTitleElement.innerHTML = item.content;
                }
            }
            if (item.section === 'episodes' && item.field === 'description') {
                const episodesDescElement = document.querySelector('[data-section="episodes"][data-field="description"]');
                if (episodesDescElement && item.content) {
                    episodesDescElement.innerHTML = item.content;
                }
            }
        });
        
        console.log('✅ Main page content loaded from global database');
    } catch (error) {
        console.error('❌ Error loading main page content:', error);
        console.log('ℹ️ Using default content');
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

    if (allClans.length === 0) {
        clansGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-gem text-4xl text-slate-600 mb-4"></i>
                <p class="text-slate-400 text-lg">No clan stones have awakened yet...</p>
            </div>
        `;
        return;
    }

    clansGrid.innerHTML = allClans.map((clan, index) => `
        <div class="magic-card clan-${clan.name.toLowerCase().split(' ')[0]} fade-in stagger-${(index % 3) + 1}">
            <div class="text-center mb-4">
                <div class="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center" 
                     style="background: linear-gradient(135deg, ${clan.color_primary}, ${clan.color_secondary})">
                    <i class="fas fa-gem text-white text-2xl"></i>
                </div>
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

    if (allLocations.length === 0) {
        locationsGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-map text-4xl text-slate-600 mb-4"></i>
                <p class="text-slate-400 text-lg">No magical locations have been discovered yet...</p>
            </div>
        `;
        return;
    }

    locationsGrid.innerHTML = allLocations.map((location, index) => `
        <div class="location-card fade-in stagger-${(index % 3) + 1}">
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
                        <div class="w-12 h-12 mr-3 rounded-full flex items-center justify-center" 
                             style="background: linear-gradient(135deg, ${clan.color_primary}, ${clan.color_secondary})">
                            <i class="fas fa-gem text-white"></i>
                        </div>
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
    if (!mapElement) {
        console.log('Map element not found');
        return;
    }
    
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.log('Leaflet not loaded, trying again...');
        setTimeout(initializePublicMap, 1000);
        return;
    }
    
    try {
        // Initialize Leaflet map
        publicMap = L.map(mapElement).setView([51.5074, -0.1278], 12);
        
        // Add magical tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(publicMap);
        
        // Add locations from global data
        addDynamicLocations();
        
        console.log('✅ Map initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing map:', error);
        // Fallback: hide map and show message
        mapElement.innerHTML = '<div class="text-center p-8"><p class="text-slate-400">🗺️ Interactive map will be available soon!</p></div>';
    }
}

function addDynamicLocations() {
    if (!publicMap || !allLocations) return;
    
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
                border: 3px solid white;
            ">✨</div>
        `,
        className: 'sparkle-marker',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
    });
    
    // Add markers for each location in allLocations
    allLocations.forEach((location, index) => {
        if (location.latitude && location.longitude) {
            const marker = L.marker([location.latitude, location.longitude], {
                icon: sparkleIcon,
                title: location.name
            }).addTo(publicMap);
            
            const popupContent = `
                <div style="font-family: 'Fredoka One', cursive; color: #1e293b; max-width: 300px;">
                    <h3 style="margin: 0 0 10px 0; color: #d4af37; font-size: 18px;">
                        ✨ ${location.name} ✨
                    </h3>
                    <div style="margin-bottom: 10px; font-family: 'Nunito', sans-serif;">
                        <h4 style="color: #4ecdc4; margin: 0 0 5px 0; font-size: 14px;">🔮 The Magic Here:</h4>
                        <p style="margin: 0; font-size: 13px; line-height: 1.4;">
                            ${location.magical_description}
                        </p>
                    </div>
                    <div style="font-family: 'Nunito', sans-serif;">
                        <h4 style="color: #96ceb4; margin: 0 0 5px 0; font-size: 14px;">👀 Look For:</h4>
                        <p style="margin: 0; font-size: 13px; line-height: 1.4;">
                            ${location.what_to_look_for}
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