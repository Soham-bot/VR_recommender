// Search functionality with Linear Search algorithm implementation
class SearchManager {
    constructor() {
        this.experiences = [];
        this.filteredExperiences = [];
    }

    setExperiences(experiences) {
        this.experiences = experiences;
        this.filteredExperiences = experiences;
    }

    // Linear Search Algorithm Implementation
    linearSearch(array, searchTerm, searchFields = ['title', 'description', 'tags']) {
        const results = [];
        const term = searchTerm.toLowerCase().trim();
        
        if (!term) {
            return array; // Return all if no search term
        }

        // Linear search through each item in the array
        for (let i = 0; i < array.length; i++) {
            const item = array[i];
            let found = false;

            // Search through specified fields
            for (let j = 0; j < searchFields.length && !found; j++) {
                const field = searchFields[j];
                
                if (item[field]) {
                    if (Array.isArray(item[field])) {
                        // Search in array fields (like tags)
                        for (let k = 0; k < item[field].length; k++) {
                            if (item[field][k].toLowerCase().includes(term)) {
                                found = true;
                                break;
                            }
                        }
                    } else if (typeof item[field] === 'string') {
                        // Search in string fields
                        if (item[field].toLowerCase().includes(term)) {
                            found = true;
                        }
                    }
                }
            }

            if (found) {
                results.push(item);
            }
        }

        return results;
    }

    // Filter by category
    filterByCategory(experiences, category) {
        if (!category) return experiences;
        
        const filtered = [];
        for (let i = 0; i < experiences.length; i++) {
            if (experiences[i].category === category) {
                filtered.push(experiences[i]);
            }
        }
        return filtered;
    }

    // Filter by minimum rating
    filterByRating(experiences, minRating) {
        if (!minRating) return experiences;
        
        const filtered = [];
        const rating = parseFloat(minRating);
        
        for (let i = 0; i < experiences.length; i++) {
            if (experiences[i].rating >= rating) {
                filtered.push(experiences[i]);
            }
        }
        return filtered;
    }

    // Sort experiences by different criteria
    sortExperiences(experiences, sortBy = 'rating') {
        const sorted = [...experiences];
        
        switch (sortBy) {
            case 'rating':
                // Bubble sort by rating (descending)
                for (let i = 0; i < sorted.length - 1; i++) {
                    for (let j = 0; j < sorted.length - i - 1; j++) {
                        if (sorted[j].rating < sorted[j + 1].rating) {
                            // Swap elements
                            const temp = sorted[j];
                            sorted[j] = sorted[j + 1];
                            sorted[j + 1] = temp;
                        }
                    }
                }
                break;
            case 'price':
                // Sort by price (ascending)
                for (let i = 0; i < sorted.length - 1; i++) {
                    for (let j = 0; j < sorted.length - i - 1; j++) {
                        if (sorted[j].price > sorted[j + 1].price) {
                            const temp = sorted[j];
                            sorted[j] = sorted[j + 1];
                            sorted[j + 1] = temp;
                        }
                    }
                }
                break;
            case 'title':
                // Sort alphabetically by title
                for (let i = 0; i < sorted.length - 1; i++) {
                    for (let j = 0; j < sorted.length - i - 1; j++) {
                        if (sorted[j].title.toLowerCase() > sorted[j + 1].title.toLowerCase()) {
                            const temp = sorted[j];
                            sorted[j] = sorted[j + 1];
                            sorted[j + 1] = temp;
                        }
                    }
                }
                break;
        }
        
        return sorted;
    }

    // Main search function that combines all filters
    search(searchTerm, category = '', minRating = '', sortBy = 'rating') {
        let results = this.experiences;

        // Apply linear search
        results = this.linearSearch(results, searchTerm);

        // Apply category filter
        results = this.filterByCategory(results, category);

        // Apply rating filter
        results = this.filterByRating(results, minRating);

        // Sort results
        results = this.sortExperiences(results, sortBy);

        this.filteredExperiences = results;
        return results;
    }

    // Get search suggestions based on partial input
    getSuggestions(partialTerm, maxSuggestions = 5) {
        const suggestions = new Set();
        const term = partialTerm.toLowerCase().trim();
        
        if (!term || term.length < 2) return [];

        // Linear search for suggestions
        for (let i = 0; i < this.experiences.length && suggestions.size < maxSuggestions; i++) {
            const experience = this.experiences[i];
            
            // Check title
            if (experience.title.toLowerCase().includes(term)) {
                suggestions.add(experience.title);
            }
            
            // Check tags
            if (experience.tags) {
                for (let j = 0; j < experience.tags.length && suggestions.size < maxSuggestions; j++) {
                    if (experience.tags[j].toLowerCase().includes(term)) {
                        suggestions.add(experience.tags[j]);
                    }
                }
            }
        }

        return Array.from(suggestions);
    }

    // Get recommendations based on user preferences
    getRecommendations(userFavorites = [], maxRecommendations = 6) {
        if (userFavorites.length === 0) {
            // Return top-rated experiences if no favorites
            return this.sortExperiences(this.experiences, 'rating').slice(0, maxRecommendations);
        }

        const recommendations = [];
        const favoriteCategories = new Set();
        const favoriteTags = new Set();

        // Analyze user favorites to find preferred categories and tags
        for (let i = 0; i < userFavorites.length; i++) {
            const favoriteId = userFavorites[i];
            for (let j = 0; j < this.experiences.length; j++) {
                const experience = this.experiences[j];
                if (experience.id === favoriteId) {
                    favoriteCategories.add(experience.category);
                    if (experience.tags) {
                        experience.tags.forEach(tag => favoriteTags.add(tag));
                    }
                    break;
                }
            }
        }

        // Score experiences based on similarity to favorites
        const scoredExperiences = [];
        for (let i = 0; i < this.experiences.length; i++) {
            const experience = this.experiences[i];
            
            // Skip if already in favorites
            if (userFavorites.includes(experience.id)) continue;

            let score = 0;
            
            // Category match
            if (favoriteCategories.has(experience.category)) {
                score += 3;
            }
            
            // Tag matches
            if (experience.tags) {
                for (let j = 0; j < experience.tags.length; j++) {
                    if (favoriteTags.has(experience.tags[j])) {
                        score += 1;
                    }
                }
            }
            
            // Rating bonus
            score += experience.rating;

            scoredExperiences.push({ experience, score });
        }

        // Sort by score (descending) using bubble sort
        for (let i = 0; i < scoredExperiences.length - 1; i++) {
            for (let j = 0; j < scoredExperiences.length - i - 1; j++) {
                if (scoredExperiences[j].score < scoredExperiences[j + 1].score) {
                    const temp = scoredExperiences[j];
                    scoredExperiences[j] = scoredExperiences[j + 1];
                    scoredExperiences[j + 1] = temp;
                }
            }
        }

        // Extract top recommendations
        for (let i = 0; i < Math.min(maxRecommendations, scoredExperiences.length); i++) {
            recommendations.push(scoredExperiences[i].experience);
        }

        return recommendations;
    }

    getFilteredExperiences() {
        return this.filteredExperiences;
    }

    // Display experiences in the UI
    displayExperiences(experiences) {
        console.log('Displaying VR experiences:', experiences.length);
        
        const container = document.getElementById('vrExperiences');
        const noResults = document.getElementById('noResults');
        const loadingSpinner = document.getElementById('loadingSpinner');
        
        if (!container) {
            console.error('VR experiences container not found');
            return;
        }
        
        // Hide loading spinner
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
        
        if (experiences.length === 0) {
            container.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            return;
        }
        
        if (noResults) noResults.classList.add('hidden');
        
        container.innerHTML = experiences.map(experience => `
            <div class="cyber-card group">
                <div class="relative overflow-hidden rounded-lg mb-4">
                    <img src="${experience.imageUrl || 'https://images.unsplash.com/photo-1592478411213-6153e4ebc696?w=400&h=225&fit=crop'}" 
                         alt="${experience.title}" 
                         class="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div class="absolute top-4 right-4">
                        <span class="cyber-badge">${experience.category}</span>
                    </div>
                    <div class="absolute bottom-4 left-4 right-4">
                        <div class="flex items-center gap-2 text-neon-green">
                            <i data-lucide="star" class="w-4 h-4 fill-current"></i>
                            <span class="font-rajdhani font-semibold">${experience.rating}</span>
                        </div>
                    </div>
                </div>
                
                <div class="p-6">
                    <h3 class="font-orbitron font-bold text-xl text-white mb-2 group-hover:text-neon-blue transition-colors">
                        ${experience.title}
                    </h3>
                    <p class="text-gray-400 font-rajdhani mb-4 line-clamp-2">
                        ${experience.description}
                    </p>
                    
                    <div class="flex items-center justify-between mb-4">
                        <span class="text-neon-pink font-orbitron font-bold text-lg">
                            ${experience.price === 0 ? 'FREE' : `$${experience.price}`}
                        </span>
                        <div class="flex gap-2">
                            ${experience.tags ? experience.tags.slice(0, 2).map(tag => 
                                `<span class="cyber-tag">${tag}</span>`
                            ).join('') : ''}
                        </div>
                    </div>
                    
                    <div class="flex gap-3">
                        <button class="cyber-btn cyber-btn-primary flex-1">
                            <i data-lucide="play" class="w-4 h-4 mr-2"></i>
                            LAUNCH
                        </button>
                        ${experience.officialUrl ? `
                        <button class="cyber-btn cyber-btn-accent real-m-btn" 
                                data-official-url="${experience.officialUrl}"
                                data-experience-title="${experience.title}"
                                title="Visit official website for ${experience.title}">
                            <i data-lucide="external-link" class="w-4 h-4 mr-2"></i>
                            REAL M
                        </button>
                        ` : ''}
                        <button class="cyber-btn cyber-btn-secondary">
                            <i data-lucide="heart" class="w-4 h-4"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Re-initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
        
        // Add event listeners for "Real M" buttons
        this.attachRealMButtonListeners();
        
        // Update the search manager's experiences
        this.setExperiences(experiences);
    }

    // Handle "Real M" button clicks for external website navigation
    attachRealMButtonListeners() {
        const realMButtons = document.querySelectorAll('.real-m-btn');
        
        realMButtons.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                
                const officialUrl = button.getAttribute('data-official-url');
                const experienceTitle = button.getAttribute('data-experience-title');
                
                if (officialUrl) {
                    // Validate URL format
                    if (this.isValidUrl(officialUrl)) {
                        // Log for analytics/debugging
                        console.log(`Redirecting to official site for: ${experienceTitle}`);
                        console.log(`URL: ${officialUrl}`);
                        
                        // Open in new tab for better UX
                        window.open(officialUrl, '_blank', 'noopener,noreferrer');
                    } else {
                        console.error('Invalid URL format:', officialUrl);
                        alert('Sorry, the official website link appears to be invalid.');
                    }
                } else {
                    console.error('No official URL found for experience:', experienceTitle);
                    alert('Official website not available for this experience.');
                }
            });
        });
        
        console.log(`Attached event listeners to ${realMButtons.length} "Real M" buttons`);
    }

    // URL validation helper
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }
}

// Create global search manager instance
window.searchManager = new SearchManager();