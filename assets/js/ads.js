// Advertisement Management for SUPERPATCH.GG

class AdManager {
    constructor() {
        this.adSpots = new Map();
        this.adProviders = {
            google: 'Google Ads',
            carbon: 'Carbon Ads',
            codefund: 'CodeFund',
            buysellads: 'BuySellAds'
        };
        this.init();
    }

    init() {
        this.registerAdSpots();
        this.setupAdLoading();
        this.setupAdHiding();
    }

    registerAdSpots() {
        document.querySelectorAll('.ad-container').forEach(container => {
            const id = container.id || `ad-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            container.id = id;
            
            const spot = {
                id: id,
                element: container,
                type: this.getAdType(container),
                loaded: false,
                provider: null,
                content: null
            };
            
            this.adSpots.set(id, spot);
        });
    }

    getAdType(container) {
        if (container.classList.contains('ad-banner')) return 'banner';
        if (container.classList.contains('ad-square')) return 'square';
        if (container.classList.contains('ad-sidebar')) return 'sidebar';
        if (container.classList.contains('ad-between-content')) return 'content';
        if (container.classList.contains('ad-footer-banner')) return 'footer';
        return 'generic';
    }

    setupAdLoading() {
        // Simulate ad loading with shimmer effect
        this.adSpots.forEach(spot => {
            if (!spot.loaded) {
                spot.element.classList.add('ad-loading');
                
                // Simulate loading delay
                setTimeout(() => {
                    this.loadAd(spot.id);
                }, Math.random() * 2000 + 1000);
            }
        });
    }

    setupAdHiding() {
        // Respect user preferences for ad visibility
        if (this.shouldHideAds()) {
            this.hideAllAds();
        }
    }

    shouldHideAds() {
        // Check for ad blockers or user preferences
        return window.localStorage.getItem('hideAds') === 'true' ||
               this.detectAdBlocker();
    }

    detectAdBlocker() {
        // Simple ad blocker detection
        try {
            const testAd = document.createElement('div');
            testAd.innerHTML = '&nbsp;';
            testAd.className = 'adsbox';
            testAd.style.cssText = 'position: absolute; left: -10000px;';
            document.body.appendChild(testAd);
            
            const isBlocked = testAd.offsetHeight === 0;
            document.body.removeChild(testAd);
            return isBlocked;
        } catch (e) {
            return false;
        }
    }

    loadAd(adId, provider = 'placeholder', content = null) {
        const spot = this.adSpots.get(adId);
        if (!spot) return;

        spot.element.classList.remove('ad-loading');
        spot.loaded = true;
        spot.provider = provider;

        const contentDiv = spot.element.querySelector('.ad-content');
        if (contentDiv && content) {
            contentDiv.innerHTML = content;
        } else if (contentDiv) {
            // Keep placeholder content for now
            contentDiv.innerHTML = this.getPlaceholderContent(spot.type);
        }

        // Add loaded class for styling
        spot.element.classList.add('ad-loaded');
    }

    getPlaceholderContent(type) {
        const placeholders = {
            banner: 'Banner Ad (728x90)',
            square: 'Square Ad (300x250)',
            sidebar: 'Sidebar Ad (300x600)',
            content: 'Content Ad (300x250)',
            footer: 'Footer Banner (728x90)',
            generic: 'Advertisement'
        };
        return placeholders[type] || 'Advertisement';
    }

    hideAllAds() {
        this.adSpots.forEach(spot => {
            spot.element.style.display = 'none';
        });
    }

    showAllAds() {
        this.adSpots.forEach(spot => {
            spot.element.style.display = 'block';
        });
    }

    // Integration methods for different ad providers

    loadGoogleAds() {
        // Google AdSense integration would go here
        console.log('Loading Google Ads...');
    }

    loadCarbonAds() {
        // Carbon Ads integration would go here
        console.log('Loading Carbon Ads...');
    }

    loadCodeFundAds() {
        // CodeFund integration would go here
        console.log('Loading CodeFund Ads...');
    }

    // Utility methods
    refreshAd(adId) {
        const spot = this.adSpots.get(adId);
        if (spot) {
            spot.loaded = false;
            spot.element.classList.add('ad-loading');
            setTimeout(() => this.loadAd(adId), 1000);
        }
    }

    refreshAllAds() {
        this.adSpots.forEach((spot, id) => {
            this.refreshAd(id);
        });
    }

    getAdStats() {
        const stats = {
            total: this.adSpots.size,
            loaded: 0,
            types: {}
        };

        this.adSpots.forEach(spot => {
            if (spot.loaded) stats.loaded++;
            stats.types[spot.type] = (stats.types[spot.type] || 0) + 1;
        });

        return stats;
    }
}

// Initialize ad manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adManager = new AdManager();
    
    // Expose some methods globally for debugging
    window.refreshAds = () => window.adManager.refreshAllAds();
    window.adStats = () => console.log(window.adManager.getAdStats());
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdManager;
}