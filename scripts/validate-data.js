// Data Validation Script for patches.json
// Ensures data integrity and proper structure before deployment
// Run with: node scripts/validate-data.js

const fs = require('fs');
const path = require('path');

class DataValidator {
    constructor() {
        this.patchesFile = path.join(__dirname, '..', 'assets', 'data', 'patches.json');
        this.errors = [];
        this.warnings = [];
    }

    // Main validation function
    validate() {
        console.log('🔍 Starting data validation...\n');

        try {
            // Check 1: File exists
            if (!this.checkFileExists()) {
                return this.reportResults();
            }

            // Check 2: Valid JSON
            const data = this.loadAndParseJSON();
            if (!data) {
                return this.reportResults();
            }

            // Check 3: Is array
            if (!this.validateIsArray(data)) {
                return this.reportResults();
            }

            // Check 4: Has patches
            if (!this.validateHasPatches(data)) {
                return this.reportResults();
            }

            // Check 5: Validate each patch structure
            this.validatePatchStructure(data);

            // Check 6: Validate data types
            this.validateDataTypes(data);

            // Check 7: Check for duplicates
            this.checkDuplicates(data);

            // Check 8: Validate dates
            this.validateDates(data);

            // Check 9: Validate URLs
            this.validateURLs(data);

            // Check 10: Check changes structure
            this.validateChanges(data);

            // Report results
            return this.reportResults();

        } catch (error) {
            this.errors.push(`Unexpected error: ${error.message}`);
            return this.reportResults();
        }
    }

    // Check if file exists
    checkFileExists() {
        if (!fs.existsSync(this.patchesFile)) {
            this.errors.push('❌ patches.json file not found');
            return false;
        }
        console.log('✅ File exists');
        return true;
    }

    // Load and parse JSON
    loadAndParseJSON() {
        try {
            const content = fs.readFileSync(this.patchesFile, 'utf8');
            const data = JSON.parse(content);
            console.log('✅ Valid JSON format');
            return data;
        } catch (error) {
            this.errors.push(`❌ Invalid JSON: ${error.message}`);
            return null;
        }
    }

    // Validate data is an array
    validateIsArray(data) {
        if (!Array.isArray(data)) {
            this.errors.push('❌ Data must be an array');
            return false;
        }
        console.log('✅ Data is an array');
        return true;
    }

    // Validate has patches
    validateHasPatches(data) {
        if (data.length === 0) {
            this.warnings.push('⚠️  No patches found in data');
            return true;
        }
        console.log(`✅ Found ${data.length} patches`);
        return true;
    }

    // Validate each patch has required fields
    validatePatchStructure(data) {
        const requiredFields = ['id', 'title', 'date', 'version', 'steamUrl', 'summary', 'changes'];
        const optionalFields = ['rawContent', 'addedAt'];

        data.forEach((patch, index) => {
            const patchNum = index + 1;
            const missingFields = [];

            requiredFields.forEach(field => {
                if (!(field in patch)) {
                    missingFields.push(field);
                }
            });

            if (missingFields.length > 0) {
                this.errors.push(`❌ Patch #${patchNum} missing fields: ${missingFields.join(', ')}`);
            }

            // Check for unexpected fields
            const allFields = [...requiredFields, ...optionalFields];
            const extraFields = Object.keys(patch).filter(key => !allFields.includes(key));
            if (extraFields.length > 0) {
                this.warnings.push(`⚠️  Patch #${patchNum} has unexpected fields: ${extraFields.join(', ')}`);
            }
        });

        if (this.errors.length === 0) {
            console.log('✅ All patches have required fields');
        }
    }

    // Validate data types
    validateDataTypes(data) {
        data.forEach((patch, index) => {
            const patchNum = index + 1;

            // Check string fields
            const stringFields = ['id', 'title', 'date', 'version', 'steamUrl', 'summary'];
            stringFields.forEach(field => {
                if (field in patch && typeof patch[field] !== 'string') {
                    this.errors.push(`❌ Patch #${patchNum}: ${field} must be a string, got ${typeof patch[field]}`);
                }
            });

            // Check object fields
            if ('changes' in patch && typeof patch.changes !== 'object') {
                this.errors.push(`❌ Patch #${patchNum}: changes must be an object`);
            }

            // Check for empty strings
            if (patch.title && patch.title.trim() === '') {
                this.errors.push(`❌ Patch #${patchNum}: title cannot be empty`);
            }
            if (patch.summary && patch.summary.trim() === '') {
                this.warnings.push(`⚠️  Patch #${patchNum}: summary is empty`);
            }
        });

        if (this.errors.length === 0) {
            console.log('✅ All data types are correct');
        }
    }

    // Check for duplicate patches
    checkDuplicates(data) {
        const ids = new Set();
        const titles = new Set();

        data.forEach((patch, index) => {
            const patchNum = index + 1;

            // Check duplicate IDs
            if (ids.has(patch.id)) {
                this.errors.push(`❌ Duplicate ID found: ${patch.id} (Patch #${patchNum})`);
            }
            ids.add(patch.id);

            // Check duplicate titles (warning only)
            if (titles.has(patch.title)) {
                this.warnings.push(`⚠️  Duplicate title found: "${patch.title}" (Patch #${patchNum})`);
            }
            titles.add(patch.title);
        });

        if (this.errors.length === 0) {
            console.log('✅ No duplicate IDs found');
        }
    }

    // Validate dates
    validateDates(data) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        data.forEach((patch, index) => {
            const patchNum = index + 1;

            if (!dateRegex.test(patch.date)) {
                this.errors.push(`❌ Patch #${patchNum}: Invalid date format "${patch.date}" (expected YYYY-MM-DD)`);
            } else {
                // Check if date is valid
                const date = new Date(patch.date);
                if (isNaN(date.getTime())) {
                    this.errors.push(`❌ Patch #${patchNum}: Invalid date "${patch.date}"`);
                }

                // Check if date is in the future
                const now = new Date();
                if (date > now) {
                    this.warnings.push(`⚠️  Patch #${patchNum}: Date "${patch.date}" is in the future`);
                }

                // Check if date is too old (before 2020)
                if (date.getFullYear() < 2020) {
                    this.warnings.push(`⚠️  Patch #${patchNum}: Date "${patch.date}" seems too old`);
                }
            }
        });

        if (this.errors.length === 0) {
            console.log('✅ All dates are valid');
        }
    }

    // Validate URLs
    validateURLs(data) {
        const urlRegex = /^https?:\/\/.+/;

        data.forEach((patch, index) => {
            const patchNum = index + 1;

            if (!urlRegex.test(patch.steamUrl)) {
                this.errors.push(`❌ Patch #${patchNum}: Invalid Steam URL "${patch.steamUrl}"`);
            }

            // Check if it's a Steam URL
            if (patch.steamUrl && !patch.steamUrl.includes('steampowered.com')) {
                this.warnings.push(`⚠️  Patch #${patchNum}: Steam URL doesn't contain steampowered.com`);
            }
        });

        if (this.errors.length === 0) {
            console.log('✅ All URLs are valid');
        }
    }

    // Validate changes structure
    validateChanges(data) {
        const validCategories = ['hunters', 'equipment', 'systems', 'maps', 'modes'];

        data.forEach((patch, index) => {
            const patchNum = index + 1;

            if (!patch.changes) return;

            // Check if changes is an object
            if (typeof patch.changes !== 'object' || Array.isArray(patch.changes)) {
                this.errors.push(`❌ Patch #${patchNum}: changes must be an object`);
                return;
            }

            // Validate categories
            Object.keys(patch.changes).forEach(category => {
                if (!validCategories.includes(category)) {
                    this.warnings.push(`⚠️  Patch #${patchNum}: Unexpected category "${category}"`);
                }

                // Check if category value is an array
                if (!Array.isArray(patch.changes[category])) {
                    this.errors.push(`❌ Patch #${patchNum}: changes.${category} must be an array`);
                    return;
                }

                // Validate each change item
                patch.changes[category].forEach((change, changeIndex) => {
                    if (typeof change !== 'object') {
                        this.errors.push(`❌ Patch #${patchNum}: changes.${category}[${changeIndex}] must be an object`);
                        return;
                    }

                    // Check required fields in change
                    if (!change.description) {
                        this.errors.push(`❌ Patch #${patchNum}: changes.${category}[${changeIndex}] missing description`);
                    }

                    if (!change.type) {
                        this.warnings.push(`⚠️  Patch #${patchNum}: changes.${category}[${changeIndex}] missing type`);
                    }

                    // Validate change types
                    const validTypes = ['buff', 'nerf', 'fix', 'new', 'change', 'rework', 'improvement'];
                    if (change.type && !validTypes.includes(change.type)) {
                        this.warnings.push(`⚠️  Patch #${patchNum}: Unexpected change type "${change.type}"`);
                    }
                });
            });
        });

        if (this.errors.length === 0) {
            console.log('✅ All changes structures are valid');
        }
    }

    // Report validation results
    reportResults() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 VALIDATION RESULTS');
        console.log('='.repeat(60) + '\n');

        if (this.errors.length === 0 && this.warnings.length === 0) {
            console.log('✅ All validation checks passed!\n');
            console.log('🎉 Data is ready for deployment!\n');
            return true;
        }

        // Display errors
        if (this.errors.length > 0) {
            console.log(`🚨 ERRORS (${this.errors.length}):`);
            this.errors.forEach(error => console.log(`   ${error}`));
            console.log('');
        }

        // Display warnings
        if (this.warnings.length > 0) {
            console.log(`⚠️  WARNINGS (${this.warnings.length}):`);
            this.warnings.forEach(warning => console.log(`   ${warning}`));
            console.log('');
        }

        // Summary
        if (this.errors.length > 0) {
            console.log('❌ Validation FAILED - Please fix errors before deployment\n');
            return false;
        } else {
            console.log('⚠️  Validation PASSED with warnings - Review before deployment\n');
            return true;
        }
    }

    // Generate a detailed report
    generateReport() {
        const data = JSON.parse(fs.readFileSync(this.patchesFile, 'utf8'));

        console.log('\n' + '='.repeat(60));
        console.log('📈 DATA STATISTICS');
        console.log('='.repeat(60) + '\n');

        console.log(`Total Patches: ${data.length}`);

        if (data.length > 0) {
            console.log(`Latest Patch: ${data[0].title}`);
            console.log(`Latest Date: ${data[0].date}`);
            console.log(`Oldest Patch: ${data[data.length - 1].title}`);
            console.log(`Oldest Date: ${data[data.length - 1].date}`);

            // Count changes
            let totalChanges = 0;
            const categoryStats = {
                hunters: 0,
                equipment: 0,
                systems: 0,
                maps: 0,
                modes: 0
            };

            data.forEach(patch => {
                if (patch.changes) {
                    Object.keys(patch.changes).forEach(category => {
                        const count = patch.changes[category].length;
                        totalChanges += count;
                        if (categoryStats[category] !== undefined) {
                            categoryStats[category] += count;
                        }
                    });
                }
            });

            console.log(`\nTotal Changes: ${totalChanges}`);
            console.log('\nChanges by Category:');
            Object.entries(categoryStats).forEach(([category, count]) => {
                console.log(`  - ${category}: ${count}`);
            });
        }

        console.log('\n');
    }
}

// Run validation if called directly
if (require.main === module) {
    const validator = new DataValidator();
    const isValid = validator.validate();
    validator.generateReport();

    // Exit with error code if validation failed
    process.exit(isValid ? 0 : 1);
}

module.exports = DataValidator;
