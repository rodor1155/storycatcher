/**
 * JSON File Generator for GitHub Pages
 * Generates JSON files that can be downloaded and committed to GitHub
 */

class JSONFileGenerator {
    
    // Generate episodes JSON file
    generateEpisodesJSON() {
        const episodes = getStoredData('episodes');
        const jsonContent = JSON.stringify(episodes, null, 2);
        this.downloadJSON(jsonContent, 'episodes.json');
        
        console.log('📁 Generated episodes.json for download');
        showSuccess('Episodes JSON generated! Download and replace data/episodes.json in your GitHub repo.');
    }
    
    // Generate clans JSON file
    generateClansJSON() {
        const clans = getStoredData('clans');
        const jsonContent = JSON.stringify(clans, null, 2);
        this.downloadJSON(jsonContent, 'clans.json');
        
        console.log('📁 Generated clans.json for download');
        showSuccess('Clans JSON generated! Download and replace data/clans.json in your GitHub repo.');
    }
    
    // Generate locations JSON file
    generateLocationsJSON() {
        const locations = getStoredData('locations');
        const jsonContent = JSON.stringify(locations, null, 2);
        this.downloadJSON(jsonContent, 'locations.json');
        
        console.log('📁 Generated locations.json for download');
        showSuccess('Locations JSON generated! Download and replace data/locations.json in your GitHub repo.');
    }
    
    // Generate all JSON files
    generateAllJSON() {
        this.generateEpisodesJSON();
        this.generateClansJSON();
        this.generateLocationsJSON();
        
        showSuccess('All JSON files generated! Download them and replace the files in your GitHub repo data/ folder, then publish.');
    }
    
    // Download JSON as file
    downloadJSON(jsonContent, filename) {
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        URL.revokeObjectURL(url);
    }
    
    // Auto-update JSON files when content changes
    updateJSONFiles() {
        console.log('📁 Content updated - JSON files need to be regenerated');
        
        // Show notification to user
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-download"></i>
                <div>
                    <p class="font-semibold">Content Updated!</p>
                    <p class="text-sm">Download new JSON files to publish changes</p>
                </div>
                <button onclick="window.jsonGenerator.generateAllJSON()" class="bg-white text-blue-500 px-3 py-1 rounded text-sm font-semibold">
                    Download All
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove notification after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }
}

// Create global instance
window.jsonGenerator = new JSONFileGenerator();

console.log('📁 JSON File Generator initialized');