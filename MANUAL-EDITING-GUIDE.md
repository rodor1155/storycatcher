# 📚 Manual HTML Editing Guide - The Hidden World of London

## 🎯 Overview
Since we've chosen manual HTML editing over the database-driven admin system (due to GitHub Pages limitations), this guide will help you manage and update your website content directly through HTML files.

## 📁 Project Structure
```
├── index.html                 # Main homepage
├── admin.html                 # Admin panel (not used with manual editing)
├── css/
│   └── style.css             # Styling and layout
├── js/
│   ├── main.js               # Main functionality with static data
│   └── admin.js              # Admin functions (not used with manual editing)
├── README.md                 # Project documentation
└── MANUAL-EDITING-GUIDE.md   # This guide
```

## 🔧 How to Edit Content

### 1. 📖 Adding New Episodes

Episodes are stored as static data in `js/main.js`. To add a new episode:

1. **Open** `js/main.js`
2. **Find** the `allEpisodes` array (around line 88)
3. **Add** a new episode object at the beginning of the array:

```javascript
{
    id: 'ep4', // Unique ID
    title: 'Your Episode Title',
    meta_description: 'Short description that appears on cards',
    content: '<p>Full episode content goes here...</p><p>You can use HTML tags for formatting.</p>',
    created_at: Date.now(), // Current timestamp
    image_url: null, // Add image URL if you have one
    page_type: 'episode',
    status: 'published'
},
```

**Example:**
```javascript
allEpisodes = [
    {
        id: 'ep4',
        title: 'The Midnight Market of Borough',
        meta_description: 'Join Alex as they discover a market that only appears when Big Ben strikes midnight.',
        content: '<p>Every night at midnight, when the last tourist leaves Borough Market, something magical happens...</p><p>Alex was walking home late when they heard the sound of market bells ringing. But Borough Market had been closed for hours...</p>',
        created_at: Date.now(),
        image_url: null,
        page_type: 'episode',
        status: 'published'
    },
    // ... existing episodes
];
```

### 2. 🏰 Adding New Clans

Clans are also in `js/main.js`. To add a new clan:

1. **Find** the `allClans` array (around line 118)
2. **Add** a new clan object:

```javascript
{
    id: 'clan6', // Unique ID
    name: 'Your Clan Name',
    stone_description: 'Origin story of the clan stone...',
    offering: 'What powers this clan provides...',
    resonance_note: 'How to connect with this clan...',
    color_primary: '#HEX_COLOR', // Primary color
    color_secondary: '#HEX_COLOR', // Secondary color
    emblem_url: null, // Add image URL if you have one
    status: 'active'
},
```

**Example:**
```javascript
{
    id: 'clan6',
    name: 'Music Clan',
    stone_description: 'This stone was born from the first song ever sung in London. It resonates with every melody that has ever echoed through the city\'s streets, from ancient folk songs to modern symphonies.',
    offering: 'The power to hear the music in everything, to calm any creature with song, and to remember any melody perfectly. Members can make beautiful music from any object and their songs can heal sadness.',
    resonance_note: 'Sing your favorite song alone, with your whole heart. If you hear harmonies that weren\'t there before, the Music Clan is singing with you.',
    color_primary: '#EC4899',
    color_secondary: '#F59E0B',
    emblem_url: null,
    status: 'active'
},
```

### 3. 📍 Adding New Locations

Locations are stored in the same `allLocations` array in `js/main.js`:

1. **Find** the `allLocations` array (around line 185)
2. **Add** a new location object:

```javascript
{
    id: 'loc4', // Unique ID
    name: "Location Name",
    latitude: 51.5074, // GPS coordinates
    longitude: -0.1278,
    magical_description: "What makes this place special...",
    what_to_look_for: "Specific things children should notice...",
    image_url: null, // Add image URL if you have one
    status: 'active'
},
```

### 4. 🖼️ Adding Images

Since we don't have a database, you have a few options for images:

#### Option A: Use External Image URLs
1. Upload your image to a free service like:
   - [Imgur](https://imgur.com)
   - [Cloudinary](https://cloudinary.com)
   - [ImageBB](https://imgbb.com)
2. Copy the direct image URL
3. Add it to your content:
   ```javascript
   image_url: "https://your-image-service.com/your-image.jpg"
   ```

#### Option B: Base64 Encoding (for small images only)
1. Convert your image to base64 using an online tool
2. Add the base64 string:
   ```javascript
   image_url: "data:image/jpeg;base64,YOUR_BASE64_STRING_HERE"
   ```

### 5. 🎨 Editing Homepage Content

For static homepage content, edit `index.html` directly:

#### Hero Section
Find the hero section (around line 64) and edit:
```html
<h1 class="text-4xl md:text-6xl font-fredoka font-bold mb-6 magical-text">
    The Hidden World of London ✨
</h1>
<p class="text-xl md:text-2xl font-nunito mb-8 max-w-3xl mx-auto">
    Your custom description here...
</p>
```

#### About Section
Find the about section (around line 150) and edit the content within the paragraph tags.

## 🎯 Content Guidelines

### Episode Writing Tips
- **Start with action**: Jump right into the magical discovery
- **Use child-friendly language**: Ages 8-12 is the target
- **Include sensory details**: What do they see, hear, feel?
- **End with wonder**: Leave readers wanting to explore themselves
- **Keep it interactive**: Ask questions, suggest things to look for

### Clan Creation Tips
- **Unique powers**: Each clan should offer something different
- **Clear connection ritual**: Simple steps children can actually do
- **Relatable origins**: Connect to real London history or geography
- **Positive messages**: Focus on helping others and personal growth

### Location Guidelines
- **Real London places**: Use actual locations children can visit
- **Safety first**: Only suggest safe, public locations
- **Specific details**: Give concrete things to look for
- **Magical but believable**: Keep the wonder grounded in reality

## 🔄 Testing Your Changes

After making edits:
1. **Save** the file
2. **Open** `index.html` in your web browser
3. **Check** that new content appears correctly
4. **Test** any interactive elements
5. **Verify** the map still loads properly

## 🚀 Publishing Changes

1. **Commit** your changes to Git:
   ```bash
   git add .
   git commit -m "Add new episode/clan/location"
   git push
   ```

2. **GitHub Pages** will automatically rebuild your site
3. Changes will be live within a few minutes

## ⚠️ Important Notes

### File Locations to Remember:
- **Episode/Clan/Location Data**: `js/main.js` (around lines 88-220)
- **Homepage Text**: `index.html`
- **Styling**: `css/style.css`

### Things to Avoid:
- Don't edit `admin.html` or `js/admin.js` (they won't work on GitHub Pages)
- Don't use very large base64 images (they slow down loading)
- Always test locally before pushing changes
- Keep backup copies of your content

### Color Codes for Clans:
- **River Clan**: `#0EA5E9`, `#06B6D4` (Blues)
- **Earth Clan**: `#16A34A`, `#84CC16` (Greens)
- **Sky Clan**: `#3B82F6`, `#8B5CF6` (Blue-Purple)
- **Fire Clan**: `#EF4444`, `#F59E0B` (Red-Orange)
- **Shadow Clan**: `#6366F1`, `#8B5CF6` (Purples)

## 🎪 Fun Ideas for New Content

### Episode Ideas:
- The Singing Statues of Trafalgar Square
- The Ghost Bus Route 15
- The Secret Library Under St. Paul's
- The Midnight Garden of Kensington Palace
- The Whispering Well at the Tower of London

### New Clan Ideas:
- **Time Clan**: Powers over past/future memories
- **Dream Clan**: Abilities in the dream realm
- **Word Clan**: Magic through stories and languages
- **Star Clan**: Connection to celestial magic

### Location Ideas:
- The Hidden Gardens of the Barbican
- The Ancient Roman Wall (visible sections)
- The Seven Noses of Soho
- The Winchester Palace Rose Window
- The Old Bailey's Lady Justice

## 📞 Need Help?

If you run into issues:
1. **Check the browser console** for error messages (F12 → Console)
2. **Validate your JSON** if editing the data arrays
3. **Test one change at a time** to isolate problems
4. **Keep backups** of working versions

---

*Happy editing! Remember, every story you add makes London a little more magical for children around the world.* ✨🏰📚