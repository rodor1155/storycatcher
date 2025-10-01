// Simple Admin System for The Hidden World of London - RESET VERSION
// Back to localStorage but with proper website integration + Database sync

// Database Integration Functions
async function syncToDatabase(type, data) {
    try {
        if (window.dataManager && window.dataManager.databaseAvailable) {
            if (type === 'episodes') {
                await window.dataManager.saveEpisode(data);
            } else if (type === 'clans') {
                await window.dataManager.saveClan(data);
            } else if (type === 'locations') {
                await window.dataManager.saveLocation(data);
            }
            console.log('✅ Synced to database:', type, data.id);
        } else {
            console.log('ℹ️ Database not available, content saved locally only');
        }
    } catch (error) {
        console.warn('⚠️ Database sync failed (content saved locally):', error.message);
    }
}

async function deleteFromDatabase(type, id) {
    try {
        if (window.dataManager && window.dataManager.databaseAvailable) {
            if (type === 'episodes') {
                await window.dataManager.deleteEpisode(id);
            } else if (type === 'clans') {
                await window.dataManager.deleteClan(id);
            } else if (type === 'locations') {
                await window.dataManager.deleteLocation(id);
            }
            console.log('🗑️ Deleted from database:', type, id);
        } else {
            console.log('ℹ️ Database not available, deleted locally only');
        }
    } catch (error) {
        console.warn('⚠️ Database delete failed:', error.message);
    }
}

async function loadFromDatabase(type) {
    try {
        if (window.dataManager) {
            if (type === 'episodes') {
                return await window.dataManager.getEpisodes();
            } else if (type === 'clans') {
                return await window.dataManager.getClans();
            } else if (type === 'locations') {
                return await window.dataManager.getLocations();
            }
        }
    } catch (error) {
        console.warn('⚠️ Database load failed, using localStorage:', error);
    }
    return null;
}

// Configuration
const ADMIN_PASSWORD = 'hiddenworld2024';
const STORAGE_KEYS = {
    episodes: 'hiddenworld_episodes',
    clans: 'hiddenworld_clans',
    locations: 'hiddenworld_locations',
    adminAuth: 'hiddenworld_admin_auth',
    mainpage: 'hiddenworld_mainpage_content'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Register custom fonts with Quill before any editors are created
    registerQuillFonts();
    
    // Check if already logged in
    if (isLoggedIn()) {
        showDashboard();
        showTab('episodes');
        loadAllContent();
        initializeWYSIWYG();
    }
});

// Global font registration for Quill
function registerQuillFonts() {
    if (typeof Quill === 'undefined') {
        console.log('⏳ Quill not loaded yet, will register fonts when creating editors');
        return;
    }
    
    console.log('🔤 Registering fonts with Quill...');
    
    // Get Quill's Font class
    const Font = Quill.import('formats/font');
    
    // Define all our custom fonts
    const customFonts = [
        'serif', 'monospace', 'arial', 'helvetica', 'georgia', 'times-new-roman', 
        'courier-new', 'verdana', 'trebuchet-ms', 'comic-sans-ms', 'impact', 
        'lucida-sans', 'tahoma', 'fredoka-one', 'nunito', 'kalam', 'cinzel', 
        'schoolbell', 'caveat', 'dancing-script', 'playfair-display', 'merriweather', 
        'lora', 'open-sans', 'roboto', 'montserrat', 'poppins', 'raleway', 'source-sans-pro'
    ];
    
    // Add custom fonts to Quill's whitelist
    Font.whitelist = [...Font.whitelist, ...customFonts];
    
    // Register the updated Font with Quill
    Quill.register(Font, true);
    
    console.log(`✅ Registered ${customFonts.length} fonts with Quill`);
    window.quillFontsRegistered = true;
}

// Robust WYSIWYG Editor Management System
window.EditorManager = {
    editors: {},
    
    // Completely destroy all editors and cleanup DOM
    destroyAll: function() {
        console.log('🧹 DESTROYING ALL EDITORS...');
        
        // Save content first
        Object.keys(this.editors).forEach(id => {
            const editor = this.editors[id];
            if (editor && editor.root) {
                const textarea = document.getElementById(id);
                if (textarea) {
                    textarea.value = editor.root.innerHTML;
                }
            }
        });
        
        // Clear editors object
        this.editors = {};
        
        // Aggressively remove ALL Quill DOM elements
        document.querySelectorAll('.ql-toolbar').forEach(el => {
            console.log('Removing toolbar:', el);
            el.remove();
        });
        
        document.querySelectorAll('.ql-container').forEach(el => {
            console.log('Removing container:', el);
            el.remove();
        });
        
        document.querySelectorAll('[id$="-quill"]').forEach(el => {
            console.log('Removing quill div:', el.id);
            el.remove();
        });
        
        // Reset textareas
        document.querySelectorAll('textarea').forEach(textarea => {
            textarea.style.display = 'block';
        });
        
        console.log('✅ ALL EDITORS DESTROYED');
    },
    
    // Create editors only for visible textareas
    createForVisible: function() {
        if (typeof Quill === 'undefined') {
            setTimeout(() => this.createForVisible(), 500);
            return;
        }
        
        const targetIds = ['episode-content', 'clan-origin', 'clan-powers', 'clan-connection', 'location-magic', 'location-lookfor', 
                          'hero-title', 'hero-subtitle', 'episodes-title', 'episodes-description', 'stones-title', 'stones-description', 
                          'london-title', 'london-description', 'about-content', 'footer-tagline'];
        
        targetIds.forEach(id => {
            const textarea = document.getElementById(id);
            const isVisible = textarea && !textarea.closest('.hidden');
            
            if (isVisible && !this.editors[id]) {
                console.log(`📝 Creating editor: ${id}`);
                this.createSingle(id, textarea);
            }
        });
    },
    
    // Create single editor
    createSingle: function(id, textarea) {
        try {
            // First, register custom fonts with Quill
            this.registerCustomFonts();
            
            textarea.style.display = 'none';
            
            const container = document.createElement('div');
            container.id = id + '-quill';
            container.style.minHeight = '250px';
            textarea.parentNode.appendChild(container);
            
            console.log(`🎨 Creating editor for ${id} with enhanced font support`);

            const quill = new Quill(`#${id}-quill`, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'font': ['serif', 'monospace', 'arial', 'helvetica', 'georgia', 'times-new-roman', 'courier-new', 'verdana', 'trebuchet-ms', 'comic-sans-ms', 'impact', 'lucida-sans', 'tahoma', 'fredoka-one', 'nunito', 'kalam', 'cinzel', 'schoolbell', 'caveat', 'dancing-script', 'playfair-display', 'merriweather', 'lora', 'open-sans', 'roboto', 'montserrat', 'poppins', 'raleway', 'source-sans-pro'] }],
                        [{ 'size': ['small', false, 'large', 'huge'] }],  
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [
                            '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
                            '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
                            '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff',
                            '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
                            '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'
                        ]}, { 'background': [
                            '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
                            '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
                            '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff',
                            '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
                            '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466',
                            'transparent'
                        ]}],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['blockquote'],
                        ['link', 'image'],
                        ['clean']
                    ]
                },
                placeholder: textarea.placeholder || 'Write your content here...'
            });
            
            // Setup image handler
            const toolbar = quill.getModule('toolbar');
            toolbar.addHandler('image', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = function() {
                    const file = this.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const range = quill.getSelection(true);
                            quill.insertEmbed(range.index, 'image', e.target.result);
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            });
            
            this.editors[id] = quill;
            console.log(`✅ Created: ${id}`);
            
        } catch (error) {
            console.error(`❌ Failed: ${id}`, error);
        }
    },
    
    // Register custom fonts with Quill's Font module
    registerCustomFonts: function() {
        if (this.fontsRegistered || window.quillFontsRegistered) return; // Only register once
        
        // Call global registration function
        registerQuillFonts();
        this.fontsRegistered = true;
    },
    
    // Get content from editor
    getContent: function(id) {
        return this.editors[id] ? this.editors[id].root.innerHTML : '';
    },
    
    // Clear editor content
    clear: function(id) {
        if (this.editors[id]) {
            this.editors[id].setContents([]);
        }
    }
};

// Main initialize function
function initializeWYSIWYG() {
    console.log('🚀 Initializing WYSIWYG...');
    
    // First, destroy everything
    window.EditorManager.destroyAll();
    
    // Then create new ones after a brief delay
    setTimeout(() => {
        window.EditorManager.createForVisible();
    }, 200);
}

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    const password = document.getElementById('password').value;
    
    if (password === ADMIN_PASSWORD) {
        // Set auth token
        localStorage.setItem(STORAGE_KEYS.adminAuth, 'authenticated');
        showDashboard();
        showTab('episodes');
        loadAllContent();
        hideError();
    } else {
        showError();
        document.getElementById('password').value = '';
    }
}

function isLoggedIn() {
    return localStorage.getItem(STORAGE_KEYS.adminAuth) === 'authenticated';
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.adminAuth);
    showLogin();
}

function showDashboard() {
    document.getElementById('login-section').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    // Initialize WYSIWYG after dashboard is shown
    setTimeout(() => {
        initializeWYSIWYG();
    }, 200);
}

function showLogin() {
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('password').value = '';
}

function showError() {
    document.getElementById('login-error').classList.remove('hidden');
}

function hideError() {
    document.getElementById('login-error').classList.add('hidden');
}

// Tab Management
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-blue-500', 'text-blue-600');
        btn.classList.add('border-transparent', 'text-gray-500');
    });
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.remove('hidden');
    
    // Activate selected tab button
    const activeTab = document.getElementById('tab-' + tabName);
    activeTab.classList.add('border-blue-500', 'text-blue-600');
    activeTab.classList.remove('border-transparent', 'text-gray-500');
    
    // Reinitialize editors for the new tab
    setTimeout(() => {
        initializeWYSIWYG();
        initializeDragAndDrop();
        
        // If switching to main page tab, load the content
        if (tabName === 'mainpage') {
            loadMainPageContent();
        }
    }, 100);
}

// Episode Management (handles both create and update)
function addEpisode(event) {
    event.preventDefault();
    
    // Check if we're editing an existing episode
    const form = document.getElementById('episode-form');
    const editingId = form.querySelector('#editing-episode-id');
    const isEditing = editingId && editingId.value;
    
    // Get content from editor
    const richContent = window.EditorManager.getContent('episode-content') || document.getElementById('episode-content').value;
    
    // Get cover image if uploaded
    const coverPreview = document.getElementById('episode-cover-preview');
    const coverImage = coverPreview ? coverPreview.dataset.coverImage : null;
    
    // Get existing episodes
    const episodes = getStoredData('episodes');
    
    if (isEditing) {
        // UPDATE existing episode
        const episodeIndex = episodes.findIndex(ep => ep.id === editingId.value);
        if (episodeIndex !== -1) {
            // Keep original creation time and ID
            episodes[episodeIndex] = {
                ...episodes[episodeIndex], // Keep existing data
                title: document.getElementById('episode-title').value,
                meta_description: document.getElementById('episode-description').value,
                content: richContent,
                image_url: coverImage,
                updated_at: Date.now() // Add update timestamp
            };
            
            console.log('📝 Updated episode:', editingId.value);
            showSuccess('Episode updated successfully!');
        }
    } else {
        // CREATE new episode
        const episode = {
            id: 'ep' + Date.now(),
            title: document.getElementById('episode-title').value,
            meta_description: document.getElementById('episode-description').value,
            content: richContent,
            image_url: coverImage,
            created_at: Date.now(),
            page_type: 'episode',
            status: 'published'
        };
        
        episodes.push(episode); // Add to end (Episode 4, 5, 6...)
        console.log('➕ Created new episode');
        showSuccess('Episode added successfully as Episode ' + episodes.length + '!');
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.episodes, JSON.stringify(episodes));
    
    // Sync to database
    if (isEditing) {
        syncToDatabase('episodes', episodes[episodeIndex]);
    } else {
        syncToDatabase('episodes', episode);
    }
    
    // Update the website's data file
    updateWebsiteData();
    
    // Reset form to create mode
    cancelEpisodeEdit();
    
    // Reload episodes list
    loadEpisodes();
}

function loadEpisodes() {
    const episodes = getStoredData('episodes');
    const container = document.getElementById('episodes-list');
    
    if (episodes.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">No episodes yet. Add your first magical story!</p>';
        return;
    }
    
    // Add reorder instructions
    let html = `
        <div class="reorder-info">
            <i class="fas fa-info-circle mr-2"></i>
            <strong>💡 Tip:</strong> Drag episodes by the <i class="fas fa-grip-vertical"></i> handle to reorder them. The first episode appears first on the website.
        </div>
        <div id="sortable-episodes">
    `;
    
    html += episodes.map((episode, index) => `
        <div class="episode-item content-item" data-episode-id="${episode.id}">
            <div class="flex justify-between items-start mb-2">
                <div class="flex items-center">
                    <span class="drag-handle mr-3" title="Drag to reorder">
                        <i class="fas fa-grip-vertical text-lg"></i>
                    </span>
                    <div>
                        <div class="flex items-center mb-1">
                            <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-2">
                                Episode ${index + 1}
                            </span>
                            <h3 class="font-bold text-gray-800">${episode.title}</h3>
                        </div>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="editEpisode('${episode.id}')" class="btn-success text-sm" title="Edit this episode">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteEpisode('${episode.id}')" class="btn-danger text-sm" title="Delete this episode">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="text-gray-600 text-sm mb-2 ml-8">${episode.meta_description}</p>
            <p class="text-gray-500 text-xs ml-8">${stripHtmlForDisplay(episode.content, 150)}</p>
            <div class="text-xs text-gray-400 mt-2 ml-8">
                Created: ${new Date(episode.created_at).toLocaleDateString()}
            </div>
        </div>
    `).join('');
    
    html += '</div>';
    container.innerHTML = html;
    
    // Initialize drag and drop
    initializeEpisodeReordering();
}

// Initialize episode drag and drop reordering
function initializeEpisodeReordering() {
    const sortableContainer = document.getElementById('sortable-episodes');
    if (!sortableContainer) return;
    
    new Sortable(sortableContainer, {
        handle: '.drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        onEnd: function(evt) {
            // Get current episode order
            const episodes = getStoredData('episodes');
            const reorderedEpisodes = [];
            
            // Get new order from DOM
            const episodeElements = sortableContainer.children;
            for (let element of episodeElements) {
                const episodeId = element.dataset.episodeId;
                const episode = episodes.find(ep => ep.id === episodeId);
                if (episode) {
                    reorderedEpisodes.push(episode);
                }
            }
            
            // Save new order
            localStorage.setItem(STORAGE_KEYS.episodes, JSON.stringify(reorderedEpisodes));
            updateWebsiteData();
            
            // Reload to update episode numbers
            loadEpisodes();
            showSuccess('Episodes reordered successfully! The website will show the new order.');
        }
    });
}

// Episode editing functionality
function editEpisode(episodeId) {
    console.log('📝 Editing episode:', episodeId);
    
    // Find the episode
    const episodes = getStoredData('episodes');
    const episode = episodes.find(ep => ep.id === episodeId);
    
    if (!episode) {
        alert('Episode not found!');
        return;
    }
    
    // Switch to episodes tab if not already there
    showTab('episodes');
    
    // Scroll to the form
    setTimeout(() => {
        const form = document.getElementById('episode-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Populate the form
        populateEpisodeForm(episode);
        
        // Show editing indicator
        showEditingMessage(episode.title);
        
    }, 100);
}

// Populate episode form with existing data
function populateEpisodeForm(episode) {
    console.log('📋 Populating form with episode data');
    
    // Fill basic fields
    document.getElementById('episode-title').value = episode.title;
    document.getElementById('episode-description').value = episode.meta_description;
    
    // Handle cover image
    const coverPreview = document.getElementById('episode-cover-preview');
    if (episode.image_url && coverPreview) {
        coverPreview.innerHTML = `
            <div class="mt-2">
                <img src="${episode.image_url}" class="uploaded-image" alt="Cover preview">
                <p class="text-sm text-gray-600 mt-1">Current cover image (upload new to replace)</p>
            </div>
        `;
        coverPreview.dataset.coverImage = episode.image_url;
    }
    
    // Fill rich text editor content
    setTimeout(() => {
        const contentEditor = window.EditorManager.editors['episode-content'];
        if (contentEditor) {
            contentEditor.root.innerHTML = episode.content;
            console.log('✅ Populated rich text editor');
        } else {
            // Fallback to textarea
            const textarea = document.getElementById('episode-content');
            if (textarea) {
                textarea.value = episode.content;
            }
        }
    }, 200);
    
    // Change form to update mode
    setFormToUpdateMode(episode.id);
}

// Set form to update mode instead of create mode
function setFormToUpdateMode(episodeId) {
    const form = document.getElementById('episode-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Change submit button
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Episode';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('bg-orange-500', 'hover:bg-orange-600');
    
    // Add hidden field for episode ID
    let hiddenId = form.querySelector('#editing-episode-id');
    if (!hiddenId) {
        hiddenId = document.createElement('input');
        hiddenId.type = 'hidden';
        hiddenId.id = 'editing-episode-id';
        form.appendChild(hiddenId);
    }
    hiddenId.value = episodeId;
    
    // Add cancel button
    let cancelBtn = form.querySelector('#cancel-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'cancel-edit-btn';
        cancelBtn.className = 'ml-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg';
        cancelBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Cancel';
        cancelBtn.onclick = cancelEpisodeEdit;
        submitBtn.parentNode.appendChild(cancelBtn);
    }
    
    console.log('🔄 Form switched to update mode');
}

// Cancel episode editing
function cancelEpisodeEdit() {
    const form = document.getElementById('episode-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const hiddenId = form.querySelector('#editing-episode-id');
    const cancelBtn = form.querySelector('#cancel-edit-btn');
    
    // Reset form
    form.reset();
    window.EditorManager.clear('episode-content');
    
    // Clear cover preview
    const coverPreview = document.getElementById('episode-cover-preview');
    if (coverPreview) {
        coverPreview.innerHTML = '';
        delete coverPreview.dataset.coverImage;
    }
    
    // Reset submit button
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Add Episode';
    submitBtn.classList.add('btn-primary');
    submitBtn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
    
    // Remove hidden ID and cancel button
    if (hiddenId) hiddenId.remove();
    if (cancelBtn) cancelBtn.remove();
    
    hideEditingMessage();
    console.log('❌ Episode edit cancelled');
}

// Show editing message
function showEditingMessage(episodeTitle) {
    const container = document.querySelector('#episodes-tab .admin-card');
    let msg = container.querySelector('#editing-message');
    
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'editing-message';
        msg.className = 'mb-4 p-3 bg-orange-100 border border-orange-300 rounded text-orange-800';
        container.insertBefore(msg, container.firstChild);
    }
    
    msg.innerHTML = `
        <i class="fas fa-edit mr-2"></i>
        <strong>Editing Episode:</strong> "${episodeTitle}"
    `;
}

// Hide editing message
function hideEditingMessage() {
    const msg = document.querySelector('#editing-message');
    if (msg) {
        msg.remove();
    }
}

function deleteEpisode(episodeId) {
    if (confirm('Are you sure you want to delete this episode?')) {
        const episodes = getStoredData('episodes');
        const filtered = episodes.filter(ep => ep.id !== episodeId);
        localStorage.setItem(STORAGE_KEYS.episodes, JSON.stringify(filtered));
        
        // Delete from database
        deleteFromDatabase('episodes', episodeId);
        
        updateWebsiteData();
        loadEpisodes();
        showSuccess('Episode deleted successfully!');
    }
}

// Clan Management
function addClan(event) {
    console.log('🔮 Add/Update Clan function called');
    event.preventDefault();
    
    try {
        // Check if we're editing an existing clan
        const form = document.getElementById('clan-form');
        const editingId = form.querySelector('#editing-clan-id');
        const isEditing = editingId && editingId.value;
        
        // Get content from editors
        const clanName = document.getElementById('clan-name').value;
        const originContent = window.EditorManager.getContent('clan-origin') || document.getElementById('clan-origin').value;
        const powersContent = window.EditorManager.getContent('clan-powers') || document.getElementById('clan-powers').value;
        const connectionContent = window.EditorManager.getContent('clan-connection') || document.getElementById('clan-connection').value;
        
        // Validate required fields
        if (!clanName || clanName.trim() === '') {
            alert('Please enter a clan name!');
            return;
        }
        
        if (!originContent || originContent.trim() === '') {
            alert('Please enter the clan origin story!');
            return;
        }
        
        if (!powersContent || powersContent.trim() === '') {
            alert('Please enter the clan powers!');
            return;
        }
        
        if (!connectionContent || connectionContent.trim() === '') {
            alert('Please enter how to connect with the clan!');
            return;
        }
        
        const clans = getStoredData('clans');
        
        if (isEditing) {
            // UPDATE existing clan
            const clanIndex = clans.findIndex(c => c.id === editingId.value);
            if (clanIndex !== -1) {
                clans[clanIndex] = {
                    ...clans[clanIndex], // Keep existing data like id
                    name: clanName,
                    stone_description: originContent,
                    offering: powersContent,
                    resonance_note: connectionContent,
                    color_primary: document.getElementById('clan-color1').value,
                    color_secondary: document.getElementById('clan-color2').value,
                    updated_at: Date.now()
                };
                
                console.log('📝 Updated clan:', editingId.value);
                showSuccess('Clan stone updated successfully!');
            }
        } else {
            // CREATE new clan
            const clan = {
                id: 'clan' + Date.now(),
                name: clanName,
                stone_description: originContent,
                offering: powersContent,
                resonance_note: connectionContent,
                color_primary: document.getElementById('clan-color1').value,
                color_secondary: document.getElementById('clan-color2').value,
                emblem_url: null,
                status: 'active'
            };
            
            clans.push(clan);
            console.log('➕ Created new clan');
            showSuccess('Clan stone added successfully with rich formatting!');
        }
        
        localStorage.setItem(STORAGE_KEYS.clans, JSON.stringify(clans));
        
        // Sync to database
        if (isEditing) {
            syncToDatabase('clans', clans[clanIndex]);
        } else {
            syncToDatabase('clans', clan);
        }
        
        updateWebsiteData();
        
        // Reset form to create mode
        cancelClanEdit();
        
        loadClans();
        console.log('✅ Clan operation completed');
        
    } catch (error) {
        console.error('❌ Error with clan:', error);
        alert('Error with clan: ' + error.message);
    }
}

function loadClans() {
    const clans = getStoredData('clans');
    const container = document.getElementById('clans-list');
    
    if (clans.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">No clan stones yet. Create your first magical clan!</p>';
        return;
    }
    
    container.innerHTML = clans.map(clan => `
        <div class="content-item">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-800">${clan.name}</h3>
                <div class="flex space-x-2">
                    <button onclick="editClan('${clan.id}')" class="btn-success text-sm" title="Edit this clan">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteClan('${clan.id}')" class="btn-danger text-sm" title="Delete this clan">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="flex items-center mb-2">
                <div class="w-4 h-4 rounded-full mr-2" style="background: linear-gradient(45deg, ${clan.color_primary}, ${clan.color_secondary})"></div>
                <p class="text-gray-600 text-sm">${stripHtmlForDisplay(clan.offering, 100)}</p>
            </div>
        </div>
    `).join('');
}

// Clan editing functionality
function editClan(clanId) {
    console.log('🔮 Editing clan:', clanId);
    
    // Find the clan
    const clans = getStoredData('clans');
    const clan = clans.find(c => c.id === clanId);
    
    if (!clan) {
        alert('Clan not found!');
        return;
    }
    
    // Switch to clans tab if not already there
    showTab('clans');
    
    // Scroll to the form
    setTimeout(() => {
        const form = document.getElementById('clan-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Populate the form
        populateClanForm(clan);
        
        // Show editing indicator
        showClanEditingMessage(clan.name);
        
    }, 100);
}

// Populate clan form with existing data
function populateClanForm(clan) {
    console.log('🔮 Populating clan form with data');
    
    // Fill basic fields
    document.getElementById('clan-name').value = clan.name;
    document.getElementById('clan-color1').value = clan.color_primary;
    document.getElementById('clan-color2').value = clan.color_secondary;
    
    // Fill rich text editor content
    setTimeout(() => {
        const originEditor = window.EditorManager.editors['clan-origin'];
        const powersEditor = window.EditorManager.editors['clan-powers'];
        const connectionEditor = window.EditorManager.editors['clan-connection'];
        
        if (originEditor) {
            originEditor.root.innerHTML = clan.stone_description;
        } else {
            document.getElementById('clan-origin').value = clan.stone_description;
        }
        
        if (powersEditor) {
            powersEditor.root.innerHTML = clan.offering;
        } else {
            document.getElementById('clan-powers').value = clan.offering;
        }
        
        if (connectionEditor) {
            connectionEditor.root.innerHTML = clan.resonance_note;
        } else {
            document.getElementById('clan-connection').value = clan.resonance_note;
        }
        
        console.log('✅ Populated clan form');
    }, 200);
    
    // Change form to update mode
    setClanFormToUpdateMode(clan.id);
}

// Set clan form to update mode
function setClanFormToUpdateMode(clanId) {
    const form = document.getElementById('clan-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Change submit button
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Clan Stone';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('bg-orange-500', 'hover:bg-orange-600');
    
    // Add hidden field for clan ID
    let hiddenId = form.querySelector('#editing-clan-id');
    if (!hiddenId) {
        hiddenId = document.createElement('input');
        hiddenId.type = 'hidden';
        hiddenId.id = 'editing-clan-id';
        form.appendChild(hiddenId);
    }
    hiddenId.value = clanId;
    
    // Add cancel button
    let cancelBtn = form.querySelector('#cancel-clan-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'cancel-clan-edit-btn';
        cancelBtn.className = 'ml-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg';
        cancelBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Cancel';
        cancelBtn.onclick = cancelClanEdit;
        submitBtn.parentNode.appendChild(cancelBtn);
    }
    
    console.log('🔄 Clan form switched to update mode');
}

// Cancel clan editing
function cancelClanEdit() {
    const form = document.getElementById('clan-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const hiddenId = form.querySelector('#editing-clan-id');
    const cancelBtn = form.querySelector('#cancel-clan-edit-btn');
    
    // Reset form
    form.reset();
    window.EditorManager.clear('clan-origin');
    window.EditorManager.clear('clan-powers');
    window.EditorManager.clear('clan-connection');
    
    // Reset submit button
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Add Clan Stone';
    submitBtn.classList.add('btn-primary');
    submitBtn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
    
    // Remove hidden ID and cancel button
    if (hiddenId) hiddenId.remove();
    if (cancelBtn) cancelBtn.remove();
    
    hideClanEditingMessage();
    console.log('❌ Clan edit cancelled');
}

// Show clan editing message
function showClanEditingMessage(clanName) {
    const container = document.querySelector('#clans-tab .admin-card');
    let msg = container.querySelector('#clan-editing-message');
    
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'clan-editing-message';
        msg.className = 'mb-4 p-3 bg-orange-100 border border-orange-300 rounded text-orange-800';
        container.insertBefore(msg, container.firstChild);
    }
    
    msg.innerHTML = `
        <i class="fas fa-edit mr-2"></i>
        <strong>Editing Clan:</strong> "${clanName}"
    `;
}

// Hide clan editing message
function hideClanEditingMessage() {
    const msg = document.querySelector('#clan-editing-message');
    if (msg) {
        msg.remove();
    }
}

function deleteClan(clanId) {
    if (confirm('Are you sure you want to delete this clan stone?')) {
        const clans = getStoredData('clans');
        const filtered = clans.filter(clan => clan.id !== clanId);
        localStorage.setItem(STORAGE_KEYS.clans, JSON.stringify(filtered));
        
        // Delete from database
        deleteFromDatabase('clans', clanId);
        
        updateWebsiteData();
        loadClans();
        showSuccess('Clan stone deleted successfully!');
    }
}

// Location Management
function addLocation(event) {
    console.log('🗺️ Add/Update Location function called');
    event.preventDefault();
    
    try {
        // Check if we're editing an existing location
        const form = document.getElementById('location-form');
        const editingId = form.querySelector('#editing-location-id');
        const isEditing = editingId && editingId.value;
        
        // Get content from editors and form fields
        const locationName = document.getElementById('location-name').value;
        const latitude = parseFloat(document.getElementById('location-lat').value);
        const longitude = parseFloat(document.getElementById('location-lng').value);
        const magicDescription = window.EditorManager.getContent('location-magic') || document.getElementById('location-magic').value;
        const lookForContent = window.EditorManager.getContent('location-lookfor') || document.getElementById('location-lookfor').value;
        
        // Validate required fields
        if (!locationName || locationName.trim() === '') {
            alert('Please enter a location name!');
            return;
        }
        
        if (isNaN(latitude) || isNaN(longitude)) {
            alert('Please enter valid latitude and longitude!');
            return;
        }
        
        if (!magicDescription || magicDescription.trim() === '') {
            alert('Please enter the magical description!');
            return;
        }
        
        if (!lookForContent || lookForContent.trim() === '') {
            alert('Please enter what to look for!');
            return;
        }
        
        const locations = getStoredData('locations');
        
        if (isEditing) {
            // UPDATE existing location
            const locationIndex = locations.findIndex(l => l.id === editingId.value);
            if (locationIndex !== -1) {
                locations[locationIndex] = {
                    ...locations[locationIndex], // Keep existing data like id
                    name: locationName,
                    latitude: latitude,
                    longitude: longitude,
                    magical_description: magicDescription,
                    what_to_look_for: lookForContent,
                    updated_at: Date.now()
                };
                
                console.log('📝 Updated location:', editingId.value);
                showSuccess('Location updated successfully!');
            }
        } else {
            // CREATE new location
            const location = {
                id: 'loc' + Date.now(),
                name: locationName,
                latitude: latitude,
                longitude: longitude,
                magical_description: magicDescription,
                what_to_look_for: lookForContent,
                image_url: null,
                status: 'active'
            };
            
            locations.push(location);
            console.log('➕ Created new location');
            showSuccess('Location added successfully with rich formatting!');
        }
        
        localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(locations));
        
        // Sync to database
        if (isEditing) {
            syncToDatabase('locations', locations[locationIndex]);
        } else {
            syncToDatabase('locations', location);
        }
        
        updateWebsiteData();
        
        // Reset form to create mode
        cancelLocationEdit();
        loadLocations();
        
    } catch (error) {
        console.error('❌ Error in addLocation:', error);
        alert('Error saving location: ' + error.message);
    }
}

function loadLocations() {
    const locations = getStoredData('locations');
    const container = document.getElementById('locations-list');
    
    if (locations.length === 0) {
        container.innerHTML = '<p class="text-gray-500 italic">No locations yet. Add your first magical place!</p>';
        return;
    }
    
    container.innerHTML = locations.map(location => `
        <div class="content-item">
            <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-gray-800">${location.name}</h3>
                <div class="flex space-x-2">
                    <button onclick="editLocation('${location.id}')" class="btn-success text-sm" title="Edit this location">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteLocation('${location.id}')" class="btn-danger text-sm" title="Delete this location">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <p class="text-gray-600 text-sm mb-1">${stripHtmlForDisplay(location.magical_description, 100)}</p>
            <p class="text-xs text-gray-400">📍 ${location.latitude}, ${location.longitude}</p>
        </div>
    `).join('');
}

function editLocation(locationId) {
    console.log('🗺️ Editing location:', locationId);
    
    // Find the location
    const locations = getStoredData('locations');
    const location = locations.find(l => l.id === locationId);
    
    if (!location) {
        alert('Location not found!');
        return;
    }
    
    // Switch to locations tab if not already there
    showTab('locations');
    
    // Scroll to the form
    setTimeout(() => {
        const form = document.getElementById('location-form');
        if (form) {
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        
        // Populate the form
        populateLocationForm(location);
        
        // Show editing indicator
        showLocationEditingMessage(location.name);
        
    }, 100);
}

// Populate location form with existing data
function populateLocationForm(location) {
    console.log('🗺️ Populating location form with data');
    
    // Fill basic fields
    document.getElementById('location-name').value = location.name;
    document.getElementById('location-lat').value = location.latitude;
    document.getElementById('location-lng').value = location.longitude;
    
    // Fill rich text editor content
    setTimeout(() => {
        const magicEditor = window.EditorManager.editors['location-magic'];
        const lookforEditor = window.EditorManager.editors['location-lookfor'];
        
        if (magicEditor) {
            magicEditor.root.innerHTML = location.magical_description;
        } else {
            document.getElementById('location-magic').value = location.magical_description;
        }
        
        if (lookforEditor) {
            lookforEditor.root.innerHTML = location.what_to_look_for;
        } else {
            document.getElementById('location-lookfor').value = location.what_to_look_for;
        }
        
        console.log('✅ Populated location form');
    }, 200);
    
    // Change form to update mode
    setLocationFormToUpdateMode(location.id);
}

// Set location form to update mode
function setLocationFormToUpdateMode(locationId) {
    const form = document.getElementById('location-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Change submit button
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Update Location';
    submitBtn.classList.remove('btn-primary');
    submitBtn.classList.add('bg-orange-500', 'hover:bg-orange-600');
    
    // Add hidden field for location ID
    let hiddenId = form.querySelector('#editing-location-id');
    if (!hiddenId) {
        hiddenId = document.createElement('input');
        hiddenId.type = 'hidden';
        hiddenId.id = 'editing-location-id';
        form.appendChild(hiddenId);
    }
    hiddenId.value = locationId;
    
    // Add cancel button
    let cancelBtn = form.querySelector('#cancel-location-edit-btn');
    if (!cancelBtn) {
        cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'cancel-location-edit-btn';
        cancelBtn.className = 'ml-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-2 rounded-lg';
        cancelBtn.innerHTML = '<i class="fas fa-times mr-2"></i>Cancel';
        cancelBtn.onclick = cancelLocationEdit;
        submitBtn.parentNode.appendChild(cancelBtn);
    }
    
    console.log('🔄 Location form switched to update mode');
}

// Cancel location editing
function cancelLocationEdit() {
    const form = document.getElementById('location-form');
    const submitBtn = form.querySelector('button[type="submit"]');
    const hiddenId = form.querySelector('#editing-location-id');
    const cancelBtn = form.querySelector('#cancel-location-edit-btn');
    
    // Reset form
    form.reset();
    window.EditorManager.clear('location-magic');
    window.EditorManager.clear('location-lookfor');
    
    // Reset submit button
    submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Add Location';
    submitBtn.classList.add('btn-primary');
    submitBtn.classList.remove('bg-orange-500', 'hover:bg-orange-600');
    
    // Remove hidden ID and cancel button
    if (hiddenId) hiddenId.remove();
    if (cancelBtn) cancelBtn.remove();
    
    hideLocationEditingMessage();
    console.log('❌ Location edit cancelled');
}

// Show location editing message
function showLocationEditingMessage(locationName) {
    const container = document.querySelector('#locations-tab .admin-card');
    let msg = container.querySelector('#location-editing-message');
    
    if (!msg) {
        msg = document.createElement('div');
        msg.id = 'location-editing-message';
        msg.className = 'mb-4 p-3 bg-orange-100 border border-orange-300 rounded text-orange-800';
        container.insertBefore(msg, container.firstChild);
    }
    
    msg.innerHTML = `
        <i class="fas fa-edit mr-2"></i>
        <strong>Editing Location:</strong> "${locationName}"
    `;
}

// Hide location editing message
function hideLocationEditingMessage() {
    const msg = document.querySelector('#location-editing-message');
    if (msg) {
        msg.remove();
    }
}

function deleteLocation(locationId) {
    if (confirm('Are you sure you want to delete this location?')) {
        const locations = getStoredData('locations');
        const filtered = locations.filter(loc => loc.id !== locationId);
        localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(filtered));
        
        // Delete from database
        deleteFromDatabase('locations', locationId);
        
        updateWebsiteData();
        loadLocations();
        showSuccess('Location deleted successfully!');
    }
}

// Utility Functions
function getStoredData(type) {
    const stored = localStorage.getItem(STORAGE_KEYS[type]);
    if (stored) {
        return JSON.parse(stored);
    }
    
    // Return default data if none stored
    return getDefaultData(type);
}

function getDefaultData(type) {
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
            },
            {
                id: 'ep2',
                title: 'The Secret of Fleet River',
                meta_description: 'Follow Maya as she discovers the hidden Fleet River and learns why some waters remember everything.',
                content: '<p>Maya pressed her ear to the pavement near Blackfriars Bridge. Other children thought she was playing, but Maya could hear something magical...</p><p>Beneath the busy London streets, the Fleet River still flows, carrying messages between the clan stones. Maya was the first to hear its call in over fifty years...</p>',
                created_at: Date.now() - 172800000,
                image_url: null,
                page_type: 'episode',
                status: 'published'
            },
            {
                id: 'ep3',
                title: 'The Crystal Garden of Covent Garden',
                meta_description: 'Explore the hidden crystal garden where the Earth Clan stone teaches children to speak with growing things.',
                content: '<p>Behind the market stalls of Covent Garden, there is a garden that only appears to children who truly believe in magic...</p><p>Tommy discovered it when he was looking for his lost marble. But what he found instead was a garden where flowers sang and trees offered advice in rustling whispers...</p>',
                created_at: Date.now() - 259200000,
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
            },
            {
                id: 'clan2',
                name: 'Earth Clan',
                stone_description: 'Born from the deep clay beneath London, this stone contains the memories of every tree that ever grew in the city. It glows with warm brown and green light, and smells like fresh soil after rain.',
                offering: 'The ability to make plants grow, to speak with animals, and to sense the health of the earth. Members can find lost things by asking the ground to remember, and they always know which direction leads home.',
                resonance_note: 'Plant something with your own hands and whisper "I help you grow." Care for it daily, and the stone will notice your dedication.',
                color_primary: '#16A34A',
                color_secondary: '#84CC16',
                emblem_url: null,
                status: 'active'
            },
            {
                id: 'clan3',
                name: 'Sky Clan',
                stone_description: 'This stone fell from the London sky on a night when all the stars seemed especially bright. It floats slightly above the ground and changes color like the sky throughout the day and night.',
                offering: 'The gift of flying in dreams that feel completely real, the ability to predict weather by feeling it in your bones, and the power to send messages on the wind. Members can breathe comfortably at any height.',
                resonance_note: 'On a windy day, spread your arms wide and say "I am ready to soar." If the wind lifts your hair and fills your heart with lightness, the stone has heard you.',
                color_primary: '#3B82F6',
                color_secondary: '#8B5CF6',
                emblem_url: null,
                status: 'active'
            },
            {
                id: 'clan4',
                name: 'Fire Clan',
                stone_description: 'Forged in the great fire of London and cooled in Thames water, this stone burns without consuming and lights without blinding. It pulses with warmth and casts dancing shadows that tell stories.',
                offering: 'The power to bring warmth to cold hearts, to light any darkness (including the darkness of sadness), and to forge unbreakable friendships. Members can create beautiful things from raw materials and their presence makes others feel brave.',
                resonance_note: 'Light a candle and speak your deepest wish to the flame. If the fire dances in response and fills you with courage, you have the Fire Clan\'s attention.',
                color_primary: '#EF4444',
                color_secondary: '#F59E0B',
                emblem_url: null,
                status: 'active'
            },
            {
                id: 'clan5',
                name: 'Shadow Clan',
                stone_description: 'The most mysterious stone, it appears as black as midnight but reflects all colors when moonlight touches it. It emerged during London\'s darkest hour and teaches that shadows are not evil, but necessary for light to have meaning.',
                offering: 'The ability to move unseen when needed, to understand hidden emotions, and to help others face their fears. Members can step into shadows to travel quickly across the city and they see clearly in complete darkness.',
                resonance_note: 'Stand alone in a shadow and say "I am not afraid of the dark within me or around me." If you feel peaceful rather than frightened, the Shadow Clan recognizes your wisdom.',
                color_primary: '#6366F1',
                color_secondary: '#8B5CF6',
                emblem_url: null,
                status: 'active'
            }
        ],
        locations: [
            {
                id: 'loc1',
                name: "Cleopatra's Needle",
                latitude: 51.5081,
                longitude: -0.1195,
                magical_description: "Here, where Cleopatra's Needle pierces the London sky, the ancient Egyptian magic still hums in the stone. The Thames whispers secrets of empires past, and children who touch the bronze sphinxes at sunset can hear hieroglyphs telling their stories.",
                what_to_look_for: "Look for the bronze sphinxes at the base - they have tiny scratches that form letters in ancient languages. Notice how the light changes around the obelisk at different times of day, and listen for the sound of ancient chanting on windy afternoons.",
                image_url: null,
                status: 'active'
            },
            {
                id: 'loc2',
                name: "Fleet River",
                latitude: 51.5134,
                longitude: -0.1044,
                magical_description: "The Fleet River still flows beneath your feet, carrying messages between the clan stones. Listen carefully to the stones—they remember when this was a rushing waterway that powered London's first mills and carried away the city's secrets.",
                what_to_look_for: "Find the Fleet River marker near the bridge, and notice the subtle sound of water that shouldn't be there. Place your ear to the ground near the marker - children with clan stone connections can hear the river's whispered messages.",
                image_url: null,
                status: 'active'
            },
            {
                id: 'loc3',
                name: "Blackfriars Bridge",
                latitude: 51.511,
                longitude: -0.103,
                magical_description: "Where the ancient bridge crosses the Fleet of memory, two worlds meet. The stones here have witnessed a thousand years of London's secrets, from Roman roads to medieval monasteries to the magical awakening of the clan stones.",
                what_to_look_for: "Stand on the bridge and feel for the vibration beneath—the old river's pulse still beats strong. Look for the small carved symbols on the bridge stones that only appear when the light is just right, usually just after rain.",
                image_url: null,
                status: 'active'
            }
        ]
    };
    
    return defaults[type] || [];
}

// Helper function to strip HTML for display in lists
function stripHtmlForDisplay(html, maxLength = 100) {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// IMPORTANT: Update website data files when content changes
function updateWebsiteData() {
    console.log('📤 Content updated! Website will show new content immediately.');
    
    // Create a data file that your main website can read
    const websiteData = {
        episodes: getStoredData('episodes'),
        clans: getStoredData('clans'),
        locations: getStoredData('locations'),
        mainpage: JSON.parse(localStorage.getItem(STORAGE_KEYS.mainpage) || '{}'),
        last_updated: Date.now()
    };
    
    // Save to localStorage with a special key for the website
    localStorage.setItem('hiddenworld_website_data', JSON.stringify(websiteData));
    
    // Also create a global variable for immediate access
    window.hiddenWorldData = websiteData;
    
    // Dispatch event for main website to listen for
    if (window.opener || window.parent !== window) {
        try {
            if (window.opener) {
                window.opener.postMessage({
                    type: 'hiddenworld_update',
                    data: websiteData
                }, '*');
            }
        } catch (e) {
            console.log('Could not notify parent window:', e);
        }
    }
    
    console.log('✅ Website data updated and ready for visitors!');
}

function showSuccess(message) {
    document.getElementById('success-text').textContent = message;
    document.getElementById('success-message').classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
        document.getElementById('success-message').classList.add('hidden');
    }, 3000);
}

// Main Page Content Management
function saveMainPageContent(event) {
    event.preventDefault();
    console.log('💾 Saving main page content...');
    
    // Collect content from all editors and fallback to textareas
    const content = {
        hero: {
            title: window.EditorManager.getContent('hero-title') || document.getElementById('hero-title').value,
            subtitle: window.EditorManager.getContent('hero-subtitle') || document.getElementById('hero-subtitle').value
        },
        episodes: {
            title: window.EditorManager.getContent('episodes-title') || document.getElementById('episodes-title').value,
            description: window.EditorManager.getContent('episodes-description') || document.getElementById('episodes-description').value
        },
        stones: {
            title: window.EditorManager.getContent('stones-title') || document.getElementById('stones-title').value,
            description: window.EditorManager.getContent('stones-description') || document.getElementById('stones-description').value
        },
        london: {
            title: window.EditorManager.getContent('london-title') || document.getElementById('london-title').value,
            description: window.EditorManager.getContent('london-description') || document.getElementById('london-description').value
        },
        about: {
            content: window.EditorManager.getContent('about-content') || document.getElementById('about-content').value
        },
        footer: {
            tagline: window.EditorManager.getContent('footer-tagline') || document.getElementById('footer-tagline').value
        },
        updated_at: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.mainpage, JSON.stringify(content));
    
    console.log('✅ Main page content saved:', content);
    
    // Update the main site
    updateWebsiteData();
    
    // Show success message
    showSuccess('Main page content saved successfully! Your homepage has been updated.');
}

function loadMainPageContent() {
    console.log('📖 Loading main page content...');
    
    const stored = localStorage.getItem(STORAGE_KEYS.mainpage);
    let content;
    
    if (stored) {
        content = JSON.parse(stored);
        console.log('📚 Loaded stored content');
    } else {
        content = getDefaultMainPageContent();
        console.log('📋 Using default content (existing homepage content)');
    }
    
    // Check if main page tab is currently visible before populating
    const mainPageTab = document.getElementById('mainpage-tab');
    if (mainPageTab && !mainPageTab.classList.contains('hidden')) {
        // Populate form fields with multiple attempts to ensure editors are ready
        setTimeout(() => {
            populateMainPageForm(content);
        }, 300);
        
        // Backup attempt in case first one fails
        setTimeout(() => {
            populateMainPageForm(content);
        }, 1000);
    } else {
        console.log('ℹ️ Main page tab not visible, content will load when tab is shown');
    }
}

function populateMainPageForm(content) {
    console.log('📝 Populating main page form...');
    
    // Helper function to set content in editor or textarea with retry logic
    const setContent = (editorId, htmlContent) => {
        const trySet = (attempts = 0) => {
            const editor = window.EditorManager.editors[editorId];
            if (editor && editor.root) {
                editor.root.innerHTML = htmlContent || '';
                console.log(`✅ Set content for ${editorId} via editor`);
            } else {
                const textarea = document.getElementById(editorId);
                if (textarea) {
                    textarea.value = htmlContent || '';
                    console.log(`✅ Set content for ${editorId} via textarea`);
                } else if (attempts < 5) {
                    // Retry up to 5 times with increasing delay
                    setTimeout(() => trySet(attempts + 1), 200 * (attempts + 1));
                    console.log(`⏳ Retrying ${editorId} (attempt ${attempts + 1})`);
                } else {
                    console.warn(`❌ Could not set content for ${editorId}`);
                }
            }
        };
        trySet();
    };
    
    // Populate all fields
    setContent('hero-title', content.hero?.title);
    setContent('hero-subtitle', content.hero?.subtitle);
    setContent('episodes-title', content.episodes?.title);
    setContent('episodes-description', content.episodes?.description);
    setContent('stones-title', content.stones?.title);
    setContent('stones-description', content.stones?.description);
    setContent('london-title', content.london?.title);
    setContent('london-description', content.london?.description);
    setContent('about-content', content.about?.content);
    setContent('footer-tagline', content.footer?.tagline);
    
    console.log('✅ Main page form population initiated');
}

function getDefaultMainPageContent() {
    return {
        hero: {
            title: 'There is a <span class="magical-text sparkle-effect">✨ hidden world ✨</span><br>beneath London...',
            subtitle: '🏰 Where ancient stones hold memories, 🌊 forgotten rivers whisper secrets, and the city\'s ✨ magical heart ✨ beats beneath the cobblestones. 🗝️'
        },
        episodes: {
            title: '📚 Recent Episodes',
            description: 'Follow the unfolding story through glimpses and fragments from the hidden world'
        },
        stones: {
            title: '🔮 The Clan Stones',
            description: 'Each clan stone carries the essence of London\'s hidden elements. Choose your path and discover what the stones may offer you.'
        },
        london: {
            title: '🗺️ Hidden London',
            description: 'Discover the magical locations scattered across London where the veil between worlds grows thin'
        },
        about: {
            content: `<div class="text-lg text-slate-300 space-y-6 leading-relaxed">
                    <p>
                        The Hidden World of London is a magical journey of discovery, designed to spark 
                        curiosity and wonder in children and adults alike. Through painted stones, 
                        hidden locations, and mythical storytelling, we invite you to see London 
                        through new eyes.
                    </p>
                    <p>
                        Our project celebrates the rich history and mythology of London while creating 
                        new stories for the next generation. Every stone is painted with non-toxic materials, 
                        every location is safe to explore, and every story is crafted with kindness and imagination.
                    </p>
                    <p class="text-london-gold font-semibold">
                        This is London as you've never seen it before—magical, mysterious, and waiting for you to discover its secrets.
                    </p>
                </div>
                <div class="mt-12">
                    <h3 class="text-xl font-cinzel font-semibold mb-4">For Parents & Guardians</h3>
                    <p class="text-slate-300">
                        All activities are designed with safety in mind. Stones are painted with child-safe, 
                        non-toxic materials. Location clues encourage observation and imagination without 
                        requiring dangerous exploration. This is a project about wonder, discovery, and 
                        the magic that surrounds us in everyday London.
                    </p>
                </div>`
        },
        footer: {
            tagline: 'Where magic meets the everyday, and London reveals its deepest secrets'
        }
    };
}

function resetMainPageContent() {
    if (confirm('Are you sure you want to reset all main page content to defaults? This will overwrite your current content.')) {
        // Clear localStorage
        localStorage.removeItem(STORAGE_KEYS.mainpage);
        
        // Reload default content
        loadMainPageContent();
        
        // Update website
        updateWebsiteData();
        
        // Show message
        showSuccess('Main page content reset to defaults!');
        
        console.log('🔄 Main page content reset');
    }
}

// Content Management Functions
function loadAllContent() {
    loadEpisodes();
    loadClans();
    loadLocations();
    // Don't load main page content here initially - it will load when tab is shown
    // Initialize drag and drop after content loads
    setTimeout(initializeDragAndDrop, 100);
    
    // Update website data on load
    setTimeout(updateWebsiteData, 500);
}

// Image handling functions
function convertImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

function handleCoverImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        convertImageToBase64(file, function(base64) {
            const preview = document.getElementById('episode-cover-preview');
            preview.innerHTML = `
                <div class="mt-2">
                    <img src="${base64}" class="uploaded-image" alt="Cover preview">
                    <p class="text-sm text-gray-600 mt-1">Cover image ready!</p>
                </div>
            `;
            // Store the base64 for use in form submission
            preview.dataset.coverImage = base64;
        });
    }
}

// Drag and drop functionality for cover images
function initializeDragAndDrop() {
    const uploadZone = document.querySelector('.image-upload-zone');
    if (!uploadZone) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight(e) {
        uploadZone.classList.add('dragover');
    }
    
    function unhighlight(e) {
        uploadZone.classList.remove('dragover');
    }
    
    uploadZone.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            const file = files[0];
            if (file.type.startsWith('image/')) {
                convertImageToBase64(file, function(base64) {
                    const preview = document.getElementById('episode-cover-preview');
                    preview.innerHTML = `
                        <div class="mt-2">
                            <img src="${base64}" class="uploaded-image" alt="Cover preview">
                            <p class="text-sm text-gray-600 mt-1">Cover image ready!</p>
                        </div>
                    `;
                    preview.dataset.coverImage = base64;
                });
            }
        }
    }
}