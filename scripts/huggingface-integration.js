// Optional Hugging Face API integration for complex patch parsing
// Requires free API token from https://huggingface.co/settings/tokens

class HuggingFaceEnhancer {
    constructor(apiToken = null) {
        this.apiToken = apiToken || process.env.HUGGINGFACE_API_TOKEN;
        this.baseUrl = 'https://api-inference.huggingface.co';
        this.maxRetries = 3;
        this.enabled = !!this.apiToken;
        
        if (!this.enabled) {
            console.log('⚠️  Hugging Face API token not provided - running in offline mode');
        }
    }
    
    // Enhance patch parsing with AI when patterns aren't clear
    async enhanceParsing(content, fallbackResults) {
        if (!this.enabled) {
            return fallbackResults;
        }
        
        try {
            console.log('🤖 Enhancing with Hugging Face API...');
            
            // Use text classification to improve categorization
            const enhanced = await this.classifyContent(content);
            
            // Merge AI results with regex results
            return this.mergeResults(fallbackResults, enhanced);
            
        } catch (error) {
            console.log('⚠️  Hugging Face API failed, using fallback:', error.message);
            return fallbackResults;
        }
    }
    
    // Classify content using Hugging Face models
    async classifyContent(content) {
        const chunks = this.splitContent(content);
        const results = { hunters: [], equipment: [], systems: [], maps: [], modes: [] };
        
        for (const chunk of chunks) {
            try {
                // Use BART for summarization/extraction
                const summary = await this.summarizeText(chunk);
                
                // Use classification model for categorization
                const category = await this.classifyText(chunk);
                
                if (summary && category) {
                    if (!results[category]) results[category] = [];
                    results[category].push({
                        description: summary,
                        type: this.inferChangeType(chunk),
                        source: 'ai'
                    });
                }
                
                // Rate limiting - wait between requests
                await this.wait(200);
                
            } catch (error) {
                console.log(`⚠️  Failed to process chunk: ${error.message}`);
                continue;
            }
        }
        
        return results;
    }
    
    // Summarize text using BART model
    async summarizeText(text) {
        if (text.length < 50) return text; // Too short to summarize
        
        const response = await this.makeRequest('/models/facebook/bart-large-cnn', {
            inputs: text,
            parameters: {
                max_length: 100,
                min_length: 20,
                do_sample: false
            }
        });
        
        return response?.[0]?.summary_text || null;
    }
    
    // Classify text into game categories
    async classifyText(text) {
        const labels = ['hunters', 'equipment', 'systems', 'maps', 'modes'];
        
        const response = await this.makeRequest('/models/facebook/bart-large-mnli', {
            inputs: text,
            parameters: {
                candidate_labels: labels
            }
        });
        
        // Return highest confidence label
        if (response?.labels?.[0]) {
            return response.labels[0];
        }
        
        return 'systems'; // Default fallback
    }
    
    // Make API request with error handling and retries
    async makeRequest(endpoint, payload, retries = 0) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Handle model loading
            if (data.error && data.error.includes('loading') && retries < this.maxRetries) {
                console.log('🔄 Model loading, waiting...');
                await this.wait(2000);
                return this.makeRequest(endpoint, payload, retries + 1);
            }
            
            return data;
            
        } catch (error) {
            if (retries < this.maxRetries) {
                await this.wait(1000);
                return this.makeRequest(endpoint, payload, retries + 1);
            }
            throw error;
        }
    }
    
    // Helper functions
    splitContent(content) {
        // Split content into manageable chunks for API
        const sentences = content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
        const chunks = [];
        let currentChunk = '';
        
        for (const sentence of sentences) {
            if (currentChunk.length + sentence.length < 500) {
                currentChunk += sentence + '. ';
            } else {
                if (currentChunk) chunks.push(currentChunk.trim());
                currentChunk = sentence + '. ';
            }
        }
        
        if (currentChunk) chunks.push(currentChunk.trim());
        return chunks.slice(0, 10); // Limit to 10 chunks for free tier
    }
    
    inferChangeType(text) {
        const lower = text.toLowerCase();
        if (/fix|bug|correct|resolve/i.test(text)) return 'fix';
        if (/increas|buff|improv|enhanc|boost/i.test(text)) return 'buff';
        if (/decreas|nerf|reduc|lower|weak/i.test(text)) return 'nerf';
        if (/new|add|introduc/i.test(text)) return 'new';
        return 'change';
    }
    
    mergeResults(regexResults, aiResults) {
        const merged = { ...regexResults };
        
        // Merge AI results with regex results
        Object.entries(aiResults).forEach(([category, changes]) => {
            if (!merged[category]) merged[category] = [];
            
            // Add AI results that don't duplicate regex results
            changes.forEach(change => {
                const isDuplicate = merged[category].some(existing => 
                    this.similarity(existing.description, change.description) > 0.7
                );
                
                if (!isDuplicate) {
                    merged[category].push(change);
                }
            });
        });
        
        return merged;
    }
    
    similarity(str1, str2) {
        // Simple similarity check
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
    }
    
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = HuggingFaceEnhancer;