// The Hidden World of London - Admin Panel JavaScript

// Global state
let currentUser = null;
let currentPage = null;
let currentClan = null;
let currentLocation = null;
let allPages = [];
let allClans = [];
let allLocations = [];
let currentFilter = 'all';
let map = null;
let miniMap = null;
let mapMarkers = [];

// Initialize admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('hiddenworld_admin');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
        loadDashboardData();
    }

    // Setup login form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Setup page form
    const pageForm = document.getElementById('page-form');
    if (pageForm) {
        pageForm.addEventListener('submit', handlePageSave);
    }

    // Setup title slug generation
    const titleInput = document.getElementById('page-title');
    const slugInput = document.getElementById('page-slug');
    if (titleInput && slugInput) {
        titleInput.addEventListener('input', () => {
            if (!slugInput.value || slugInput.value === generateSlug(titleInput.getAttribute('data-old-value') || '')) {
                slugInput.value = generateSlug(titleInput.value);
            }
            titleInput.setAttribute('data-old-value', titleInput.value);
        });
    }

    // Initialize WYSIWYG editor
    initializeWYSIWYG();
});

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        // In a real application, this would make an API call
        // For now, we'll simulate authentication
        const response = await fetch('tables/admin_users?limit=100');
        const data = await response.json();
        
        const user = data.data.find(u => 
            u.username === username && u.password_hash === password && u.status === 'active'
        );

        if (user) {
            // Update last login
            await fetch(`tables/admin_users/${user.id}`, {
                method: 'PATCH',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({last_login: Date.now()})
            });

            currentUser = user;
            localStorage.setItem('hiddenworld_admin', JSON.stringify(user));
            showDashboard();
            loadDashboardData();
            showMessage('Welcome back!', 'success');
        } else {
            showMessage('Invalid username or password', 'error');
        }
    } catch (error) {
        console.error('Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('hiddenworld_admin');
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    
    // Reset form
    document.getElementById('login-form').reset();
    showMessage('Logged out successfully', 'success');
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    document.getElementById('admin-username').textContent = currentUser.username;
}

// Dashboard functions
async function loadDashboardData() {
    try {
        // Load all data for dashboard stats
        const [pagesResponse, clansResponse, locationsResponse] = await Promise.all([
            fetch('tables/pages?limit=1000'),
            fetch('tables/clans?limit=100'),
            fetch('tables/locations?limit=100')
        ]);

        const pagesData = await pagesResponse.json();
        const clansData = await clansResponse.json();
        const locationsData = await locationsResponse.json();

        allPages = pagesData.data;
        allClans = clansData.data;
        allLocations = locationsData.data;

        // Update dashboard statistics
        updateDashboardStats();

        // Load pages list if on pages section
        if (!document.getElementById('pages-section').classList.contains('hidden')) {
            renderPagesList();
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showMessage('Error loading dashboard data', 'error');
    }
}

function updateDashboardStats() {
    const episodes = allPages.filter(p => p.page_type === 'episode').length;
    const clans = allClans.filter(c => c.status === 'active').length;
    const locations = allLocations.filter(l => l.status === 'active').length;
    const drafts = allPages.filter(p => p.status === 'draft').length;

    document.getElementById('total-episodes').textContent = episodes;
    document.getElementById('total-clans').textContent = clans;
    document.getElementById('total-locations').textContent = locations;
    document.getElementById('draft-pages').textContent = drafts;
}

// Navigation functions
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.add('hidden');
    });

    // Remove active state from all nav buttons
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
        btn.classList.remove('bg-london-gold/20', 'text-london-gold');
    });

    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }

    // Set active nav button
    event.target.classList.add('bg-london-gold/20', 'text-london-gold');

    // Load section-specific data
    switch (sectionName) {
        case 'pages':
            renderPagesList();
            break;
        case 'clans':
            renderClansList();
            break;
        case 'locations':
            renderLocationsList();
            initializeMap();
            break;
        case 'dashboard':
            loadDashboardData();
            break;
    }
}

// Page management functions
function createNewPage(type = 'general') {
    currentPage = null;
    document.getElementById('editor-title').textContent = 'New ' + (type === 'episode' ? 'Episode' : 'Page');
    document.getElementById('page-form').reset();
    document.getElementById('page-type').value = type;
    document.getElementById('page-logo').value = '';
    document.getElementById('editor-content').innerHTML = '<p>Start writing your content here...</p>';
    document.getElementById('page-editor-modal').classList.remove('hidden');
}

function editPage(pageId) {
    const page = allPages.find(p => p.id === pageId);
    if (!page) return;

    currentPage = page;
    document.getElementById('editor-title').textContent = `Edit: ${page.title}`;
    
    // Populate form
    document.getElementById('page-title').value = page.title;
    document.getElementById('page-slug').value = page.slug || '';
    document.getElementById('page-type').value = page.page_type;
    document.getElementById('page-status').value = page.status;
    document.getElementById('page-image').value = page.image_url || '';
    document.getElementById('page-logo').value = page.logo_url || '';
    document.getElementById('page-meta').value = page.meta_description || '';
    document.getElementById('page-featured').checked = page.featured || false;
    
    // Populate content
    document.getElementById('editor-content').innerHTML = page.content || '<p>Start writing your content here...</p>';
    
    document.getElementById('page-editor-modal').classList.remove('hidden');
}

async function handlePageSave(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('page-title').value,
        slug: document.getElementById('page-slug').value || generateSlug(document.getElementById('page-title').value),
        page_type: document.getElementById('page-type').value,
        status: document.getElementById('page-status').value,
        image_url: document.getElementById('page-image').value,
        logo_url: document.getElementById('page-logo').value,
        meta_description: document.getElementById('page-meta').value,
        featured: document.getElementById('page-featured').checked,
        content: document.getElementById('editor-content').innerHTML,
        order_index: allPages.length
    };

    try {
        let response;
        if (currentPage) {
            // Update existing page
            response = await fetch(`tables/pages/${currentPage.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
        } else {
            // Create new page
            response = await fetch('tables/pages', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            const savedPage = await response.json();
            showMessage(currentPage ? 'Page updated successfully!' : 'Page created successfully!', 'success');
            closeEditor();
            await loadDashboardData(); // Refresh data
            renderPagesList(); // Refresh list
        } else {
            throw new Error('Failed to save page');
        }
    } catch (error) {
        console.error('Error saving page:', error);
        showMessage('Error saving page. Please try again.', 'error');
    }
}

async function deletePage(pageId) {
    if (!confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`tables/pages/${pageId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Page deleted successfully!', 'success');
            await loadDashboardData();
            renderPagesList();
        } else {
            throw new Error('Failed to delete page');
        }
    } catch (error) {
        console.error('Error deleting page:', error);
        showMessage('Error deleting page. Please try again.', 'error');
    }
}

function closeEditor() {
    document.getElementById('page-editor-modal').classList.add('hidden');
    currentPage = null;
}

// Page filtering and rendering
function filterPages(filter) {
    currentFilter = filter;
    
    // Update filter button states
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-london-gold', 'text-slate-900');
        btn.classList.add('bg-slate-700', 'text-white');
    });
    event.target.classList.add('bg-london-gold', 'text-slate-900');
    event.target.classList.remove('bg-slate-700', 'text-white');
    
    renderPagesList();
}

function renderPagesList() {
    const pagesList = document.getElementById('pages-list');
    if (!pagesList) return;

    let filteredPages = [...allPages];

    // Apply filter
    switch (currentFilter) {
        case 'episode':
            filteredPages = filteredPages.filter(p => p.page_type === 'episode');
            break;
        case 'published':
            filteredPages = filteredPages.filter(p => p.status === 'published');
            break;
        case 'draft':
            filteredPages = filteredPages.filter(p => p.status === 'draft');
            break;
    }

    // Sort by creation date (newest first)
    filteredPages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    if (filteredPages.length === 0) {
        pagesList.innerHTML = `
            <div class="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <i class="fas fa-file-alt text-4xl text-slate-600 mb-4"></i>
                <p class="text-slate-400 text-lg mb-4">No pages found</p>
                <button onclick="createNewPage('episode')" 
                        class="bg-london-gold hover:bg-yellow-500 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all">
                    <i class="fas fa-plus mr-2"></i>Create Your First Page
                </button>
            </div>
        `;
        return;
    }

    pagesList.innerHTML = filteredPages.map(page => `
        <div class="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-london-gold/30 transition-colors">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold text-white">${page.title}</h3>
                        <span class="px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(page.status)}">
                            ${page.status}
                        </span>
                        <span class="px-2 py-1 text-xs rounded-full bg-slate-700 text-slate-300">
                            ${page.page_type}
                        </span>
                        ${page.featured ? '<i class="fas fa-star text-london-gold" title="Featured"></i>' : ''}
                    </div>
                    <p class="text-slate-400 text-sm mb-2">
                        ${page.meta_description || 'No description'}
                    </p>
                    <div class="flex items-center gap-4 text-xs text-slate-500">
                        <span><i class="fas fa-calendar mr-1"></i>${formatDate(page.created_at)}</span>
                        <span><i class="fas fa-edit mr-1"></i>${formatDate(page.updated_at)}</span>
                        ${page.slug ? `<span><i class="fas fa-link mr-1"></i>${page.slug}</span>` : ''}
                    </div>
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <button onclick="editPage('${page.id}')" 
                            class="text-london-gold hover:text-yellow-300 p-2" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="duplicatePage('${page.id}')" 
                            class="text-slate-400 hover:text-white p-2" title="Duplicate">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button onclick="deletePage('${page.id}')" 
                            class="text-red-400 hover:text-red-300 p-2" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            ${page.image_url ? `
                <div class="mb-4">
                    <img src="${page.image_url}" alt="${page.title}" 
                         class="w-full h-32 object-cover rounded-lg">
                </div>
            ` : ''}
            <div class="text-sm text-slate-300 line-clamp-3">
                ${stripHtml(page.content || 'No content')}
            </div>
        </div>
    `).join('');
}

async function duplicatePage(pageId) {
    const page = allPages.find(p => p.id === pageId);
    if (!page) return;

    const duplicatedPage = {
        title: page.title + ' (Copy)',
        slug: (page.slug || generateSlug(page.title)) + '-copy',
        page_type: page.page_type,
        status: 'draft',
        image_url: page.image_url,
        meta_description: page.meta_description,
        featured: false,
        content: page.content,
        order_index: allPages.length
    };

    try {
        const response = await fetch('tables/pages', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(duplicatedPage)
        });

        if (response.ok) {
            showMessage('Page duplicated successfully!', 'success');
            await loadDashboardData();
            renderPagesList();
        } else {
            throw new Error('Failed to duplicate page');
        }
    } catch (error) {
        console.error('Error duplicating page:', error);
        showMessage('Error duplicating page. Please try again.', 'error');
    }
}

// WYSIWYG Editor
function initializeWYSIWYG() {
    const toolbar = document.querySelector('.editor-toolbar');
    const content = document.getElementById('editor-content');
    
    if (!toolbar || !content) return;

    // Create toolbar buttons
    const buttons = [
        { cmd: 'bold', icon: 'fas fa-bold', title: 'Bold' },
        { cmd: 'italic', icon: 'fas fa-italic', title: 'Italic' },
        { cmd: 'underline', icon: 'fas fa-underline', title: 'Underline' },
        { cmd: 'separator' },
        { cmd: 'formatBlock', param: 'h1', icon: 'fas fa-heading', title: 'Heading 1', text: 'H1' },
        { cmd: 'formatBlock', param: 'h2', icon: 'fas fa-heading', title: 'Heading 2', text: 'H2' },
        { cmd: 'formatBlock', param: 'h3', icon: 'fas fa-heading', title: 'Heading 3', text: 'H3' },
        { cmd: 'formatBlock', param: 'p', icon: 'fas fa-paragraph', title: 'Paragraph' },
        { cmd: 'separator' },
        { cmd: 'insertUnorderedList', icon: 'fas fa-list-ul', title: 'Bullet List' },
        { cmd: 'insertOrderedList', icon: 'fas fa-list-ol', title: 'Numbered List' },
        { cmd: 'separator' },
        { cmd: 'justifyLeft', icon: 'fas fa-align-left', title: 'Align Left' },
        { cmd: 'justifyCenter', icon: 'fas fa-align-center', title: 'Align Center' },
        { cmd: 'justifyRight', icon: 'fas fa-align-right', title: 'Align Right' },
        { cmd: 'separator' },
        { cmd: 'createLink', icon: 'fas fa-link', title: 'Insert Link' },
        { cmd: 'insertImage', icon: 'fas fa-image', title: 'Insert Image' },
        { cmd: 'separator' },
        { cmd: 'removeFormat', icon: 'fas fa-remove-format', title: 'Clear Formatting' }
    ];

    toolbar.innerHTML = buttons.map(btn => {
        if (btn.cmd === 'separator') {
            return '<div class="w-px h-6 bg-slate-600 mx-1"></div>';
        }
        
        return `
            <button type="button" class="editor-btn" 
                    onclick="formatText('${btn.cmd}', ${btn.param ? `'${btn.param}'` : 'null'})"
                    title="${btn.title}">
                ${btn.text || `<i class="${btn.icon}"></i>`}
            </button>
        `;
    }).join('');

    // Update toolbar state based on selection
    content.addEventListener('mouseup', updateToolbar);
    content.addEventListener('keyup', updateToolbar);
}

function formatText(command, value = null) {
    const content = document.getElementById('editor-content');
    content.focus();
    
    if (command === 'createLink') {
        const url = prompt('Enter URL:', 'https://');
        if (url) {
            document.execCommand(command, false, url);
        }
    } else if (command === 'insertImageUrl') {
        const url = prompt('Enter image URL:', 'https://');
        if (url) {
            const imgHtml = `<img src="${url}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px;" alt="Inserted image">`;
            document.execCommand('insertHTML', false, imgHtml);
        }
    } else if (command === 'insertImageUpload') {
        // Create a hidden file input for inline image upload
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.onchange = function(e) {
            const file = e.target.files[0];
            if (file) {
                // Check file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showMessage('Image file is too large. Please choose a file smaller than 5MB.', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const base64String = e.target.result;
                    const imgHtml = `<img src="${base64String}" style="max-width: 100%; height: auto; margin: 10px 0; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2);" alt="Uploaded image">`;
                    
                    // Focus back on editor and insert image
                    content.focus();
                    document.execCommand('insertHTML', false, imgHtml);
                    showMessage('Image inserted successfully!', 'success');
                };
                reader.readAsDataURL(file);
            }
        };
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    } else {
        document.execCommand(command, false, value);
    }
    
    updateToolbar();
}

function updateToolbar() {
    const buttons = document.querySelectorAll('.editor-btn');
    buttons.forEach(btn => {
        const command = btn.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (['bold', 'italic', 'underline', 'insertUnorderedList', 'insertOrderedList'].includes(command)) {
            if (document.queryCommandState(command)) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        }
    });
}

// Utility functions
function generateSlug(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .trim('-'); // Remove leading/trailing hyphens
}

function getStatusBadgeClass(status) {
    switch (status) {
        case 'published':
            return 'bg-green-600 text-white';
        case 'draft':
            return 'bg-yellow-600 text-white';
        case 'archived':
            return 'bg-gray-600 text-white';
        default:
            return 'bg-slate-600 text-white';
    }
}

function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
}

function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showMessage(text, type = 'info') {
    const message = document.createElement('div');
    message.className = `message message-${type} fixed top-4 right-4 z-50 max-w-sm`;
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

// CLAN MANAGEMENT FUNCTIONS
function renderClansList() {
    const clansList = document.getElementById('clans-list');
    if (!clansList) return;

    if (allClans.length === 0) {
        clansList.innerHTML = `
            <div class="col-span-full text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <i class="fas fa-gem text-4xl text-slate-600 mb-4"></i>
                <p class="text-slate-400 text-lg mb-4">No clans found</p>
                <button onclick="createNewClan()" 
                        class="bg-london-gold hover:bg-yellow-500 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all">
                    <i class="fas fa-plus mr-2"></i>Create Your First Clan
                </button>
            </div>
        `;
        return;
    }

    clansList.innerHTML = allClans.map(clan => `
        <div class="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-london-gold/30 transition-colors">
            <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                    ${clan.emblem_url ? `
                        <img src="${clan.emblem_url}" alt="${clan.name} emblem" class="w-12 h-12 rounded-full">
                    ` : `
                        <div class="w-12 h-12 rounded-full flex items-center justify-center" 
                             style="background: linear-gradient(135deg, ${clan.color_primary || '#666'}, ${clan.color_secondary || '#999'})">
                            <i class="fas fa-gem text-white"></i>
                        </div>
                    `}
                    <div>
                        <h3 class="text-lg font-semibold text-white">${clan.name}</h3>
                        <span class="px-2 py-1 text-xs rounded-full ${clan.status === 'active' ? 'bg-green-600' : 'bg-gray-600'} text-white">
                            ${clan.status}
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="editClan('${clan.id}')" 
                            class="text-london-gold hover:text-yellow-300 p-2" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteClan('${clan.id}')" 
                            class="text-red-400 hover:text-red-300 p-2" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="space-y-3 text-sm">
                <div>
                    <h4 class="font-semibold text-slate-300 mb-1">Colors:</h4>
                    <div class="flex gap-2">
                        <div class="w-6 h-6 rounded border-2 border-slate-600" 
                             style="background: ${clan.color_primary || '#666'}" title="Primary"></div>
                        <div class="w-6 h-6 rounded border-2 border-slate-600" 
                             style="background: ${clan.color_secondary || '#999'}" title="Secondary"></div>
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-slate-300 mb-1">Stone Origin:</h4>
                    <div class="text-slate-400 line-clamp-2">
                        ${stripHtml(clan.stone_description || 'No description')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function createNewClan() {
    currentClan = null;
    document.getElementById('clan-editor-title').textContent = 'New Clan';
    document.getElementById('clan-form').reset();
    
    // Set default values
    document.getElementById('clan-color-primary').value = '#d4af37';
    document.getElementById('clan-color-primary-hex').value = '#d4af37';
    document.getElementById('clan-color-secondary').value = '#1e3a5f';
    document.getElementById('clan-color-secondary-hex').value = '#1e3a5f';
    
    // Clear logo field
    document.getElementById('clan-logo').value = '';
    
    // Clear content areas
    document.getElementById('clan-stone-description').innerHTML = '<p>Enter the mystical origin story of this clan\'s stone...</p>';
    document.getElementById('clan-offering').innerHTML = '<p>Describe the powers and gifts this clan stone provides...</p>';
    document.getElementById('clan-resonance-note').innerHTML = '<p>How does one awaken or connect with this stone?</p>';
    
    document.getElementById('clan-editor-modal').classList.remove('hidden');
}

function editClan(clanId) {
    const clan = allClans.find(c => c.id === clanId);
    if (!clan) return;

    currentClan = clan;
    document.getElementById('clan-editor-title').textContent = `Edit: ${clan.name}`;
    
    // Populate form
    document.getElementById('clan-name').value = clan.name;
    document.getElementById('clan-color-primary').value = clan.color_primary || '#d4af37';
    document.getElementById('clan-color-primary-hex').value = clan.color_primary || '#d4af37';
    document.getElementById('clan-color-secondary').value = clan.color_secondary || '#1e3a5f';
    document.getElementById('clan-color-secondary-hex').value = clan.color_secondary || '#1e3a5f';
    document.getElementById('clan-emblem').value = clan.emblem_url || '';
    document.getElementById('clan-logo').value = clan.logo_url || '';
    document.getElementById('clan-status').value = clan.status || 'active';
    
    // Populate content areas
    document.getElementById('clan-stone-description').innerHTML = clan.stone_description || '<p>Enter the mystical origin story of this clan\'s stone...</p>';
    document.getElementById('clan-offering').innerHTML = clan.offering || '<p>Describe the powers and gifts this clan stone provides...</p>';
    document.getElementById('clan-resonance-note').innerHTML = clan.resonance_note || '<p>How does one awaken or connect with this stone?</p>';
    
    document.getElementById('clan-editor-modal').classList.remove('hidden');
}

async function saveClan(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('clan-name').value,
        color_primary: document.getElementById('clan-color-primary').value,
        color_secondary: document.getElementById('clan-color-secondary').value,
        emblem_url: document.getElementById('clan-emblem').value,
        logo_url: document.getElementById('clan-logo').value,
        status: document.getElementById('clan-status').value,
        stone_description: document.getElementById('clan-stone-description').innerHTML,
        offering: document.getElementById('clan-offering').innerHTML,
        resonance_note: document.getElementById('clan-resonance-note').innerHTML
    };

    try {
        let response;
        if (currentClan) {
            response = await fetch(`tables/clans/${currentClan.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch('tables/clans', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            showMessage(currentClan ? 'Clan updated successfully!' : 'Clan created successfully!', 'success');
            closeClanEditor();
            await loadDashboardData();
            renderClansList();
        } else {
            throw new Error('Failed to save clan');
        }
    } catch (error) {
        console.error('Error saving clan:', error);
        showMessage('Error saving clan. Please try again.', 'error');
    }
}

async function deleteClan(clanId) {
    if (!confirm('Are you sure you want to delete this clan? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`tables/clans/${clanId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Clan deleted successfully!', 'success');
            await loadDashboardData();
            renderClansList();
        } else {
            throw new Error('Failed to delete clan');
        }
    } catch (error) {
        console.error('Error deleting clan:', error);
        showMessage('Error deleting clan. Please try again.', 'error');
    }
}

function closeClanEditor() {
    document.getElementById('clan-editor-modal').classList.add('hidden');
    currentClan = null;
}

// LOCATION MANAGEMENT FUNCTIONS
function renderLocationsList() {
    const locationsList = document.getElementById('locations-list');
    if (!locationsList) return;

    if (allLocations.length === 0) {
        locationsList.innerHTML = `
            <div class="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
                <i class="fas fa-map-marker-alt text-4xl text-slate-600 mb-4"></i>
                <p class="text-slate-400 text-lg mb-4">No locations found</p>
                <button onclick="createNewLocation()" 
                        class="bg-london-gold hover:bg-yellow-500 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all">
                    <i class="fas fa-plus mr-2"></i>Add Your First Location
                </button>
            </div>
        `;
        return;
    }

    locationsList.innerHTML = allLocations.map(location => `
        <div class="bg-slate-800 rounded-lg p-6 border border-slate-700 hover:border-london-gold/30 transition-colors">
            <div class="flex justify-between items-start mb-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-lg font-semibold text-white">
                            <i class="fas fa-map-marker-alt text-london-gold mr-2"></i>${location.name}
                        </h3>
                        <span class="px-2 py-1 text-xs rounded-full ${location.status === 'active' ? 'bg-green-600' : 'bg-gray-600'} text-white">
                            ${location.status}
                        </span>
                    </div>
                    ${location.latitude && location.longitude ? `
                        <p class="text-slate-400 text-sm mb-2">
                            <i class="fas fa-globe mr-1"></i>
                            ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}
                        </p>
                    ` : ''}
                </div>
                <div class="flex items-center gap-2 ml-4">
                    <button onclick="editLocation('${location.id}')" 
                            class="text-london-gold hover:text-yellow-300 p-2" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    ${location.latitude && location.longitude ? `
                        <button onclick="showLocationOnMap(${location.latitude}, ${location.longitude})" 
                                class="text-sea-light hover:text-white p-2" title="Show on Map">
                            <i class="fas fa-map"></i>
                        </button>
                    ` : ''}
                    <button onclick="deleteLocation('${location.id}')" 
                            class="text-red-400 hover:text-red-300 p-2" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            ${location.image_url ? `
                <div class="mb-4">
                    <img src="${location.image_url}" alt="${location.name}" 
                         class="w-full h-32 object-cover rounded-lg">
                </div>
            ` : ''}
            
            <div class="space-y-3 text-sm">
                <div>
                    <h4 class="font-semibold text-sea-light mb-1">Magical Description:</h4>
                    <div class="text-slate-300 line-clamp-2">
                        ${stripHtml(location.magical_description || 'No description')}
                    </div>
                </div>
                
                <div>
                    <h4 class="font-semibold text-sea-light mb-1">What to Look For:</h4>
                    <div class="text-slate-300 line-clamp-2">
                        ${stripHtml(location.what_to_look_for || 'No clues provided')}
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function createNewLocation() {
    currentLocation = null;
    document.getElementById('location-editor-title').textContent = 'New Location';
    document.getElementById('location-form').reset();
    
    // Clear content areas
    document.getElementById('location-magical-description').innerHTML = '<p>What magical energy exists at this location?</p>';
    document.getElementById('location-what-to-look-for').innerHTML = '<p>What should visitors look for in the real world?</p>';
    
    document.getElementById('location-editor-modal').classList.remove('hidden');
    
    // Initialize mini map
    setTimeout(() => {
        if (!miniMap && window.L) {
            miniMap = L.map('location-mini-map').setView([51.5074, -0.1278], 12);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(miniMap);
            
            miniMap.on('click', function(e) {
                const lat = e.latlng.lat.toFixed(6);
                const lng = e.latlng.lng.toFixed(6);
                
                document.getElementById('location-latitude').value = lat;
                document.getElementById('location-longitude').value = lng;
                
                // Add marker
                if (miniMap.marker) {
                    miniMap.removeLayer(miniMap.marker);
                }
                
                const locationIcon = L.divIcon({
                    html: '<div style="width: 20px; height: 20px; background: #d4af37; border-radius: 50%; border: 2px solid white;"></div>',
                    className: 'location-marker',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                
                miniMap.marker = L.marker([lat, lng], { icon: locationIcon }).addTo(miniMap);
            });
        }
    }, 100);
}

function editLocation(locationId) {
    const location = allLocations.find(l => l.id === locationId);
    if (!location) return;

    currentLocation = location;
    document.getElementById('location-editor-title').textContent = `Edit: ${location.name}`;
    
    // Populate form
    document.getElementById('location-name').value = location.name;
    document.getElementById('location-latitude').value = location.latitude || '';
    document.getElementById('location-longitude').value = location.longitude || '';
    document.getElementById('location-image').value = location.image_url || '';
    document.getElementById('location-status').value = location.status || 'active';
    
    // Populate content areas
    document.getElementById('location-magical-description').innerHTML = location.magical_description || '<p>What magical energy exists at this location?</p>';
    document.getElementById('location-what-to-look-for').innerHTML = location.what_to_look_for || '<p>What should visitors look for in the real world?</p>';
    
    document.getElementById('location-editor-modal').classList.remove('hidden');
    
    // Initialize mini map with location
    setTimeout(() => {
        if (location.latitude && location.longitude && window.L) {
            const center = [parseFloat(location.latitude), parseFloat(location.longitude)];
            miniMap = L.map('location-mini-map').setView(center, 15);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(miniMap);
            
            const locationIcon = L.divIcon({
                html: '<div style="width: 20px; height: 20px; background: #d4af37; border-radius: 50%; border: 2px solid white;"></div>',
                className: 'location-marker',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            miniMap.marker = L.marker(center, { icon: locationIcon }).addTo(miniMap);
            
            miniMap.on('click', function(e) {
                const lat = e.latlng.lat.toFixed(6);
                const lng = e.latlng.lng.toFixed(6);
                
                document.getElementById('location-latitude').value = lat;
                document.getElementById('location-longitude').value = lng;
                miniMap.marker.setLatLng([lat, lng]);
            });
        }
    }, 100);
}

async function saveLocation(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('location-name').value,
        latitude: parseFloat(document.getElementById('location-latitude').value) || null,
        longitude: parseFloat(document.getElementById('location-longitude').value) || null,
        image_url: document.getElementById('location-image').value,
        status: document.getElementById('location-status').value,
        magical_description: document.getElementById('location-magical-description').innerHTML,
        what_to_look_for: document.getElementById('location-what-to-look-for').innerHTML
    };

    try {
        let response;
        if (currentLocation) {
            response = await fetch(`tables/locations/${currentLocation.id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
        } else {
            response = await fetch('tables/locations', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            showMessage(currentLocation ? 'Location updated successfully!' : 'Location created successfully!', 'success');
            closeLocationEditor();
            await loadDashboardData();
            renderLocationsList();
            if (map) {
                updateMapMarkers();
            }
        } else {
            throw new Error('Failed to save location');
        }
    } catch (error) {
        console.error('Error saving location:', error);
        showMessage('Error saving location. Please try again.', 'error');
    }
}

async function deleteLocation(locationId) {
    if (!confirm('Are you sure you want to delete this location? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`tables/locations/${locationId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showMessage('Location deleted successfully!', 'success');
            await loadDashboardData();
            renderLocationsList();
            if (map) {
                updateMapMarkers();
            }
        } else {
            throw new Error('Failed to delete location');
        }
    } catch (error) {
        console.error('Error deleting location:', error);
        showMessage('Error deleting location. Please try again.', 'error');
    }
}

function closeLocationEditor() {
    document.getElementById('location-editor-modal').classList.add('hidden');
    currentLocation = null;
    miniMap = null;
}

// MAP FUNCTIONS
function initializeMap() {
    const mapElement = document.getElementById('locations-map');
    if (!mapElement || !window.L) return;
    
    if (!map) {
        map = L.map(mapElement).setView([51.5074, -0.1278], 12);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);
    }
    
    updateMapMarkers();
}

function updateMapMarkers() {
    if (!map) return;
    
    // Clear existing markers
    mapMarkers.forEach(marker => map.removeLayer(marker));
    mapMarkers = [];
    
    // Create custom admin marker icon
    const adminIcon = L.divIcon({
        html: `
            <div style="
                width: 30px; 
                height: 30px; 
                background: #d4af37;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #1e293b;
                font-size: 16px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                border: 2px solid white;
            ">✨</div>
        `,
        className: 'admin-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });
    
    // Add markers for each location
    allLocations.forEach(location => {
        if (location.latitude && location.longitude && location.status === 'active') {
            const marker = L.marker([parseFloat(location.latitude), parseFloat(location.longitude)], {
                icon: adminIcon,
                title: location.name
            }).addTo(map);
            
            const popupContent = `
                <div style="color: #1e293b; font-family: Arial, sans-serif; max-width: 250px;">
                    <h3 style="margin: 0 0 10px 0; color: #d4af37;">${location.name}</h3>
                    <p style="margin: 0; font-size: 14px;">${stripHtml(location.magical_description || 'A magical location in London')}</p>
                    <button onclick="editLocation('${location.id}')" 
                            style="margin-top: 10px; background: #d4af37; color: #1e293b; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                        Edit Location
                    </button>
                </div>
            `;
            
            marker.bindPopup(popupContent);
            mapMarkers.push(marker);
        }
    });
}

function showLocationOnMap(lat, lng) {
    if (map) {
        map.setCenter({ lat: lat, lng: lng });
        map.setZoom(16);
    }
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            
            document.getElementById('location-latitude').value = lat;
            document.getElementById('location-longitude').value = lng;
            
            if (miniMap) {
                miniMap.setView([lat, lng], 16);
                
                if (miniMap.marker) {
                    miniMap.marker.setLatLng([lat, lng]);
                } else {
                    const locationIcon = L.divIcon({
                        html: '<div style="width: 20px; height: 20px; background: #22c55e; border-radius: 50%; border: 2px solid white;"></div>',
                        className: 'current-location-marker',
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                    });
                    
                    miniMap.marker = L.marker([lat, lng], { icon: locationIcon }).addTo(miniMap);
                }
            }
            
            showMessage('Location found!', 'success');
        }, function() {
            showMessage('Unable to get your location', 'error');
        });
    } else {
        showMessage('Geolocation is not supported by this browser', 'error');
    }
}

function searchLocation() {
    const address = prompt('Enter an address or landmark in London:');
    if (!address) return;
    
    // Use Nominatim geocoding service (free alternative to Google Geocoding)
    const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', London, UK')}&limit=1`;
    
    fetch(geocodeUrl)
        .then(response => response.json())
        .then(results => {
            if (results && results.length > 0) {
                const result = results[0];
                const lat = parseFloat(result.lat).toFixed(6);
                const lng = parseFloat(result.lon).toFixed(6);
                
                document.getElementById('location-latitude').value = lat;
                document.getElementById('location-longitude').value = lng;
                
                if (miniMap) {
                    miniMap.setView([lat, lng], 16);
                    
                    if (miniMap.marker) {
                        miniMap.marker.setLatLng([lat, lng]);
                    } else {
                        const locationIcon = L.divIcon({
                            html: '<div style="width: 20px; height: 20px; background: #3b82f6; border-radius: 50%; border: 2px solid white;"></div>',
                            className: 'search-location-marker',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        });
                        
                        miniMap.marker = L.marker([lat, lng], { icon: locationIcon }).addTo(miniMap);
                    }
                }
                
                showMessage('Location found!', 'success');
            } else {
                showMessage('Location not found. Please try a different search term.', 'error');
            }
        })
        .catch(error => {
            console.error('Geocoding error:', error);
            showMessage('Error searching for location. Please try again.', 'error');
        });
}

// ENHANCED WYSIWYG FUNCTIONS
function formatClanText(fieldId, command, value = null) {
    const field = document.getElementById('clan-' + fieldId);
    field.focus();
    document.execCommand(command, false, value);
}

function formatLocationText(fieldId, command, value = null) {
    const field = document.getElementById('location-' + fieldId);
    field.focus();
    document.execCommand(command, false, value);
}

// Enhanced toolbar initialization
function initializeWYSIWYG() {
    const toolbar = document.querySelector('.editor-toolbar');
    const content = document.getElementById('editor-content');
    
    if (!toolbar || !content) return;

    // Enhanced toolbar with color and font controls
    const buttons = [
        { cmd: 'bold', icon: 'fas fa-bold', title: 'Bold' },
        { cmd: 'italic', icon: 'fas fa-italic', title: 'Italic' },
        { cmd: 'underline', icon: 'fas fa-underline', title: 'Underline' },
        { cmd: 'separator' },
        { cmd: 'fontName', param: 'Fredoka One', icon: 'fas fa-font', title: 'Playful Font', text: 'Fun' },
        { cmd: 'fontName', param: 'Bangers', icon: 'fas fa-font', title: 'Comic Font', text: 'Pop' },
        { cmd: 'fontName', param: 'Kalam', icon: 'fas fa-font', title: 'Handwritten', text: 'Hand' },
        { cmd: 'separator' },
        { cmd: 'foreColor', param: '#ff6b6b', icon: 'fas fa-paint-brush', title: 'Red Text', style: 'color: #ff6b6b' },
        { cmd: 'foreColor', param: '#4ecdc4', icon: 'fas fa-paint-brush', title: 'Teal Text', style: 'color: #4ecdc4' },
        { cmd: 'foreColor', param: '#45b7d1', icon: 'fas fa-paint-brush', title: 'Blue Text', style: 'color: #45b7d1' },
        { cmd: 'foreColor', param: '#96ceb4', icon: 'fas fa-paint-brush', title: 'Green Text', style: 'color: #96ceb4' },
        { cmd: 'foreColor', param: '#feca57', icon: 'fas fa-paint-brush', title: 'Yellow Text', style: 'color: #feca57' },
        { cmd: 'foreColor', param: '#ff9ff3', icon: 'fas fa-paint-brush', title: 'Pink Text', style: 'color: #ff9ff3' },
        { cmd: 'separator' },
        { cmd: 'formatBlock', param: 'h1', icon: 'fas fa-heading', title: 'Heading 1', text: 'H1' },
        { cmd: 'formatBlock', param: 'h2', icon: 'fas fa-heading', title: 'Heading 2', text: 'H2' },
        { cmd: 'formatBlock', param: 'h3', icon: 'fas fa-heading', title: 'Heading 3', text: 'H3' },
        { cmd: 'formatBlock', param: 'p', icon: 'fas fa-paragraph', title: 'Paragraph' },
        { cmd: 'separator' },
        { cmd: 'insertUnorderedList', icon: 'fas fa-list-ul', title: 'Bullet List' },
        { cmd: 'insertOrderedList', icon: 'fas fa-list-ol', title: 'Numbered List' },
        { cmd: 'separator' },
        { cmd: 'justifyLeft', icon: 'fas fa-align-left', title: 'Align Left' },
        { cmd: 'justifyCenter', icon: 'fas fa-align-center', title: 'Align Center' },
        { cmd: 'justifyRight', icon: 'fas fa-align-right', title: 'Align Right' },
        { cmd: 'separator' },
        { cmd: 'createLink', icon: 'fas fa-link', title: 'Insert Link' },
        { cmd: 'insertImageUpload', icon: 'fas fa-upload', title: 'Upload & Insert Image' },
        { cmd: 'insertImageUrl', icon: 'fas fa-image', title: 'Insert Image from URL' },
        { cmd: 'insertHTML', param: '✨', icon: 'fas fa-sparkles', title: 'Add Sparkles' },
        { cmd: 'insertHTML', param: '🔮', icon: 'fas fa-crystal-ball', title: 'Add Crystal Ball' },
        { cmd: 'insertHTML', param: '🏰', icon: 'fas fa-castle', title: 'Add Castle' },
        { cmd: 'separator' },
        { cmd: 'removeFormat', icon: 'fas fa-remove-format', title: 'Clear Formatting' }
    ];

    toolbar.innerHTML = buttons.map(btn => {
        if (btn.cmd === 'separator') {
            return '<div class="w-px h-6 bg-slate-600 mx-1"></div>';
        }
        
        return `
            <button type="button" class="editor-btn ${btn.style ? `style="${btn.style}"` : ''}" 
                    onclick="formatText('${btn.cmd}', ${btn.param ? `'${btn.param}'` : 'null'})"
                    title="${btn.title}">
                ${btn.text || `<i class="${btn.icon}"></i>`}
            </button>
        `;
    }).join('');

    // Update toolbar state based on selection
    content.addEventListener('mouseup', updateToolbar);
    content.addEventListener('keyup', updateToolbar);
}

// Setup form handlers
document.addEventListener('DOMContentLoaded', function() {
    // Existing initialization...
    
    // Clan form handler
    const clanForm = document.getElementById('clan-form');
    if (clanForm) {
        clanForm.addEventListener('submit', saveClan);
    }
    
    // Location form handler
    const locationForm = document.getElementById('location-form');
    if (locationForm) {
        locationForm.addEventListener('submit', saveLocation);
    }
    
    // Color picker sync for clans
    const primaryColor = document.getElementById('clan-color-primary');
    const primaryHex = document.getElementById('clan-color-primary-hex');
    if (primaryColor && primaryHex) {
        primaryColor.addEventListener('input', () => {
            primaryHex.value = primaryColor.value;
        });
        primaryHex.addEventListener('input', () => {
            primaryColor.value = primaryHex.value;
        });
    }
    
    const secondaryColor = document.getElementById('clan-color-secondary');
    const secondaryHex = document.getElementById('clan-color-secondary-hex');
    if (secondaryColor && secondaryHex) {
        secondaryColor.addEventListener('input', () => {
            secondaryHex.value = secondaryColor.value;
        });
        secondaryHex.addEventListener('input', () => {
            secondaryColor.value = secondaryHex.value;
        });
    }
});

// IMAGE UPLOAD FUNCTIONS
function handleImageUpload(targetInputId, fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showMessage('Image file is too large. Please choose a file smaller than 5MB.', 'error');
        fileInput.value = '';
        return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
        showMessage('Please select a valid image file.', 'error');
        fileInput.value = '';
        return;
    }
    
    // Create FileReader to convert to base64
    const reader = new FileReader();
    reader.onload = function(e) {
        const base64String = e.target.result;
        
        // Update the URL input with the base64 data
        document.getElementById(targetInputId).value = base64String;
        
        // Show preview
        showImagePreview(targetInputId, base64String);
        
        showMessage('Image uploaded successfully!', 'success');
    };
    
    reader.onerror = function() {
        showMessage('Error reading image file. Please try again.', 'error');
        fileInput.value = '';
    };
    
    reader.readAsDataURL(file);
}

function showImagePreview(targetInputId, imageSrc) {
    const previewContainer = document.getElementById(targetInputId + '-preview');
    const previewImg = document.getElementById(targetInputId + '-preview-img');
    
    if (previewContainer && previewImg) {
        previewImg.src = imageSrc;
        previewContainer.classList.remove('hidden');
    }
}

function clearImage(targetInputId) {
    // Clear the URL input
    document.getElementById(targetInputId).value = '';
    
    // Clear the file input
    const uploadInput = document.getElementById(targetInputId + '-upload');
    if (uploadInput) {
        uploadInput.value = '';
    }
    
    // Hide preview
    const previewContainer = document.getElementById(targetInputId + '-preview');
    if (previewContainer) {
        previewContainer.classList.add('hidden');
    }
    
    showMessage('Image removed successfully!', 'success');
}

// Update image preview when URL is manually entered
function setupImagePreviewListeners() {
    const imageInputs = ['page-image', 'page-logo', 'clan-emblem', 'clan-logo', 'location-image'];
    
    imageInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', function() {
                const url = this.value.trim();
                if (url && (url.startsWith('http') || url.startsWith('data:image'))) {
                    // Test if the URL is a valid image
                    const testImg = new Image();
                    testImg.onload = function() {
                        showImagePreview(inputId, url);
                    };
                    testImg.onerror = function() {
                        const previewContainer = document.getElementById(inputId + '-preview');
                        if (previewContainer) {
                            previewContainer.classList.add('hidden');
                        }
                    };
                    testImg.src = url;
                } else {
                    const previewContainer = document.getElementById(inputId + '-preview');
                    if (previewContainer) {
                        previewContainer.classList.add('hidden');
                    }
                }
            });
        }
    });
}

// Initialize image preview listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupImagePreviewListeners();
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl+S to save (in any editor)
    if (e.ctrlKey && e.key === 's') {
        if (!document.getElementById('page-editor-modal').classList.contains('hidden')) {
            e.preventDefault();
            document.getElementById('page-form').dispatchEvent(new Event('submit'));
        } else if (!document.getElementById('clan-editor-modal').classList.contains('hidden')) {
            e.preventDefault();
            document.getElementById('clan-form').dispatchEvent(new Event('submit'));
        } else if (!document.getElementById('location-editor-modal').classList.contains('hidden')) {
            e.preventDefault();
            document.getElementById('location-form').dispatchEvent(new Event('submit'));
        }
    }
    
    // Esc to close any modal
    if (e.key === 'Escape') {
        if (!document.getElementById('page-editor-modal').classList.contains('hidden')) {
            closeEditor();
        } else if (!document.getElementById('clan-editor-modal').classList.contains('hidden')) {
            closeClanEditor();
        } else if (!document.getElementById('location-editor-modal').classList.contains('hidden')) {
            closeLocationEditor();
        }
    }
});