// SUPERVIVE Patch Notes - Shared Utilities

// Navigation utilities
function setActiveNavLink(currentPage) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === currentPage || 
            (currentPage === 'index.html' && link.getAttribute('href') === './')) {
            link.classList.add('active');
        }
    });
}

// Date formatting
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Hunter role colors
function getHunterRoleColor(role) {
    const roleColors = {
        'fighter': 'var(--hunter-fighter)',
        'initiator': 'var(--hunter-initiator)',
        'frontliner': 'var(--hunter-frontliner)',
        'protector': 'var(--hunter-protector)',
        'controller': 'var(--hunter-controller)'
    };
    return roleColors[role] || 'var(--text-secondary)';
}

// Loading state management
function showLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = '<div class="loading">Loading...</div>';
    }
}

function hideLoading(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        const loading = container.querySelector('.loading');
        if (loading) {
            loading.remove();
        }
    }
}

// Enhanced image error handling with better placeholders
function handleImageError(img, hunterName) {
    img.style.display = 'none';
    let placeholder = img.nextElementSibling;
    
    // Create placeholder if it doesn't exist
    if (!placeholder || (!placeholder.classList.contains('hunter-image-placeholder') && !placeholder.classList.contains('hunter-portrait-placeholder'))) {
        placeholder = document.createElement('div');
        placeholder.className = img.className.includes('hunter-portrait') ? 'hunter-portrait-placeholder' : 'hunter-image-placeholder';
        placeholder.style.cssText = img.style.cssText;
        img.parentNode.insertBefore(placeholder, img.nextSibling);
    }
    
    placeholder.style.display = 'flex';
    placeholder.textContent = hunterName.substring(0, 2).toUpperCase();
}

// Smooth scroll to element
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }
}

// URL parameter utilities
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Local storage utilities
function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save to localStorage:', error);
    }
}

function getFromLocalStorage(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Failed to get from localStorage:', error);
        return null;
    }
}

// Search functionality
function searchContent(searchTerm, items, searchFields) {
    const term = searchTerm.toLowerCase();
    return items.filter(item => {
        return searchFields.some(field => {
            const value = getNestedProperty(item, field);
            return value && value.toString().toLowerCase().includes(term);
        });
    });
}

function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current && current[key], obj);
}

// Initialize page
function initializePage() {
    // Set current page as active in navigation
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    setActiveNavLink(currentPage);
    
    // Add click handlers for navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            // Allow normal navigation
            const href = this.getAttribute('href');
            if (href && href !== '#') {
                // Let the browser handle navigation
                return true;
            }
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage);

// Cross-page navigation with search
function navigateWithSearch(page, searchTerm) {
    const url = new URL(page, window.location.origin);
    if (searchTerm) {
        url.searchParams.set('search', searchTerm);
    }
    window.location.href = url.toString();
}


// Global search functionality
function initGlobalSearch() {
    // Add global search shortcut (Ctrl+K)
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-input, #searchInput, #hunterSearch');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
    });
}

// Setup search clear functionality
function setupSearchClear(inputSelector, clearCallback) {
    const searchInput = document.querySelector(inputSelector);
    if (!searchInput) return;

    // Wrap the input in a container if not already wrapped
    let wrapper = searchInput.parentElement;
    if (!wrapper.classList.contains('search-wrapper')) {
        wrapper = document.createElement('div');
        wrapper.className = 'search-wrapper';
        wrapper.style.cssText = 'flex: 1; position: relative; display: flex; align-items: center;';
        searchInput.parentNode.insertBefore(wrapper, searchInput);
        wrapper.appendChild(searchInput);
    }

    // Create clear button
    const clearButton = document.createElement('button');
    clearButton.className = 'search-clear';
    clearButton.innerHTML = '×';
    clearButton.setAttribute('aria-label', 'Clear search');
    clearButton.title = 'Clear search';
    
    // Add clear button to wrapper
    wrapper.appendChild(clearButton);

    // Show/hide clear button based on input content
    function toggleClearButton() {
        if (searchInput.value.trim().length > 0) {
            clearButton.classList.add('visible');
        } else {
            clearButton.classList.remove('visible');
        }
    }

    // Event listeners
    searchInput.addEventListener('input', toggleClearButton);
    searchInput.addEventListener('focus', toggleClearButton);
    
    clearButton.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = '';
        clearButton.classList.remove('visible');
        searchInput.focus();
        
        // Trigger input event to update search results
        const inputEvent = new Event('input', { bubbles: true });
        searchInput.dispatchEvent(inputEvent);
        
        // Call custom callback if provided
        if (clearCallback) {
            clearCallback();
        }
    });

    // Initial check
    toggleClearButton();
}

// Hunter role mapping for consistent colors
const HUNTER_ROLES = {
    'fighter': { color: 'var(--hunter-fighter)', count: 6 },
    'controller': { color: 'var(--hunter-controller)', count: 7 },
    'protector': { color: 'var(--hunter-protector)', count: 5 },
    'frontliner': { color: 'var(--hunter-frontliner)', count: 2 },
    'initiator': { color: 'var(--hunter-initiator)', count: 2 }
};

function getHunterRoleInfo(role) {
    return HUNTER_ROLES[role] || { color: 'var(--text-secondary)', count: 0 };
}

// Export for use in other files
window.SuperviveUtils = {
    setActiveNavLink,
    formatDate,
    getHunterRoleColor,
    getHunterRoleInfo,
    showLoading,
    hideLoading,
    handleImageError,
    scrollToElement,
    getUrlParameter,
    saveToLocalStorage,
    getFromLocalStorage,
    searchContent,
    navigateWithSearch,
    initGlobalSearch,
    setupSearchClear,
    initializePage,
    HUNTER_ROLES
};