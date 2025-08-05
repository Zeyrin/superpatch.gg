// Test script for Smart AI-Free Parser
const SmartFreeParser = require('./smart-parser');

async function testSmartParser() {
    console.log('🧪 Testing Smart AI-Free Parser...\n');
    
    const parser = new SmartFreeParser();
    
    // Test with sample SUPERVIVE patch content
    const testContent = `
    Brall and Shiv received some nerfs earlier over the weekend, and we're making some additional adjustments to Wukong and Jin's movement so their LMBs don't make them quite so slippery.
    
    Daily quest Prisma rewards increased: 100 → 400 per quest (300% increase).
    
    Zeph: Cyclone Dash cooldown increased by 0.5 seconds at all levels.
    
    Hudson: Turn rate restriction at maximum heat 25°/sec >>> 45°/sec.
    
    BUGFIX: Beebo can no longer speed himself up during Tonk Tonk (R) by yoinking himself forward with Pull Zeep (RMB).
    
    All Vaults now guarantee at least one grip or relic.
    
    Arena mode now earns Prisma rewards (previously didn't reward Prisma).
    `;
    
    try {
        const results = await parser.parse(testContent, 'Test Patch');
        
        console.log('📊 Parsing Results:');
        console.log('==================');
        
        Object.entries(results).forEach(([category, changes]) => {
            if (changes.length > 0) {
                console.log(`\n${category.toUpperCase()} (${changes.length} changes):`);
                changes.forEach((change, index) => {
                    console.log(`  ${index + 1}. [${change.type.toUpperCase()}] ${change.description}`);
                });
            }
        });
        
        const totalChanges = Object.values(results).reduce((total, changes) => total + changes.length, 0);
        console.log(`\n✅ Successfully extracted ${totalChanges} changes across ${Object.keys(results).length} categories`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Test with real scraper integration
async function testWithScraper() {
    console.log('\n🔄 Testing with Steam RSS Scraper integration...\n');
    
    const SteamRssScraper = require('./steam-rss-scraper');
    const scraper = new SteamRssScraper();
    
    // Test the parsing directly
    const testHTML = `
    <div class="bb_h1">Hunter Updates</div>
    <ul class="bb_ul">
        <li>Ghost: Combat Slide cooldown increased by 0.5 seconds at all levels</li>
        <li>Carbine: XT3 Heavy Blaster first shot damage reduced by ~45%</li>
        <li>Shrike: Base movement speed increased from 475 >>> 490</li>
    </ul>
    
    <div class="bb_h1">Systems</div>
    <ul class="bb_ul">
        <li>Circle Damage now deals true damage and cannot be mitigated</li>
        <li>Most Wanted EXP completion reward capped at daily level limit</li>
    </ul>
    `;
    
    try {
        const results = await scraper.parseChanges(testHTML);
        
        console.log('📊 Scraper Integration Results:');
        console.log('===============================');
        
        Object.entries(results).forEach(([category, changes]) => {
            if (changes.length > 0) {
                console.log(`\n${category.toUpperCase()}:`);
                changes.forEach((change, index) => {
                    console.log(`  ${index + 1}. [${change.type.toUpperCase()}] ${change.description}`);
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Scraper test failed:', error.message);
    }
}

// Performance comparison
async function performanceTest() {
    console.log('\n⚡ Performance Test...\n');
    
    const parser = new SmartFreeParser();
    const longContent = `
    Hunter Updates: Brall damage increased 100 to 120. Shiv speed reduced 500 to 480. Wukong cooldown decreased 8s to 6s.
    Equipment Changes: Relic drop rates increased by 25%. Vault guaranteed drops added. Forge costs reduced 1500 to 1000 Prisma.
    System Updates: Daily quest rewards buffed 100 to 400 Prisma. Arena mode now awards Prisma. Matchmaking improved.
    Bug Fixes: Fixed Beebo exploit. Corrected Void visual issues. Resolved collision problems.
    `.repeat(10); // Simulate larger content
    
    const startTime = Date.now();
    
    try {
        const results = await parser.parse(longContent);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        const totalChanges = Object.values(results).reduce((total, changes) => total + changes.length, 0);
        
        console.log(`⚡ Processed ${longContent.length} characters in ${duration}ms`);
        console.log(`📊 Extracted ${totalChanges} changes`);
        console.log(`🚀 Processing speed: ${Math.round(longContent.length / duration)} chars/ms`);
        
    } catch (error) {
        console.error('❌ Performance test failed:', error.message);
    }
}

// Run all tests
async function runAllTests() {
    await testSmartParser();
    await testWithScraper();
    await performanceTest();
    
    console.log('\n🎉 All tests completed!');
    console.log('\n💡 To use with Hugging Face API (optional):');
    console.log('   1. Get free API token: https://huggingface.co/settings/tokens');
    console.log('   2. Set environment variable: HUGGINGFACE_API_TOKEN=your_token');
    console.log('   3. Re-run the scraper for enhanced AI parsing');
}

// Run tests if called directly
if (require.main === module) {
    runAllTests().catch(console.error);
}

module.exports = { testSmartParser, testWithScraper, performanceTest };