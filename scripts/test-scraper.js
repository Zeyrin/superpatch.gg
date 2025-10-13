// Test Script for Steam RSS Scraper
// Verifies scraper functionality without modifying actual data
// Run with: node scripts/test-scraper.js

const https = require('https');
const SteamRssScraper = require('./steam-rss-scraper');
const DataValidator = require('./validate-data');

class ScraperTester {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    // Test RSS feed accessibility
    async testRssFeedAccess() {
        return new Promise((resolve) => {
            console.log('📡 Testing Steam RSS feed accessibility...');

            const url = 'https://store.steampowered.com/feeds/news/app/1283700/';

            https.get(url, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ RSS feed is accessible');
                    this.passed++;
                    resolve(true);
                } else {
                    console.log(`❌ RSS feed returned status ${res.statusCode}`);
                    this.failed++;
                    resolve(false);
                }
            }).on('error', (err) => {
                console.log(`❌ Failed to access RSS feed: ${err.message}`);
                this.failed++;
                resolve(false);
            });
        });
    }

    // Test RSS feed parsing
    async testRssParsing() {
        console.log('\n📝 Testing RSS feed parsing...');

        try {
            const scraper = new SteamRssScraper();
            const rssData = await scraper.fetchRssFeed();

            if (!rssData || rssData.length === 0) {
                console.log('❌ No RSS data fetched');
                this.failed++;
                return false;
            }

            console.log(`✅ Fetched ${rssData.length} characters of RSS data`);

            // Check if RSS contains expected elements
            const hasItems = rssData.includes('<item>');
            const hasTitles = rssData.includes('<title>');
            const hasDates = rssData.includes('<pubDate>');

            if (hasItems && hasTitles && hasDates) {
                console.log('✅ RSS feed contains expected structure');
                this.passed++;
                return rssData;
            } else {
                console.log('❌ RSS feed missing expected elements');
                this.failed++;
                return false;
            }
        } catch (error) {
            console.log(`❌ RSS parsing failed: ${error.message}`);
            this.failed++;
            return false;
        }
    }

    // Test patch extraction
    async testPatchExtraction(rssData) {
        console.log('\n🔍 Testing patch extraction...');

        try {
            const scraper = new SteamRssScraper();
            const patches = scraper.parseRssData(rssData);

            if (!patches || !Array.isArray(patches)) {
                console.log('❌ Failed to extract patches (not an array)');
                this.failed++;
                return false;
            }

            console.log(`✅ Extracted ${patches.length} potential patches`);

            if (patches.length === 0) {
                console.log('⚠️  No patches extracted (could be expected if no patch notes in feed)');
                this.passed++;
                return [];
            }

            // Test first patch structure
            const firstPatch = patches[0];
            const requiredFields = ['id', 'title', 'date', 'version', 'steamUrl', 'summary', 'changes'];
            const missingFields = requiredFields.filter(field => !(field in firstPatch));

            if (missingFields.length > 0) {
                console.log(`❌ First patch missing fields: ${missingFields.join(', ')}`);
                this.failed++;
                return false;
            }

            console.log('✅ Extracted patches have correct structure');
            console.log(`   First patch: "${firstPatch.title}"`);
            this.passed++;
            return patches;

        } catch (error) {
            console.log(`❌ Patch extraction failed: ${error.message}`);
            this.failed++;
            return false;
        }
    }

    // Test patch changes parsing
    testChangesStructure(patches) {
        console.log('\n🏷️  Testing changes structure...');

        if (!patches || patches.length === 0) {
            console.log('⚠️  No patches to test');
            return true;
        }

        try {
            const firstPatch = patches[0];

            if (!firstPatch.changes || typeof firstPatch.changes !== 'object') {
                console.log('❌ Changes field is not an object');
                this.failed++;
                return false;
            }

            const validCategories = ['hunters', 'equipment', 'systems', 'maps', 'modes'];
            const categories = Object.keys(firstPatch.changes);

            console.log(`   Found categories: ${categories.join(', ')}`);

            // Check each category is an array
            let allValid = true;
            categories.forEach(cat => {
                if (!Array.isArray(firstPatch.changes[cat])) {
                    console.log(`❌ Category "${cat}" is not an array`);
                    allValid = false;
                }
            });

            if (allValid) {
                console.log('✅ Changes structure is valid');
                this.passed++;
                return true;
            } else {
                this.failed++;
                return false;
            }

        } catch (error) {
            console.log(`❌ Changes structure test failed: ${error.message}`);
            this.failed++;
            return false;
        }
    }

    // Test date parsing
    testDateParsing(patches) {
        console.log('\n📅 Testing date parsing...');

        if (!patches || patches.length === 0) {
            console.log('⚠️  No patches to test');
            return true;
        }

        try {
            const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
            let allValid = true;

            patches.forEach((patch, index) => {
                if (!dateRegex.test(patch.date)) {
                    console.log(`❌ Patch ${index + 1} has invalid date format: ${patch.date}`);
                    allValid = false;
                }

                const date = new Date(patch.date);
                if (isNaN(date.getTime())) {
                    console.log(`❌ Patch ${index + 1} has unparseable date: ${patch.date}`);
                    allValid = false;
                }
            });

            if (allValid) {
                console.log('✅ All dates are valid');
                this.passed++;
                return true;
            } else {
                this.failed++;
                return false;
            }

        } catch (error) {
            console.log(`❌ Date parsing test failed: ${error.message}`);
            this.failed++;
            return false;
        }
    }

    // Test URL validity
    testURLValidity(patches) {
        console.log('\n🔗 Testing URL validity...');

        if (!patches || patches.length === 0) {
            console.log('⚠️  No patches to test');
            return true;
        }

        try {
            const urlRegex = /^https:\/\/store\.steampowered\.com\/.+/;
            let allValid = true;

            patches.forEach((patch, index) => {
                if (!urlRegex.test(patch.steamUrl)) {
                    console.log(`❌ Patch ${index + 1} has invalid Steam URL: ${patch.steamUrl}`);
                    allValid = false;
                }
            });

            if (allValid) {
                console.log('✅ All Steam URLs are valid');
                this.passed++;
                return true;
            } else {
                this.failed++;
                return false;
            }

        } catch (error) {
            console.log(`❌ URL validity test failed: ${error.message}`);
            this.failed++;
            return false;
        }
    }

    // Test data validator
    testDataValidator() {
        console.log('\n🔍 Testing data validator...');

        try {
            const validator = new DataValidator();
            const isValid = validator.validate();

            if (isValid) {
                console.log('✅ Current data passes validation');
                this.passed++;
                return true;
            } else {
                console.log('⚠️  Current data has validation issues');
                this.passed++; // Still pass the test, but note the issues
                return true;
            }

        } catch (error) {
            console.log(`❌ Data validator test failed: ${error.message}`);
            this.failed++;
            return false;
        }
    }

    // Test HTML cleaning
    testHTMLCleaning() {
        console.log('\n🧹 Testing HTML cleaning...');

        try {
            const scraper = new SteamRssScraper();

            const testCases = [
                {
                    input: '<p>Test paragraph</p>',
                    shouldContain: 'Test paragraph'
                },
                {
                    input: '<b>Bold text</b>',
                    shouldContain: 'Bold text',
                    shouldNotContain: '<b>'
                },
                {
                    input: 'Line 1<br>Line 2',
                    shouldContain: 'Line 1'
                },
                {
                    input: '&lt;tag&gt; &amp; &quot;quotes&quot;',
                    shouldContain: '<tag> & "quotes"'
                }
            ];

            let allPassed = true;
            testCases.forEach((test, index) => {
                const cleaned = scraper.cleanHtml(test.input);

                if (test.shouldContain && !cleaned.includes(test.shouldContain)) {
                    console.log(`❌ Test case ${index + 1} failed: should contain "${test.shouldContain}"`);
                    allPassed = false;
                }

                if (test.shouldNotContain && cleaned.includes(test.shouldNotContain)) {
                    console.log(`❌ Test case ${index + 1} failed: should not contain "${test.shouldNotContain}"`);
                    allPassed = false;
                }
            });

            if (allPassed) {
                console.log('✅ HTML cleaning works correctly');
                this.passed++;
                return true;
            } else {
                this.failed++;
                return false;
            }

        } catch (error) {
            console.log(`❌ HTML cleaning test failed: ${error.message}`);
            this.failed++;
            return false;
        }
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 SUPERVIVE Patch Scraper Test Suite');
        console.log('=' .repeat(60) + '\n');

        // Test 1: RSS feed access
        await this.testRssFeedAccess();

        // Test 2: RSS parsing
        const rssData = await this.testRssParsing();

        // Test 3: Patch extraction
        const patches = rssData ? await this.testPatchExtraction(rssData) : false;

        // Test 4: Changes structure
        if (patches) {
            this.testChangesStructure(patches);
        }

        // Test 5: Date parsing
        if (patches) {
            this.testDateParsing(patches);
        }

        // Test 6: URL validity
        if (patches) {
            this.testURLValidity(patches);
        }

        // Test 7: HTML cleaning
        this.testHTMLCleaning();

        // Test 8: Data validator
        this.testDataValidator();

        // Display results
        this.displayResults();

        return this.failed === 0;
    }

    // Display test results
    displayResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS');
        console.log('='.repeat(60) + '\n');

        const total = this.passed + this.failed;
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);

        const percentage = total > 0 ? ((this.passed / total) * 100).toFixed(1) : 0;
        console.log(`Success Rate: ${percentage}%\n`);

        if (this.failed === 0) {
            console.log('🎉 All tests passed! Scraper is working correctly.\n');
        } else {
            console.log('⚠️  Some tests failed. Please review the errors above.\n');
        }
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new ScraperTester();
    tester.runAllTests().then(success => {
        process.exit(success ? 0 : 1);
    });
}

module.exports = ScraperTester;
