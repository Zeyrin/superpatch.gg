// Steam RSS Scraper for SUPERVIVE Patch Notes
// Run with: node scripts/steam-rss-scraper.js

const https = require('https');
const fs = require('fs');
const path = require('path');

class SteamRssScraper {
    constructor() {
        this.appId = '1283780'; // SUPERVIVE Steam App ID
        this.rssUrl = `https://store.steampowered.com/feeds/news/app/${this.appId}/`;
        this.patchesFile = path.join(__dirname, '..', 'assets', 'data', 'patches.json');
        this.lastCheckFile = path.join(__dirname, 'last-check.txt');
    }

    // Fetch RSS feed from Steam
    async fetchRssFeed() {
        return new Promise((resolve, reject) => {
            console.log('Fetching Steam RSS feed...');
            
            https.get(this.rssUrl, (res) => {
                let data = '';
                
                res.on('data', (chunk) => {
                    data += chunk;
                });
                
                res.on('end', () => {
                    resolve(data);
                });
                
            }).on('error', (err) => {
                reject(err);
            });
        });
    }

    // Parse RSS XML to extract patch information
    parseRssData(xmlData) {
        const patches = [];
        
        // Simple XML parsing (in production, use a proper XML parser like xml2js)
        const itemRegex = /<item>(.*?)<\/item>/gs;
        const items = xmlData.match(itemRegex) || [];
        
        items.forEach(item => {
            const title = this.extractXmlTag(item, 'title');
            const link = this.extractXmlTag(item, 'link');
            const pubDate = this.extractXmlTag(item, 'pubDate');
            const description = this.extractXmlTag(item, 'description');
            
            // Only process if it looks like a patch note
            if (this.isPatchNote(title, description)) {
                const patch = this.createPatchObject(title, link, pubDate, description);
                patches.push(patch);
            }
        });
        
        return patches;
    }

    // Extract content from XML tags
    extractXmlTag(xml, tag) {
        const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's');
        const match = xml.match(regex);
        return match ? match[1].trim() : '';
    }

    // Check if the post is a patch note
    isPatchNote(title, description) {
        const patchKeywords = [
            'patch', 'update', 'hotfix', 'balance', 'nerf', 'buff',
            'version', 'changelog', 'fix', 'adjustment', 'improvement'
        ];
        
        const text = (title + ' ' + description).toLowerCase();
        return patchKeywords.some(keyword => text.includes(keyword));
    }

    // Create structured patch object
    createPatchObject(title, link, pubDate, description) {
        const date = new Date(pubDate).toISOString().split('T')[0];
        const cleanTitle = this.cleanHtml(title);
        const cleanDescription = this.cleanHtml(description);
        
        return {
            id: `patch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: cleanTitle,
            date: date,
            version: this.extractVersion(cleanTitle),
            steamUrl: link,
            summary: this.createSummary(cleanDescription),
            changes: this.parseChanges(cleanDescription),
            rawContent: cleanDescription,
            addedAt: new Date().toISOString()
        };
    }

    // Clean HTML from text
    cleanHtml(html) {
        return html
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .trim();
    }

    // Extract version from title
    extractVersion(title) {
        const versionMatch = title.match(/v?(\d+\.\d+\.?\d*)/i);
        return versionMatch ? versionMatch[1] : 'Unknown';
    }

    // Create summary from description
    createSummary(description) {
        const sentences = description.split('. ');
        const firstSentence = sentences[0];
        return firstSentence.length > 200 
            ? firstSentence.substring(0, 200) + '...'
            : firstSentence + '.';
    }

    // Parse changes from description
    parseChanges(content) {
        const changes = {
            hunters: [],
            equipment: [],
            systems: [],
            maps: [],
            modes: []
        };

        const keywords = {
            hunters: ['hunter', 'ability', 'passive', 'ultimate', 'damage', 'cooldown', 'mana', 'health'],
            equipment: ['armor', 'weapon', 'item', 'relic', 'grip', 'kick', 'perk', 'armory'],
            systems: ['matchmaking', 'progression', 'xp', 'ranking', 'ui', 'interface', 'currency'],
            maps: ['map', 'terrain', 'spawn', 'objective', 'zone'],
            modes: ['mode', 'gamemode', 'pvp', 'ranked', 'casual', 'tournament']
        };

        const lines = content.toLowerCase().split(/[.\n\r]+/);
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine.length < 15) return; // Skip very short lines
            
            Object.keys(keywords).forEach(category => {
                const hasKeyword = keywords[category].some(keyword => 
                    trimmedLine.includes(keyword)
                );
                
                if (hasKeyword && changes[category].length < 5) {
                    changes[category].push({
                        description: trimmedLine.charAt(0).toUpperCase() + trimmedLine.slice(1),
                        type: this.determineChangeType(trimmedLine)
                    });
                }
            });
        });

        return changes;
    }

    // Determine type of change
    determineChangeType(text) {
        if (text.includes('increased') || text.includes('buff') || text.includes('improved')) return 'buff';
        if (text.includes('decreased') || text.includes('nerf') || text.includes('reduced')) return 'nerf';
        if (text.includes('fixed') || text.includes('bug')) return 'fix';
        if (text.includes('new') || text.includes('added')) return 'new';
        if (text.includes('rework') || text.includes('redesign')) return 'rework';
        return 'change';
    }

    // Load existing patches
    loadExistingPatches() {
        try {
            if (fs.existsSync(this.patchesFile)) {
                const data = fs.readFileSync(this.patchesFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading existing patches:', error);
        }
        return [];
    }

    // Save patches to file
    savePatches(patches) {
        try {
            const dir = path.dirname(this.patchesFile);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            
            fs.writeFileSync(this.patchesFile, JSON.stringify(patches, null, 2));
            console.log(`Saved ${patches.length} patches to ${this.patchesFile}`);
        } catch (error) {
            console.error('Error saving patches:', error);
        }
    }

    // Get last check time
    getLastCheckTime() {
        try {
            if (fs.existsSync(this.lastCheckFile)) {
                return fs.readFileSync(this.lastCheckFile, 'utf8').trim();
            }
        } catch (error) {
            console.error('Error reading last check time:', error);
        }
        return '2024-01-01';
    }

    // Save last check time
    saveLastCheckTime() {
        try {
            fs.writeFileSync(this.lastCheckFile, new Date().toISOString());
        } catch (error) {
            console.error('Error saving last check time:', error);
        }
    }

    // Main scraping function
    async scrapeAndUpdate() {
        try {
            console.log('Starting Steam RSS scraping...');
            
            // Fetch RSS data
            const rssData = await this.fetchRssFeed();
            
            // Parse new patches
            const newPatches = this.parseRssData(rssData);
            console.log(`Found ${newPatches.length} potential new patches`);
            
            // Load existing patches
            const existingPatches = this.loadExistingPatches();
            const existingTitles = new Set(existingPatches.map(p => p.title));
            
            // Filter out duplicates
            const trulyNewPatches = newPatches.filter(patch => 
                !existingTitles.has(patch.title)
            );
            
            if (trulyNewPatches.length > 0) {
                console.log(`Adding ${trulyNewPatches.length} new patches`);
                
                // Add new patches to the beginning
                const allPatches = [...trulyNewPatches, ...existingPatches];
                
                // Save updated patches
                this.savePatches(allPatches);
                
                // Update last check time
                this.saveLastCheckTime();
                
                return trulyNewPatches;
            } else {
                console.log('No new patches found');
                this.saveLastCheckTime();
                return [];
            }
            
        } catch (error) {
            console.error('Error during scraping:', error);
            return [];
        }
    }
}

// Run scraper if called directly
if (require.main === module) {
    const scraper = new SteamRssScraper();
    scraper.scrapeAndUpdate().then(newPatches => {
        if (newPatches.length > 0) {
            console.log('New patches added:');
            newPatches.forEach(patch => {
                console.log(`- ${patch.title} (${patch.date})`);
            });
        }
        console.log('Scraping complete!');
    });
}

module.exports = SteamRssScraper;