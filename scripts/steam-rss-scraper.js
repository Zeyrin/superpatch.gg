// Steam RSS Scraper for SUPERVIVE Patch Notes with Smart AI-Free Parsing
// Run with: node scripts/steam-rss-scraper.js

const https = require('https');
const fs = require('fs');
const path = require('path');
const SmartFreeParser = require('./smart-parser');
const HuggingFaceEnhancer = require('./huggingface-integration');

class SteamRssScraper {
    constructor() {
        this.appId = '1283700'; // SUPERVIVE Steam App ID (corrected)
        this.rssUrl = `https://store.steampowered.com/feeds/news/app/${this.appId}/`;
        this.patchesFile = path.join(__dirname, '..', 'assets', 'data', 'patches.json');
        this.lastCheckFile = path.join(__dirname, 'last-check.txt');
        
        // Initialize smart parsing
        this.smartParser = new SmartFreeParser();
        this.huggingFace = new HuggingFaceEnhancer();
        
        console.log('🚀 Steam RSS Scraper initialized with Smart AI-Free Parsing');
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
                    console.log(`Fetched ${data.length} characters from RSS feed`);
                    console.log('First 500 characters:', data.substring(0, 500));
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
        
        console.log(`Found ${items.length} RSS items to process`);
        
        items.forEach((item, index) => {
            const title = this.extractXmlTag(item, 'title');
            const link = this.extractXmlTag(item, 'link');
            const pubDate = this.extractXmlTag(item, 'pubDate');
            const description = this.extractXmlTag(item, 'description');
            
            console.log(`Item ${index + 1}: "${title}"`);
            
            // Only process if it looks like a patch note
            if (this.isPatchNote(title, description)) {
                console.log(`  ✓ Identified as patch note`);
                const patch = this.createPatchObject(title, link, pubDate, description);
                patches.push(patch);
            } else {
                console.log(`  ✗ Not a patch note`);
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

    // Enhanced patch note detection
    isPatchNote(title, description) {
        const patchKeywords = [
            'patch', 'update', 'hotfix', 'balance', 'nerf', 'buff',
            'version', 'changelog', 'fix', 'adjustment', 'improvement',
            'notes', 'changes', 'maintenance', 'stability', 'performance',
            'hunter', 'armory', 'prisma', 'rework', 'launch'
        ];
        
        // Exclude non-patch content
        const excludeKeywords = [
            'event', 'sale', 'discount', 'announcement', 'trailer',
            'dev diary', 'interview', 'community', 'stream', 'contest'
        ];
        
        const text = (title + ' ' + description).toLowerCase();
        
        const hasPatchKeyword = patchKeywords.some(keyword => text.includes(keyword));
        const hasExcludeKeyword = excludeKeywords.some(keyword => text.includes(keyword));
        
        // Must have patch keywords and not have exclude keywords
        return hasPatchKeyword && !hasExcludeKeyword;
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

    // Enhanced HTML cleaning with better formatting
    cleanHtml(html) {
        return html
            // Convert common HTML structures to readable text
            .replace(/<br\s*\/?>/gi, '\n') // Convert <br> to newlines
            .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n') // Convert </p><p> to double newlines
            .replace(/<p[^>]*>/gi, '') // Remove opening <p> tags
            .replace(/<\/p>/gi, '\n') // Convert closing </p> to newline
            .replace(/<\/li>\s*<li[^>]*>/gi, '\n• ') // Convert </li><li> to bullet points
            .replace(/<li[^>]*>/gi, '• ') // Convert <li> to bullets
            .replace(/<\/li>/gi, '') // Remove closing </li>
            .replace(/<ul[^>]*>|<\/ul>/gi, '') // Remove <ul> tags
            .replace(/<ol[^>]*>|<\/ol>/gi, '') // Remove <ol> tags
            .replace(/<div[^>]*class="bb_h[1-6]"[^>]*>/gi, '\n### ') // Convert headers
            .replace(/<\/div>/gi, '') // Remove closing divs
            .replace(/<blockquote[^>]*>/gi, '\n> ') // Convert blockquotes
            .replace(/<\/blockquote>/gi, '\n') // Close blockquotes
            .replace(/<b[^>]*>|<\/b>/gi, '**') // Convert bold to markdown
            .replace(/<i[^>]*>|<\/i>/gi, '*') // Convert italic to markdown
            .replace(/<[^>]*>/g, '') // Remove all remaining HTML tags
            // Clean up HTML entities
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&#x27;/g, "'")
            .replace(/&nbsp;/g, ' ')
            // Clean up whitespace and formatting
            .replace(/\n\s*\n\s*\n/g, '\n\n') // Remove extra newlines
            .replace(/^\s+|\s+$/gm, '') // Trim lines
            .replace(/\s+/g, ' ') // Normalize spaces within lines
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

    // Smart AI-Free parsing using multiple techniques
    async parseChanges(content) {
        try {
            console.log('🧠 Using Smart AI-Free Parser...');
            
            // Use the smart parser for primary extraction
            const smartResults = await this.smartParser.parse(content);
            
            // Optional: Enhance with Hugging Face if API token available
            const enhancedResults = await this.huggingFace.enhanceParsing(content, smartResults);
            
            return enhancedResults;
            
        } catch (error) {
            console.log('⚠️  Smart parsing failed, using fallback:', error.message);
            return this.legacyParseChanges(content);
        }
    }

    // Legacy parsing as fallback
    legacyParseChanges(content) {
        const changes = {
            hunters: [],
            equipment: [],
            systems: [],
            maps: [],
            modes: []
        };

        // Enhanced keyword sets for better categorization
        const keywords = {
            hunters: [
                'hunter', 'ability', 'passive', 'ultimate', 'damage', 'cooldown', 'mana', 'health',
                'elluna', 'wukong', 'ghost', 'saros', 'crysta', 'carbine', 'joule', 'myth',
                'beebo', 'bishop', 'brall', 'celeste', 'eva', 'felix', 'hudson', 'jin',
                'kingpin', 'oath', 'shiv', 'shrike', 'void', 'zeph', 'skill', 'talent'
            ],
            equipment: [
                'armor', 'weapon', 'item', 'relic', 'grip', 'kick', 'perk', 'armory',
                'equipment', 'gear', 'artifact', 'accessory', 'enhancement', 'upgrade',
                'crafting', 'forge', 'materials', 'resources', 'legendary', 'epic', 'rare'
            ],
            systems: [
                'matchmaking', 'progression', 'xp', 'ranking', 'ui', 'interface', 'currency',
                'prisma', 'gems', 'battle pass', 'daily', 'weekly', 'mission', 'quest',
                'reward', 'unlock', 'achievement', 'leaderboard', 'season', 'account'
            ],
            maps: [
                'map', 'terrain', 'spawn', 'objective', 'zone', 'environment', 'collision',
                'geometry', 'navigation', 'pathing', 'breach', 'megamap', 'area', 'region'
            ],
            modes: [
                'mode', 'gamemode', 'pvp', 'ranked', 'casual', 'tournament', 'competitive',
                'queue', 'matchmaking', 'lobby', 'custom', 'practice', 'training'
            ]
        };

        // Split content into sentences and bullet points for better parsing
        const sentences = content.split(/[.\n\r•\-\*]+/).map(s => s.trim()).filter(s => s.length > 10);
        
        sentences.forEach(sentence => {
            const lowerSentence = sentence.toLowerCase();
            
            // Extract numerical changes (damage, cooldown, percentages, etc.)
            const hasNumbers = /\d+/.test(sentence);
            const hasArrow = /→|->|increased|decreased|reduced|buffed|nerfed/i.test(sentence);
            
            Object.keys(keywords).forEach(category => {
                const hasKeyword = keywords[category].some(keyword => 
                    lowerSentence.includes(keyword.toLowerCase())
                );
                
                if (hasKeyword && changes[category].length < 10) {
                    const changeType = this.determineChangeType(sentence);
                    const priority = this.getChangePriority(sentence, hasNumbers, hasArrow);
                    
                    if (priority > 0) {
                        changes[category].push({
                            description: this.cleanDescription(sentence),
                            type: changeType,
                            priority: priority
                        });
                    }
                }
            });
        });

        // Sort changes by priority (most important first)
        Object.keys(changes).forEach(category => {
            changes[category].sort((a, b) => (b.priority || 0) - (a.priority || 0));
        });

        return changes;
    }

    // Get priority score for changes (higher = more important)
    getChangePriority(text, hasNumbers, hasArrow) {
        let priority = 1;
        
        // Higher priority for numerical changes
        if (hasNumbers) priority += 2;
        if (hasArrow) priority += 2;
        
        // Higher priority for specific hunter names
        const hunterNames = ['elluna', 'wukong', 'ghost', 'saros', 'crysta', 'carbine'];
        if (hunterNames.some(name => text.toLowerCase().includes(name))) priority += 3;
        
        // Higher priority for balance changes
        if (/buff|nerf|balance|adjust|fix/i.test(text)) priority += 2;
        
        // Higher priority for system changes
        if (/prisma|gem|xp|reward|progression/i.test(text)) priority += 2;
        
        return priority;
    }

    // Clean up description text with HTML cleaning
    cleanDescription(text) {
        const cleaned = this.cleanHtml(text)
            .replace(/^\s*[-•*]\s*/, '') // Remove bullet points
            .replace(/\s+/g, ' ') // Normalize whitespace
            .replace(/^[:\-\s]*/, '') // Remove leading colons/dashes
            .trim();
        
        // Capitalize first letter if text exists
        return cleaned.length > 0 
            ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
            : cleaned;
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