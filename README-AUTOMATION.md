# Automated Patch Notes System

## Overview
Your SUPERVIVE patch notes site now has a complete automated system that monitors Steam RSS feeds and automatically adds new patch notes.

## System Components

### 1. **Patch Data Manager** (`assets/js/patch-data.js`)
- Manages patch data loading and storage
- Handles Steam RSS feed parsing
- Provides structured patch data format
- Includes fallback data and validation

### 2. **Steam RSS Scraper** (`scripts/steam-rss-scraper.js`)
- Fetches Steam RSS feed for SUPERVIVE (App ID: 1283780)
- Parses XML data and extracts patch information
- Categorizes changes (hunters, equipment, systems, maps, modes)
- Prevents duplicate entries
- Saves to `assets/data/patches.json`

### 3. **GitHub Actions Automation** (`.github/workflows/auto-patch-scraper.yml`)
- Runs every 4 hours automatically
- Can be triggered manually
- Commits new patch data to repository
- No server required - runs on GitHub's infrastructure

### 4. **Structured Data** (`assets/data/patches.json`)
- JSON format for all patch data
- Includes metadata, categorized changes, Steam URLs
- Easy to extend and modify

## How It Works

### Automatic Process:
1. **GitHub Actions** runs the scraper every 4 hours
2. **Scraper** fetches Steam RSS feed
3. **Parser** extracts patch information and categorizes changes
4. **System** checks for duplicates and adds new patches
5. **Auto-commit** pushes changes to your repository
6. **Site** automatically shows new patches on next visit

### Manual Process:
```bash
# Run scraper locally
node scripts/steam-rss-scraper.js

# Or trigger GitHub Action manually
# Go to GitHub > Actions > Auto Patch Scraper > Run workflow
```

## Setup Instructions

### 1. **Enable GitHub Actions**
- Push your code to GitHub
- Actions will automatically start running
- Check the "Actions" tab to see scraper runs

### 2. **Test Locally**
```bash
# Install Node.js if not installed
# Run the scraper
node scripts/steam-rss-scraper.js
```

### 3. **Customize Settings**
Edit `scripts/steam-rss-scraper.js`:
- Change `appId` if needed
- Modify parsing rules
- Adjust categorization keywords

## Data Format

Each patch follows this structure:
```json
{
  "id": "patch-unique-id",
  "title": "Patch Title from Steam",
  "date": "2025-07-30",
  "version": "1.0.1",
  "steamUrl": "https://store.steampowered.com/news/...",
  "summary": "Brief description...",
  "changes": {
    "hunters": [{"description": "...", "type": "buff|nerf|fix|new|rework|change"}],
    "equipment": [...],
    "systems": [...],
    "maps": [...],
    "modes": [...]
  },
  "rawContent": "Full original content",
  "addedAt": "2025-01-15T10:30:00.000Z"
}
```

## Features

### Automatic Features:
- ✅ **Duplicate Prevention** - Won't add the same patch twice
- ✅ **Smart Categorization** - Automatically sorts changes by type
- ✅ **Change Type Detection** - Identifies buffs, nerfs, fixes, etc.
- ✅ **Version Extraction** - Pulls version numbers from titles
- ✅ **Summary Generation** - Creates readable summaries
- ✅ **Steam URL Linking** - Direct links to original posts

### Manual Features:
- ✅ **Browser Notifications** - Shows when new patches are found
- ✅ **Live Updates** - Checks for new patches every 5 minutes
- ✅ **Fallback Data** - Works even if JSON fails to load
- ✅ **Search & Filter** - Works with automated data

## Monitoring

### Check Automation Status:
1. **GitHub Actions Tab** - See scraper run history
2. **Browser Console** - Check for update messages
3. **Last Check File** - `scripts/last-check.txt` shows last run
4. **JSON File** - `assets/data/patches.json` contains all data

### Troubleshooting:
- **No new patches**: Check if Steam actually posted new updates
- **Parsing errors**: Steam might have changed their RSS format
- **GitHub Actions failing**: Check Actions tab for error logs
- **Local testing**: Run `node scripts/steam-rss-scraper.js`

## Customization

### Add More Sources:
```javascript
// In patch-data.js, add more RSS feeds
const additionalSources = [
  'https://supervive.wiki.gg/feed',
  'https://reddit.com/r/supervive/.rss'
];
```

### Modify Parsing Rules:
```javascript
// In steam-rss-scraper.js
isPatchNote(title, description) {
  // Add your own keywords
  const patchKeywords = [
    'patch', 'update', 'hotfix', 'balance'
    // Add more...
  ];
}
```

### Change Update Frequency:
```yaml
# In .github/workflows/auto-patch-scraper.yml
schedule:
  - cron: '0 */2 * * *'  # Every 2 hours instead of 4
```

## Benefits

1. **Zero Maintenance** - Runs automatically
2. **Always Current** - Updates within 4 hours of Steam posts
3. **No Server Costs** - Uses GitHub's free infrastructure
4. **Reliable** - GitHub Actions has 99.9% uptime
5. **Transparent** - All runs logged and visible
6. **Customizable** - Easy to modify and extend

Your patch notes site is now fully automated and will stay current with SUPERVIVE updates!