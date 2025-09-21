// Simple Admin System for The Hidden World of London
// Works entirely with localStorage - no server required!

// Configuration
const ADMIN_PASSWORD = 'hiddenworld2024'; // Change this to your preferred password
const STORAGE_KEYS = {
    episodes: 'hiddenworld_episodes',
    clans: 'hiddenworld_clans',
    locations: 'hiddenworld_locations',
    adminAuth: 'hiddenworld_admin_auth'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    if (isLoggedIn()) {
        showDashboard();
        showTab('episodes');
        loadAllContent();
        initializeWYSIWYG();
    }
});

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
        
        const targetIds = ['episode-content', 'clan-origin', 'clan-powers', 'clan-connection', 'location-magic', 'location-lookfor'];
        
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
            textarea.style.display = 'none';
            
            const container = document.createElement('div');
            container.id = id + '-quill';
            container.style.minHeight = '250px';
            textarea.parentNode.appendChild(container);
            
            const quill = new Quill(`#${id}-quill`, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'font': [] }],
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
                            // Add resize functionality to newly inserted image
                            setTimeout(() => {
                                window.EditorManager.setupImageResize(quill);
                            }, 100);
                        };
                        reader.readAsDataURL(file);
                    }
                };
                input.click();
            });
            
            // Setup image resize for existing and new images
            this.setupImageResize(quill);
            
            this.editors[id] = quill;
            console.log(`✅ Created: ${id}`);
            
        } catch (error) {
            console.error(`❌ Failed: ${id}`, error);
        }
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
    },
    
    // Setup comprehensive image resize functionality
    setupImageResize: function(quill) {
        // Handle clicks on images
        quill.root.addEventListener('click', (e) => {
            if (e.target.tagName === 'IMG') {
                e.preventDefault();
                this.selectImage(e.target, quill);
            } else {
                // Click elsewhere, clear selection
                this.clearImageSelection();
            }
        });
        
        // Handle new images being added
        quill.on('text-change', () => {
            // Add resize capability to any new images
            setTimeout(() => {
                const images = quill.root.querySelectorAll('img:not(.resize-enabled)');
                images.forEach(img => {
                    img.classList.add('resize-enabled');
                    img.style.cursor = 'pointer';
                });
            }, 50);
        });
    },
    
    // Select and add resize handles to an image
    selectImage: function(img, quill) {
        // Clear any existing selections first
        this.clearImageSelection();
        
        // Add selected class
        img.classList.add('selected');
        
        // Create resize handles container
        const handles = document.createElement('div');
        handles.className = 'image-resize-container';
        handles.style.position = 'absolute';
        handles.style.zIndex = '1000';
        handles.style.pointerEvents = 'none';
        
        // Position handles around the image
        const rect = img.getBoundingClientRect();
        const editorRect = quill.root.getBoundingClientRect();
        const scrollTop = quill.root.scrollTop;
        const scrollLeft = quill.root.scrollLeft;
        
        handles.style.left = (rect.left - editorRect.left + scrollLeft) + 'px';
        handles.style.top = (rect.top - editorRect.top + scrollTop) + 'px';
        handles.style.width = rect.width + 'px';
        handles.style.height = rect.height + 'px';
        
        // Add corner handles
        const corners = ['nw', 'ne', 'sw', 'se'];
        corners.forEach(corner => {
            const handle = document.createElement('div');
            handle.className = `image-resize-handle ${corner}`;
            handle.style.pointerEvents = 'auto';
            handle.addEventListener('mousedown', (e) => this.startResize(e, img, corner, handles, quill));
            handles.appendChild(handle);
        });
        
        // Add size display
        const sizeDisplay = document.createElement('div');
        sizeDisplay.className = 'image-size-display';
        sizeDisplay.style.position = 'absolute';
        sizeDisplay.style.bottom = '-30px';
        sizeDisplay.style.left = '0';
        sizeDisplay.style.background = '#3b82f6';
        sizeDisplay.style.color = 'white';
        sizeDisplay.style.padding = '4px 8px';
        sizeDisplay.style.borderRadius = '4px';
        sizeDisplay.style.fontSize = '12px';
        sizeDisplay.style.fontFamily = 'monospace';
        sizeDisplay.style.pointerEvents = 'none';
        sizeDisplay.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}px`;
        handles.appendChild(sizeDisplay);
        
        quill.root.appendChild(handles);
        
        console.log('🖼️ Image selected with resize handles');
    },
    
    // Clear image selection and handles
    clearImageSelection: function() {
        document.querySelectorAll('img.selected').forEach(img => {
            img.classList.remove('selected');
        });
        document.querySelectorAll('.image-resize-container').forEach(container => {
            container.remove();
        });
    },
    
    // Start image resize
    startResize: function(e, img, corner, handles, quill) {
        e.preventDefault();
        e.stopPropagation();
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = img.offsetWidth;
        const startHeight = img.offsetHeight;
        const aspectRatio = startWidth / startHeight;
        
        console.log(`🔄 Starting resize from ${corner} corner`);
        
        const resize = (e) => {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            
            // Calculate new dimensions based on corner
            if (corner.includes('e')) {
                newWidth = startWidth + deltaX;
            }
            if (corner.includes('w')) {
                newWidth = startWidth - deltaX;
            }
            if (corner.includes('s')) {
                newHeight = startHeight + deltaY;
            }
            if (corner.includes('n')) {
                newHeight = startHeight - deltaY;
            }
            
            // Maintain aspect ratio by using the larger change
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                newHeight = newWidth / aspectRatio;
            } else {
                newWidth = newHeight * aspectRatio;
            }
            
            // Apply size constraints
            newWidth = Math.max(50, Math.min(800, newWidth));
            newHeight = Math.max(30, Math.min(600, newHeight));
            
            // Apply new size
            img.style.width = newWidth + 'px';
            img.style.height = newHeight + 'px';
            img.setAttribute('width', Math.round(newWidth));
            img.setAttribute('height', Math.round(newHeight));
            
            // Update size display
            const sizeDisplay = handles.querySelector('.image-size-display');
            if (sizeDisplay) {
                sizeDisplay.textContent = `${Math.round(newWidth)} × ${Math.round(newHeight)}px`;
            }
            
            // Update handles position
            const rect = img.getBoundingClientRect();
            const editorRect = quill.root.getBoundingClientRect();
            const scrollTop = quill.root.scrollTop;
            const scrollLeft = quill.root.scrollLeft;
            
            handles.style.left = (rect.left - editorRect.left + scrollLeft) + 'px';
            handles.style.top = (rect.top - editorRect.top + scrollTop) + 'px';
            handles.style.width = rect.width + 'px';
            handles.style.height = rect.height + 'px';
        };
        
        const stopResize = () => {
            document.removeEventListener('mousemove', resize);
            document.removeEventListener('mouseup', stopResize);
            console.log('✅ Image resize completed');
            
            // Show success message
            const messageDiv = document.createElement('div');
            messageDiv.className = 'fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
            messageDiv.textContent = '✅ Image resized successfully!';
            document.body.appendChild(messageDiv);
            setTimeout(() => messageDiv.remove(), 2000);
        };
        
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
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
    }, 100);
}

// Image handling functions
function convertImageToBase64(file, callback) {
    const reader = new FileReader();
    reader.onload = function(e) {
        callback(e.target.result);
    };
    reader.readAsDataURL(file);
}

// Enhanced image selection for Quill editors
function selectLocalImage(quill) {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.style.display = 'none';
    
    input.onchange = function() {
        const file = this.files[0];
        if (file) {
            // Show loading message
            const range = quill.getSelection(true);
            quill.insertText(range.index, 'Loading image...', 'user');
            
            convertImageToBase64(file, function(base64) {
                // Remove loading text
                quill.deleteText(range.index, 'Loading image...'.length);
                
                // Insert image
                quill.insertEmbed(range.index, 'image', base64, 'user');
                
                // Add some space after the image
                quill.insertText(range.index + 1, '\n', 'user');
                
                // Set cursor position after the image
                quill.setSelection(range.index + 2);
                
                showSuccess('Image inserted successfully!');
            });
        }
    };
    
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
}

// Simplified image resize functionality (integrated into EditorManager)
function addCustomImageResize(quill) {
    // Image resize functionality is now built into the EditorManager
    // This function remains for compatibility
}

// Select and add resize handles to an image
function selectImage(img, quill) {
    // Remove any existing selections
    clearImageSelection();
    
    // Add selected class
    img.classList.add('selected');
    
    // Create resize handles container
    const handles = document.createElement('div');
    handles.className = 'image-resize-container';
    handles.style.position = 'absolute';
    handles.style.zIndex = '1000';
    
    // Position handles around the image
    const rect = img.getBoundingClientRect();
    const editorRect = quill.root.getBoundingClientRect();
    
    handles.style.left = (rect.left - editorRect.left) + 'px';
    handles.style.top = (rect.top - editorRect.top) + 'px';
    handles.style.width = rect.width + 'px';
    handles.style.height = rect.height + 'px';
    
    // Add corner handles
    const corners = ['nw', 'ne', 'sw', 'se'];
    corners.forEach(corner => {
        const handle = document.createElement('div');
        handle.className = `image-resize-handle ${corner}`;
        handle.addEventListener('mousedown', (e) => startResize(e, img, corner, handles, quill));
        handles.appendChild(handle);
    });
    
    // Add size display
    const sizeDisplay = document.createElement('div');
    sizeDisplay.className = 'image-size-display';
    sizeDisplay.style.position = 'absolute';
    sizeDisplay.style.bottom = '-25px';
    sizeDisplay.style.left = '0';
    sizeDisplay.style.background = '#3b82f6';
    sizeDisplay.style.color = 'white';
    sizeDisplay.style.padding = '2px 6px';
    sizeDisplay.style.borderRadius = '4px';
    sizeDisplay.style.fontSize = '12px';
    sizeDisplay.textContent = `${Math.round(rect.width)} x ${Math.round(rect.height)}`;
    handles.appendChild(sizeDisplay);
    
    quill.root.appendChild(handles);
    
    // Click outside to deselect
    const deselect = (e) => {
        if (!img.contains(e.target) && !handles.contains(e.target)) {
            clearImageSelection();
            document.removeEventListener('click', deselect);
        }
    };
    setTimeout(() => document.addEventListener('click', deselect), 0);
}

// Clear image selection
function clearImageSelection() {
    document.querySelectorAll('img.selected').forEach(img => {
        img.classList.remove('selected');
    });
    document.querySelectorAll('.image-resize-container').forEach(container => {
        container.remove();
    });
}

// Start image resize
function startResize(e, img, corner, handles, quill) {
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;
    const aspectRatio = startWidth / startHeight;
    
    const resize = (e) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        
        let newWidth = startWidth;
        let newHeight = startHeight;
        
        if (corner.includes('e')) {
            newWidth = startWidth + deltaX;
        }
        if (corner.includes('w')) {
            newWidth = startWidth - deltaX;
        }
        if (corner.includes('s')) {
            newHeight = startHeight + deltaY;
        }
        if (corner.includes('n')) {
            newHeight = startHeight - deltaY;
        }
        
        // Maintain aspect ratio
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newHeight = newWidth / aspectRatio;
        } else {
            newWidth = newHeight * aspectRatio;
        }
        
        // Apply constraints
        newWidth = Math.max(50, Math.min(800, newWidth));
        newHeight = Math.max(30, Math.min(600, newHeight));
        
        img.style.width = newWidth + 'px';
        img.style.height = newHeight + 'px';
        
        // Update size display
        const sizeDisplay = handles.querySelector('.image-size-display');
        if (sizeDisplay) {
            sizeDisplay.textContent = `${Math.round(newWidth)} x ${Math.round(newHeight)}`;
        }
        
        // Update handles position
        const rect = img.getBoundingClientRect();
        const editorRect = quill.root.getBoundingClientRect();
        handles.style.left = (rect.left - editorRect.left) + 'px';
        handles.style.top = (rect.top - editorRect.top) + 'px';
        handles.style.width = rect.width + 'px';
        handles.style.height = rect.height + 'px';
    };
    
    const stopResize = () => {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
        showSuccess('Image resized successfully!');
    };
    
    document.addEventListener('mousemove', resize);
    document.addEventListener('mouseup', stopResize);
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

// Content Management Functions
function loadAllContent() {
    loadEpisodes();
    loadClans();
    loadLocations();
    // Initialize drag and drop after content loads
    setTimeout(initializeDragAndDrop, 100);
}

// Episode Management
function addEpisode(event) {
    event.preventDefault();
    
    // Get content from editor
    const richContent = window.EditorManager.getContent('episode-content') || document.getElementById('episode-content').value;
    
    // Get cover image if uploaded
    const coverPreview = document.getElementById('episode-cover-preview');
    const coverImage = coverPreview ? coverPreview.dataset.coverImage : null;
    
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
    
    // Get existing episodes
    const episodes = getStoredData('episodes');
    episodes.unshift(episode); // Add to beginning
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.episodes, JSON.stringify(episodes));
    
    // Update main.js data
    updateMainJsData();
    
    // Clear form and reload
    document.getElementById('episode-form').reset();
    window.EditorManager.clear('episode-content');
    // Clear cover image preview
    if (coverPreview) {
        coverPreview.innerHTML = '';
        delete coverPreview.dataset.coverImage;
    }
    
    loadEpisodes();
    showSuccess('Episode added successfully with rich formatting!');
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
                <button onclick="deleteEpisode('${episode.id}')" class="btn-danger text-sm">
                    <i class="fas fa-trash"></i>
                </button>
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
            updateMainJsData();
            
            // Reload to update episode numbers
            loadEpisodes();
            showSuccess('Episodes reordered successfully! The website will show the new order.');
        }
    });
}

function deleteEpisode(episodeId) {
    if (confirm('Are you sure you want to delete this episode?')) {
        const episodes = getStoredData('episodes');
        const filtered = episodes.filter(ep => ep.id !== episodeId);
        localStorage.setItem(STORAGE_KEYS.episodes, JSON.stringify(filtered));
        updateMainJsData();
        loadEpisodes();
        showSuccess('Episode deleted successfully!');
    }
}

// Clan Management
function addClan(event) {
    event.preventDefault();
    
    // Get content from editors
    
    const clan = {
        id: 'clan' + Date.now(),
        name: document.getElementById('clan-name').value,
        stone_description: window.EditorManager.getContent('clan-origin') || document.getElementById('clan-origin').value,
        offering: window.EditorManager.getContent('clan-powers') || document.getElementById('clan-powers').value,
        resonance_note: window.EditorManager.getContent('clan-connection') || document.getElementById('clan-connection').value,
        color_primary: document.getElementById('clan-color1').value,
        color_secondary: document.getElementById('clan-color2').value,
        emblem_url: null,
        status: 'active'
    };
    
    const clans = getStoredData('clans');
    clans.push(clan);
    
    localStorage.setItem(STORAGE_KEYS.clans, JSON.stringify(clans));
    updateMainJsData();
    
    // Clear form including editors
    document.getElementById('clan-form').reset();
    window.EditorManager.clear('clan-origin');
    window.EditorManager.clear('clan-powers');
    window.EditorManager.clear('clan-connection');
    
    loadClans();
    showSuccess('Clan stone added successfully with rich formatting!');
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
                <button onclick="deleteClan('${clan.id}')" class="btn-danger text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="flex items-center mb-2">
                <div class="w-4 h-4 rounded-full mr-2" style="background: linear-gradient(45deg, ${clan.color_primary}, ${clan.color_secondary})"></div>
                <p class="text-gray-600 text-sm">${stripHtmlForDisplay(clan.offering, 100)}</p>
            </div>
        </div>
    `).join('');
}

function deleteClan(clanId) {
    if (confirm('Are you sure you want to delete this clan stone?')) {
        const clans = getStoredData('clans');
        const filtered = clans.filter(clan => clan.id !== clanId);
        localStorage.setItem(STORAGE_KEYS.clans, JSON.stringify(filtered));
        updateMainJsData();
        loadClans();
        showSuccess('Clan stone deleted successfully!');
    }
}

// Location Management
function addLocation(event) {
    event.preventDefault();
    
    // Get content from editors
    
    const location = {
        id: 'loc' + Date.now(),
        name: document.getElementById('location-name').value,
        latitude: parseFloat(document.getElementById('location-lat').value),
        longitude: parseFloat(document.getElementById('location-lng').value),
        magical_description: window.EditorManager.getContent('location-magic') || document.getElementById('location-magic').value,
        what_to_look_for: window.EditorManager.getContent('location-lookfor') || document.getElementById('location-lookfor').value,
        image_url: null,
        status: 'active'
    };
    
    const locations = getStoredData('locations');
    locations.push(location);
    
    localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(locations));
    updateMainJsData();
    
    // Clear form including editors
    document.getElementById('location-form').reset();
    window.EditorManager.clear('location-magic');
    window.EditorManager.clear('location-lookfor');
    
    loadLocations();
    showSuccess('Location added successfully with rich formatting!');
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
                <button onclick="deleteLocation('${location.id}')" class="btn-danger text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p class="text-gray-600 text-sm mb-1">${stripHtmlForDisplay(location.magical_description, 100)}</p>
            <p class="text-xs text-gray-400">📍 ${location.latitude}, ${location.longitude}</p>
        </div>
    `).join('');
}

function deleteLocation(locationId) {
    if (confirm('Are you sure you want to delete this location?')) {
        const locations = getStoredData('locations');
        const filtered = locations.filter(loc => loc.id !== locationId);
        localStorage.setItem(STORAGE_KEYS.locations, JSON.stringify(filtered));
        updateMainJsData();
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

function updateMainJsData() {
    // This creates a notification for the user to update the main site
    // In a real implementation, this would automatically update the main.js file
    console.log('Content updated in localStorage. Main site will refresh automatically.');
    
    // Update the main site's data by dispatching a custom event
    if (window.opener || window.parent !== window) {
        // If opened in popup or iframe, notify parent
        try {
            if (window.opener) {
                window.opener.postMessage('contentUpdated', '*');
            }
        } catch (e) {
            // Ignore cross-origin errors
        }
    }
}

function showSuccess(message) {
    document.getElementById('success-text').textContent = message;
    document.getElementById('success-message').classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
        document.getElementById('success-message').classList.add('hidden');
    }, 3000);
}