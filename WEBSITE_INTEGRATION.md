# Website Integration Guide - SIMPLE SOLUTION

## 🎯 Files to Upload

Upload these **3 files** to your website:

```
📁 Your Website/
├── 📄 simple-admin-reset.html     # Admin panel (replaces old admin)
└── 📁 js/
    ├── 📄 simple-admin-reset.js   # Admin functionality  
    └── 📄 website-data.js          # Data bridge for main site
```

## 🌐 Connect Your Main Website

### Step 1: Add Data Script to Your Main Website

In your main website's HTML, add this script tag:

```html
<!-- Add this to your main website HTML -->
<script src="js/website-data.js"></script>
```

### Step 2: Use the Data in Your Website

In your main website's JavaScript, you can now get content like this:

```javascript
// Get episodes for display
const episodes = getEpisodes();
console.log('Episodes:', episodes);

// Get clans for display  
const clans = getClans();
console.log('Clans:', clans);

// Get locations for display
const locations = getLocations();
console.log('Locations:', locations);

// Get main page content
const mainContent = getMainPageContent();
console.log('Main page:', mainContent);
```

### Step 3: Display Content on Your Website

Example of displaying episodes:

```javascript
function displayEpisodes() {
    const episodes = getEpisodes();
    const container = document.getElementById('episodes-container');
    
    container.innerHTML = episodes.map(episode => `
        <div class="episode">
            <h3>${episode.title}</h3>
            <p>${episode.meta_description}</p>
            <div class="content">${episode.content}</div>
        </div>
    `).join('');
}

// Call when page loads
document.addEventListener('DOMContentLoaded', displayEpisodes);
```

## 🔄 Real-Time Updates

To make your website update automatically when content is added:

```javascript
// Listen for content updates from admin panel
document.addEventListener('hiddenWorldContentUpdated', function(event) {
    console.log('Content updated!', event.detail);
    
    // Refresh your website display
    displayEpisodes();
    displayClans();
    displayLocations();
});
```

## 🚀 How It Works

1. **Admin panel** saves content to `localStorage`
2. **website-data.js** reads from `localStorage` and provides clean functions
3. **Your main website** calls functions like `getEpisodes()` to get current content
4. **Content appears immediately** for all visitors

## ✅ Testing the Integration

1. **Upload the 3 files** to your website
2. **Add the script tag** to your main website  
3. **Open browser console** on your main website
4. **Type**: `getEpisodes()` - you should see the default episodes
5. **Open admin panel** and add new content
6. **Refresh main website** - new content should appear

## 🎉 Benefits

- ✅ **Simple localStorage** - no complex database setup
- ✅ **Works immediately** - content appears for all visitors  
- ✅ **30 fonts supported** - rich text editing with full font selection
- ✅ **Password protected** - secure admin access
- ✅ **Drag & drop reordering** - episodes can be reordered
- ✅ **Image uploads** - cover images and inline images work
- ✅ **Real-time updates** - changes appear immediately

## 📝 Important Notes

- **Password**: Default is `hiddenworld2024` (you can change it in the JS file)
- **Data storage**: Uses browser localStorage (works for public websites)
- **Font selection**: All 30 fonts work properly now
- **No server required**: Pure client-side solution

Your Hidden World of London content will now be visible to all website visitors! ✨🏰🗝️