// Patch Data Management System for SUPERVIVE

class PatchDataManager {
    constructor() {
        this.patches = [];
        this.steamAppId = '1283780'; // SUPERVIVE Steam App ID
        this.steamRssUrl = `https://store.steampowered.com/feeds/news/app/${this.steamAppId}/`;
        this.lastUpdateCheck = localStorage.getItem('lastPatchCheck') || '2024-01-01';
    }

    // Load existing patch data
    async loadPatches() {
        try {
            const response = await fetch('assets/data/patches.json');
            this.patches = await response.json();
            return this.patches;
        } catch (error) {
            console.warn('Could not load patches.json, using fallback data');
            return this.getFallbackPatches();
        }
    }

    // Check Steam RSS for new patches
    async checkForNewPatches() {
        try {
            // Note: Direct RSS access will be blocked by CORS in browser
            // This would need to run server-side or use a proxy
            console.log('Checking Steam RSS for new patches...');
            
            // For now, we'll simulate the RSS check
            // In production, this would be handled by a server or GitHub Action
            return await this.simulateRssCheck();
            
        } catch (error) {
            console.error('Error checking for new patches:', error);
            return [];
        }
    }

    // Simulate RSS feed parsing (replace with actual RSS parser server-side)
    async simulateRssCheck() {
        const mockNewPatch = {
            id: `patch-${Date.now()}`,
            title: 'Latest Update from Steam RSS',
            date: new Date().toISOString().split('T')[0],
            version: '1.0.1',
            steamUrl: `https://store.steampowered.com/news/app/${this.steamAppId}`,
            summary: 'Automatically detected patch from Steam RSS feed',
            changes: {
                hunters: [],
                equipment: [],
                systems: [],
                maps: [],
                modes: []
            },
            rawContent: 'RSS content would be parsed here'
        };

        // Check if this patch already exists
        const exists = this.patches.some(patch => 
            patch.title === mockNewPatch.title || 
            patch.date === mockNewPatch.date
        );

        return exists ? [] : [mockNewPatch];
    }

    // Parse Steam news content into structured data
    parseSteamContent(content, title, date) {
        const patch = {
            id: `patch-${Date.now()}`,
            title: title,
            date: date,
            version: this.extractVersion(title),
            steamUrl: `https://store.steampowered.com/news/app/${this.steamAppId}`,
            summary: this.extractSummary(content),
            changes: this.parseChanges(content),
            rawContent: content
        };

        return patch;
    }

    // Extract version from title
    extractVersion(title) {
        const versionMatch = title.match(/v?(\d+\.\d+\.?\d*)/i);
        return versionMatch ? versionMatch[1] : 'Unknown';
    }

    // Extract summary from content
    extractSummary(content) {
        // Remove HTML tags and get first paragraph
        const textContent = content.replace(/<[^>]*>/g, '');
        const firstParagraph = textContent.split('\n')[0];
        return firstParagraph.substring(0, 200) + '...';
    }

    // Parse content for structured changes
    parseChanges(content) {
        const changes = {
            hunters: [],
            equipment: [],
            systems: [],
            maps: [],
            modes: []
        };

        // Define keywords for each category
        const keywords = {
            hunters: ['hunter', 'ability', 'passive', 'ultimate', 'damage', 'cooldown', 'mana'],
            equipment: ['armor', 'weapon', 'item', 'relic', 'grip', 'kick', 'perk'],
            systems: ['matchmaking', 'progression', 'xp', 'ranking', 'ui', 'interface'],
            maps: ['map', 'terrain', 'spawn', 'objective'],
            modes: ['mode', 'gamemode', 'pvp', 'ranked', 'casual']
        };

        // Simple keyword-based categorization
        const lines = content.toLowerCase().split('\n');
        
        lines.forEach(line => {
            if (line.trim().length < 10) return; // Skip short lines
            
            Object.keys(keywords).forEach(category => {
                const hasKeyword = keywords[category].some(keyword => 
                    line.includes(keyword)
                );
                
                if (hasKeyword && changes[category].length < 5) { // Limit entries
                    changes[category].push({
                        description: line.trim().substring(0, 100),
                        type: 'change'
                    });
                }
            });
        });

        return changes;
    }

    // Add new patch to collection
    addPatch(patchData) {
        // Validate patch data
        if (!patchData.title || !patchData.date) {
            throw new Error('Patch must have title and date');
        }

        // Check for duplicates
        const exists = this.patches.some(patch => 
            patch.title === patchData.title || patch.id === patchData.id
        );

        if (exists) {
            console.warn('Patch already exists:', patchData.title);
            return false;
        }

        // Add to collection
        this.patches.unshift(patchData); // Add to beginning
        this.savePatchData();
        return true;
    }

    // Save patch data (in production, this would save to server)
    savePatchData() {
        // In a real implementation, this would send to your server
        console.log('Saving patch data...', this.patches.length, 'patches');
        localStorage.setItem('patchData', JSON.stringify(this.patches));
        localStorage.setItem('lastPatchCheck', new Date().toISOString());
    }

    // Get fallback patch data
    getFallbackPatches() {
        return [
            {
                id: 'patch-1',
                title: 'July 30 - Armory Balance Hotfix',
                date: '2025-07-30',
                version: '1.0.1',
                summary: 'Prisma Gems from daily missions increased and weekend events introduced.',
                changes: {
                    hunters: [],
                    equipment: [],
                    systems: [
                        { description: 'Prisma Gems from daily missions increased: 100 → 400 per mission (300% increase)', type: 'buff' },
                        { description: 'Enhanced rewards to support casual player progression', type: 'improvement' },
                        { description: 'Weekend Events: Double XP, Free Hunter Weekend, Prisma Boost', type: 'new' }
                    ],
                    maps: [],
                    modes: []
                }
            },
            {
                id: 'patch-2',
                title: 'Version 1.0 - Global Launch',
                date: '2025-07-24',
                version: '1.0.0',
                summary: 'Complete game overhaul with new Armory system and team size changes.',
                changes: {
                    hunters: [
                        { description: 'New hunters: Wukong, Crysta, Carbine, Saros, Joule, Myth', type: 'new' }
                    ],
                    equipment: [
                        { description: 'Complete game overhaul with new Armory system', type: 'rework' }
                    ],
                    systems: [
                        { description: 'Team size changed to 3 hunters for balanced gameplay', type: 'change' }
                    ],
                    maps: [],
                    modes: []
                }
            }
        ];
    }

    // Get patches with filtering
    getPatches(filter = 'all', searchTerm = '') {
        let filtered = [...this.patches];

        // Apply category filter
        if (filter !== 'all') {
            filtered = filtered.filter(patch => {
                return patch.changes[filter] && patch.changes[filter].length > 0;
            });
        }

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(patch => {
                const searchableText = [
                    patch.title,
                    patch.summary,
                    patch.version,
                    JSON.stringify(patch.changes)
                ].join(' ').toLowerCase();
                
                return searchableText.includes(term);
            });
        }

        return filtered;
    }
}

// Export for use
window.PatchDataManager = PatchDataManager;