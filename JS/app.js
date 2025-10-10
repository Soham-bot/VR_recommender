// Main application logic
class VRRecommenderApp {
    constructor() {
        this.isInitialized = false;
        this.userFavorites = [];
        this.initializeApp();
    }

    async initializeApp() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    async init() {
        try {
            this.updateInitStatus('Initializing UI components...');
            
            // Initialize UI event listeners
            this.initializeEventListeners();
            
            this.updateInitStatus('Connecting to database...');
            
            // Wait for database to initialize
            await this.waitForDatabase();
            
            this.updateInitStatus('Loading VR experiences...');
            
            // Load initial data
            await this.loadInitialData();
            
            this.updateInitStatus('Checking authentication...');
            
            // Check for authentication state and handle redirects
            await this.checkAuthenticationState();
            
            this.updateInitStatus('System ready!');
            
            // Hide init status after a delay
            setTimeout(() => {
                const initStatus = document.getElementById('initStatus');
                if (initStatus) {
                    initStatus.style.display = 'none';
                }
            }, 2000);
            
            this.isInitialized = true;
            console.log('VR Recommender App initialized successfully');
        } catch (error) {
            console.error('Error initializing app:', error);
            this.updateInitStatus('Initialization failed!', true);
            this.showError('Failed to initialize the application. Please refresh the page.');
        }
    }

    updateInitStatus(message, isError = false) {
        const statusElement = document.getElementById('initStatusText');
        if (statusElement) {
            statusElement.textContent = message;
            
            if (isError) {
                const statusContainer = document.getElementById('initStatus');
                if (statusContainer) {
                    statusContainer.className = statusContainer.className.replace('border-neon-blue', 'border-red-500');
                    statusContainer.className = statusContainer.className.replace('text-neon-blue', 'text-red-400');
                }
            }
        }
        console.log('Init Status:', message);
    }

    async checkAuthenticationState() {
        console.log('Checking authentication state...');
        
        // Wait for auth manager to be available
        let attempts = 0;
        while (!window.authManager && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.authManager) {
            console.error('Auth manager not available');
            return;
        }
        
        // Check for redirect result first
        console.log('Checking for Google Sign-In redirect result...');
        const redirectHandled = await window.authManager.handleRedirectResult();
        
        if (redirectHandled) {
            console.log('Redirect result handled successfully');
            await this.loadUserFavorites();
            return;
        }
        
        // Check current user
        const currentUser = window.authManager.getCurrentUser();
        console.log('Current user on init:', currentUser);
        
        if (currentUser) {
            console.log('User already authenticated, loading favorites...');
            await this.loadUserFavorites();
        }
    }

    async waitForDatabase() {
        console.log('Waiting for database initialization...');
        
        // Wait for database manager to be available and initialized
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.databaseManager && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.databaseManager) {
            throw new Error('Database manager not available');
        }

        console.log('Database manager available');

        // Wait for experiences to be loaded
        attempts = 0;
        while (window.databaseManager.getAllExperiences().length === 0 && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        console.log('VR experiences loaded:', window.databaseManager.getAllExperiences().length);

        // Wait for recommendation engine to be available
        attempts = 0;
        while (!window.vrRecommendationEngine && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        if (window.vrRecommendationEngine) {
            console.log('VR Recommendation Engine available');
        } else {
            console.warn('VR Recommendation Engine not available after waiting');
        }
    }

    async loadInitialData() {
        // Load VR experiences into search manager
        const experiences = window.databaseManager.getAllExperiences();
        window.searchManager.setExperiences(experiences);
        
        // Display all experiences initially
        this.displayExperiences(experiences);
        
        // Load user favorites if authenticated
        if (window.authManager.isAuthenticated()) {
            await this.loadUserFavorites();
        }
    }

    async loadUserFavorites() {
        const user = window.authManager.getCurrentUser();
        if (user) {
            this.userFavorites = await window.databaseManager.getUserFavorites(user.uid);
        }
    }

    initializeEventListeners() {
        // Search functionality
        this.initializeSearch();
        
        // Auth buttons
        this.initializeAuthButtons();
        
        // Recommendation functionality
        this.initializeRecommendations();
        
        // Navigation
        this.initializeNavigation();
    }



    initializeSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        const categoryFilter = document.getElementById('categoryFilter');
        const ratingFilter = document.getElementById('ratingFilter');

        // Search button click
        searchBtn.addEventListener('click', () => this.performSearch());

        // Enter key in search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });

        // Filter changes
        categoryFilter.addEventListener('change', () => this.performSearch());
        ratingFilter.addEventListener('change', () => this.performSearch());

        // Real-time search (optional)
        let searchTimeout;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => this.performSearch(), 300);
        });
    }

    initializeAuthButtons() {
        const loginSubmit = document.getElementById('loginSubmit');
        const signupSubmit = document.getElementById('signupSubmit');
        const logoutBtn = document.getElementById('logoutBtn');
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        const googleSignupBtn = document.getElementById('googleSignupBtn');
        const loginEmail = document.getElementById('loginEmail');
        const signupEmail = document.getElementById('signupEmail');

        if (loginSubmit) loginSubmit.addEventListener('click', () => this.handleLogin());
        if (signupSubmit) signupSubmit.addEventListener('click', () => this.handleSignup());
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.handleLogout());
        
        // Google Sign-In buttons
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }
        if (googleSignupBtn) {
            googleSignupBtn.addEventListener('click', () => this.handleGoogleSignIn());
        }

        // Real-time email validation
        if (loginEmail) {
            loginEmail.addEventListener('blur', (e) => this.validateEmailInput(e.target));
            loginEmail.addEventListener('input', (e) => this.clearEmailErrors(e.target));
        }

        if (signupEmail) {
            signupEmail.addEventListener('blur', (e) => this.validateEmailInput(e.target));
            signupEmail.addEventListener('input', (e) => this.clearEmailErrors(e.target));
        }
    }

    validateEmailInput(inputElement) {
        if (!window.emailValidator || !inputElement.value) return;

        const validation = window.emailValidator.validateEmail(inputElement.value);
        const inputGroup = inputElement.closest('.cyber-input-group');
        
        // Remove existing error messages
        const existingError = inputGroup.querySelector('.email-error');
        if (existingError) {
            existingError.remove();
        }

        if (!validation.isValid) {
            // Add error styling
            inputElement.style.borderColor = '#ef4444';
            inputElement.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.3)';
            
            // Add error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'email-error text-red-400 text-xs mt-1 font-rajdhani';
            errorDiv.textContent = validation.errors[0];
            inputGroup.appendChild(errorDiv);
        } else {
            // Add success styling
            inputElement.style.borderColor = '#00ff88';
            inputElement.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
            
            // Check for suggestions
            const suggestions = window.emailValidator.suggestCorrections(inputElement.value);
            if (suggestions.length > 0) {
                const suggestionDiv = document.createElement('div');
                suggestionDiv.className = 'email-suggestion text-yellow-400 text-xs mt-1 font-rajdhani cursor-pointer';
                suggestionDiv.textContent = suggestions[0];
                suggestionDiv.addEventListener('click', () => {
                    const correctedEmail = suggestions[0].split(' ')[3];
                    inputElement.value = correctedEmail;
                    this.validateEmailInput(inputElement);
                });
                inputGroup.appendChild(suggestionDiv);
            }
        }
    }

    clearEmailErrors(inputElement) {
        const inputGroup = inputElement.closest('.cyber-input-group');
        const existingError = inputGroup.querySelector('.email-error');
        const existingSuggestion = inputGroup.querySelector('.email-suggestion');
        
        if (existingError) existingError.remove();
        if (existingSuggestion) existingSuggestion.remove();
        
        // Reset styling
        inputElement.style.borderColor = '';
        inputElement.style.boxShadow = '';
    }



    performSearch() {
        if (!this.isInitialized) return;

        const searchTerm = document.getElementById('searchInput').value;
        const category = document.getElementById('categoryFilter').value;
        const minRating = document.getElementById('ratingFilter').value;

        this.showLoading(true);

        // Simulate search delay for better UX
        setTimeout(() => {
            const results = window.searchManager.search(searchTerm, category, minRating);
            this.displayExperiences(results);
            this.showLoading(false);
        }, 300);
    }

    displayExperiences(experiences) {
        const container = document.getElementById('vrExperiences');
        const noResults = document.getElementById('noResults');

        if (experiences.length === 0) {
            container.innerHTML = '';
            noResults.style.display = 'block';
            return;
        }

        noResults.style.display = 'none';
        container.innerHTML = experiences.map(exp => this.createExperienceCard(exp)).join('');
    }

    createExperienceCard(experience) {
        const stars = '★'.repeat(Math.floor(experience.rating)) + 
                     '☆'.repeat(5 - Math.floor(experience.rating));
        
        const priceText = experience.price === 0 ? 'Free' : `$${experience.price}`;
        
        return `
            <div class="vr-card" data-id="${experience.id}">
                <h3>${experience.title}</h3>
                <div class="category">${experience.category.toUpperCase()}</div>
                <div class="description">${experience.description}</div>
                <div class="rating">
                    <span class="stars">${stars}</span>
                    <span class="rating-text">${experience.rating}/5</span>
                </div>
                <div class="price">${priceText}</div>
                <div class="platform">${experience.platform}</div>
                ${this.createFavoriteButton(experience.id)}
            </div>
        `;
    }

    createFavoriteButton(experienceId) {
        if (!window.authManager.isAuthenticated()) {
            return '<button class="btn btn-secondary" onclick="app.showLoginPrompt()">Login to Favorite</button>';
        }

        const isFavorite = this.userFavorites.includes(experienceId);
        const buttonText = isFavorite ? 'Remove Favorite' : 'Add Favorite';
        const buttonClass = isFavorite ? 'btn-danger' : 'btn-primary';
        
        return `<button class="btn ${buttonClass}" onclick="app.toggleFavorite('${experienceId}')">${buttonText}</button>`;
    }

    async toggleFavorite(experienceId) {
        const user = window.authManager.getCurrentUser();
        if (!user) return;

        const isFavorite = this.userFavorites.includes(experienceId);
        
        if (isFavorite) {
            const result = await window.databaseManager.removeUserFavorite(user.uid, experienceId);
            if (result.success) {
                this.userFavorites = this.userFavorites.filter(id => id !== experienceId);
                this.showSuccess('Removed from favorites');
            }
        } else {
            const result = await window.databaseManager.addUserFavorite(user.uid, experienceId);
            if (result.success) {
                this.userFavorites.push(experienceId);
                this.showSuccess('Added to favorites');
            }
        }

        // Refresh display
        this.performSearch();
    }

    showLoginPrompt() {
        alert('Sign in to save favorites and get personalized recommendations!');
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        spinner.style.display = show ? 'block' : 'none';
    }

    initializeRecommendations() {
        console.log('Initializing recommendations...');
        
        const recommendBtn = document.getElementById('recommendBtn');
        const generateBtn = document.getElementById('generateRecommendations');
        const backBtn = document.getElementById('backToPreferences');

        if (!recommendBtn) {
            console.log('Recommend button not found - skipping recommendation initialization');
            return;
        }

        if (!generateBtn) {
            console.log('Generate button not found - partial recommendation initialization');
        }

        if (!backBtn) {
            console.log('Back button not found - partial recommendation initialization');
        }

        recommendBtn.addEventListener('click', () => {
            console.log('Recommend button clicked');
            this.showRecommendModal();
        });
        
        generateBtn.addEventListener('click', () => {
            console.log('Generate button clicked');
            this.generateRecommendations();
        });
        
        backBtn.addEventListener('click', () => {
            console.log('Back button clicked');
            this.showPreferenceForm();
        });

        // Global close recommendation modal function
        window.closeRecommendModal = () => {
            console.log('Closing recommendation modal');
            document.getElementById('recommendModal').classList.add('hidden');
        };

        console.log('Recommendations initialized successfully');
        
        // Test recommendation system after a delay
        setTimeout(() => {
            this.testRecommendationSystem();
        }, 2000);
    }

    testRecommendationSystem() {
        console.log('Testing recommendation system...');
        
        if (!window.vrRecommendationEngine) {
            console.error('VR Recommendation Engine not available for testing');
            return;
        }

        if (!window.vrRecommendationEngine.initialized) {
            console.error('VR Recommendation Engine not initialized for testing');
            return;
        }

        // Test with sample preferences
        const testPreferences = {
            ageGroup: 'young-adult',
            primaryInterest: 'gaming',
            vrIntensity: 'moderate',
            sessionDuration: 'medium',
            experienceLevel: 'intermediate',
            motionSensitivity: 'low'
        };

        try {
            const testRecommendations = window.vrRecommendationEngine.generateRecommendations(testPreferences);
            console.log('Test recommendations generated:', testRecommendations.length, 'results');
            console.log('Sample recommendation:', testRecommendations[0]);
        } catch (error) {
            console.error('Error testing recommendation system:', error);
        }
    }

    initializeNavigation() {
        const exploreBtn = document.getElementById('exploreBtn');
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                // Scroll to explore section
                const exploreSection = document.getElementById('exploreSection');
                if (exploreSection) {
                    exploreSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        } else {
            console.log('Explore button not found - skipping navigation initialization');
        }
    }

    showRecommendModal() {
        console.log('Showing recommendation modal...');
        
        const modal = document.getElementById('recommendModal');
        const preferenceForm = document.getElementById('preferenceForm');
        const recommendationsDisplay = document.getElementById('recommendationsDisplay');
        
        if (!modal) {
            console.error('Recommendation modal not found');
            return;
        }

        if (!preferenceForm) {
            console.error('Preference form not found');
            return;
        }

        if (!recommendationsDisplay) {
            console.error('Recommendations display not found');
            return;
        }
        
        modal.classList.remove('hidden');
        preferenceForm.classList.remove('hidden');
        recommendationsDisplay.classList.add('hidden');
        
        // Reset form
        this.resetPreferenceForm();
        
        console.log('Recommendation modal shown successfully');
    }

    resetPreferenceForm() {
        document.getElementById('ageGroup').value = '';
        document.getElementById('primaryInterest').value = '';
        document.getElementById('vrIntensity').value = '';
        document.getElementById('sessionDuration').value = '';
        document.getElementById('experienceLevel').value = '';
        document.getElementById('motionSensitivity').value = '';
    }

    showPreferenceForm() {
        const preferenceForm = document.getElementById('preferenceForm');
        const recommendationsDisplay = document.getElementById('recommendationsDisplay');
        
        preferenceForm.classList.remove('hidden');
        recommendationsDisplay.classList.add('hidden');
    }

    generateRecommendations() {
        console.log('Generate recommendations called');
        
        // Check if recommendation engine is available
        if (!window.vrRecommendationEngine) {
            console.error('VR Recommendation Engine not available');
            this.showError('Recommendation system not initialized. Please refresh the page.');
            return;
        }

        if (!window.vrRecommendationEngine.initialized) {
            console.error('VR Recommendation Engine not initialized');
            this.showError('Recommendation system still loading. Please try again in a moment.');
            return;
        }

        // Collect user preferences
        const preferences = {
            ageGroup: document.getElementById('ageGroup').value,
            primaryInterest: document.getElementById('primaryInterest').value,
            vrIntensity: document.getElementById('vrIntensity').value,
            sessionDuration: document.getElementById('sessionDuration').value,
            experienceLevel: document.getElementById('experienceLevel').value,
            motionSensitivity: document.getElementById('motionSensitivity').value
        };

        console.log('User preferences:', preferences);

        // Validate that at least some preferences are selected
        const hasPreferences = Object.values(preferences).some(value => value !== '');
        if (!hasPreferences) {
            this.showError('Please select at least one preference to generate recommendations');
            return;
        }

        try {
            // Generate recommendations using BST engine
            const recommendations = window.vrRecommendationEngine.generateRecommendations(preferences);
            console.log('Generated recommendations:', recommendations);
            
            if (recommendations.length === 0) {
                // Fallback: Get top-rated experiences if no matches found
                console.log('No specific matches found, showing top-rated experiences');
                const allExperiences = window.databaseManager.getAllExperiences();
                const topRated = allExperiences
                    .sort((a, b) => b.rating - a.rating)
                    .slice(0, 6)
                    .map(exp => ({
                        ...exp,
                        matchScore: exp.rating * 2,
                        matchPercentage: Math.round((exp.rating / 5) * 100)
                    }));
                
                this.displayRecommendations(topRated, preferences);
                this.showSuccess('No perfect matches found, but here are some highly-rated VR experiences!');
            } else {
                // Display personalized recommendations
                this.displayRecommendations(recommendations, preferences);
                this.showSuccess(`🎯 Found ${recommendations.length} personalized VR experiences tailored to your preferences!`);
            }
            
            // Switch to recommendations view
            const preferenceForm = document.getElementById('preferenceForm');
            const recommendationsDisplay = document.getElementById('recommendationsDisplay');
            
            preferenceForm.classList.add('hidden');
            recommendationsDisplay.classList.remove('hidden');
        } catch (error) {
            console.error('Error generating recommendations:', error);
            
            // Ultimate fallback: Show all experiences
            const allExperiences = window.databaseManager.getAllExperiences();
            if (allExperiences.length > 0) {
                const fallbackRecommendations = allExperiences.slice(0, 6).map(exp => ({
                    ...exp,
                    matchScore: exp.rating * 2,
                    matchPercentage: 75
                }));
                
                this.displayRecommendations(fallbackRecommendations, preferences);
                this.showError('Using fallback recommendations. System will be optimized soon!');
                
                const preferenceForm = document.getElementById('preferenceForm');
                const recommendationsDisplay = document.getElementById('recommendationsDisplay');
                
                preferenceForm.classList.add('hidden');
                recommendationsDisplay.classList.remove('hidden');
            } else {
                this.showError('No VR experiences available. Please check your database connection.');
            }
        }
    }

    displayRecommendations(recommendations, preferences) {
        const container = document.getElementById('recommendationsList');
        
        container.innerHTML = recommendations.map(exp => {
            const explanation = window.vrRecommendationEngine.getRecommendationExplanation(exp, preferences);
            return this.createRecommendationCard(exp, explanation);
        }).join('');

        // Re-initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    createRecommendationCard(experience, explanation) {
        const stars = '★'.repeat(Math.floor(experience.rating)) + 
                     '☆'.repeat(5 - Math.floor(experience.rating));
        
        const priceText = experience.price === 0 ? 'FREE' : `$${experience.price}`;
        
        // Get category icon based on primary interest or category
        const categoryIcon = this.getCategoryIcon(experience.primary_interest || experience.category);
        
        // Check if this is a real VR experience with purchase links
        const isRealExperience = experience.isRealExperience || experience.store_url;
        
        return `
            <div class="cyber-panel p-4 hover:border-neon-blue transition-all duration-300">
                <div class="flex items-start gap-4">
                    <div class="w-16 h-16 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="${categoryIcon}" class="w-8 h-8 text-white"></i>
                    </div>
                    <div class="flex-1">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-orbitron font-bold text-lg text-neon-blue">${experience.title}</h3>
                            <div class="flex items-center gap-2">
                                <span class="text-yellow-400">${stars}</span>
                                <span class="text-gray-400 text-sm">${experience.rating}/5</span>
                                ${experience.matchPercentage ? `<span class="px-2 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-bold">${experience.matchPercentage}% MATCH</span>` : ''}
                                ${isRealExperience ? '<span class="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-bold">REAL</span>' : ''}
                            </div>
                        </div>
                        
                        <div class="flex items-center gap-2 mb-2 flex-wrap">
                            <span class="px-2 py-1 bg-gradient-to-r from-neon-pink to-neon-purple rounded-full text-xs font-bold text-white">
                                ${(experience.primary_interest || experience.category).toUpperCase()}
                            </span>
                            <span class="text-neon-green font-orbitron font-bold">${priceText}</span>
                            ${experience.matchPercentage ? `<span class="px-2 py-1 bg-neon-green/20 text-neon-green rounded-full text-xs font-bold">${experience.matchPercentage}% MATCH</span>` : ''}
                            ${experience.vr_intensity ? `<span class="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-bold">${experience.vr_intensity}</span>` : ''}
                            ${experience.estimated_calories_burned > 0 ? `<span class="px-2 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold">${experience.estimated_calories_burned} CAL</span>` : ''}
                        </div>
                        
                        <p class="text-gray-300 text-sm mb-3 font-rajdhani">${experience.description}</p>
                        
                        ${experience.developer ? `<p class="text-gray-400 text-xs mb-2 font-rajdhani">Developer: ${experience.developer}</p>` : ''}
                        ${experience.platform ? `<p class="text-gray-400 text-xs mb-3 font-rajdhani">Platforms: ${experience.platform}</p>` : ''}
                        
                        <div class="mb-3">
                            <div class="bg-neon-blue/10 border border-neon-blue/30 rounded-lg p-3 mb-2">
                                <p class="text-neon-blue text-sm font-rajdhani">
                                    <i data-lucide="brain" class="w-4 h-4 inline mr-2"></i>
                                    <strong>AI Analysis:</strong> ${explanation}
                                </p>
                            </div>
                            ${experience.safety_tips ? `<p class="text-yellow-400 text-xs font-rajdhani mt-1"><i data-lucide="shield-alert" class="w-3 h-3 inline mr-1"></i>${experience.safety_tips}</p>` : ''}
                        </div>
                        
                        <div class="flex gap-2">
                            ${this.createFavoriteButton(experience.id)}
                            ${this.createActionButton(experience)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    createActionButton(experience) {
        if (experience.store_url) {
            // Real VR experience with direct purchase link
            return `<button class="cyber-btn cyber-btn-primary text-xs px-3 py-1 flex-1" onclick="app.openVRStore('${experience.store_url}')">
                        <i data-lucide="shopping-cart" class="w-3 h-3 mr-1"></i>
                        ${experience.price === 0 ? 'GET FREE' : 'BUY NOW'}
                    </button>`;
        } else if (experience.isRealExperience) {
            // Real experience without direct link - search for it
            return `<button class="cyber-btn cyber-btn-secondary text-xs px-3 py-1 flex-1" onclick="app.searchForVR('${experience.title}')">
                        <i data-lucide="search" class="w-3 h-3 mr-1"></i>
                        FIND & BUY
                    </button>`;
        } else {
            // Demo experience
            return `<button class="cyber-btn cyber-btn-secondary text-xs px-3 py-1 flex-1">
                        <i data-lucide="play" class="w-3 h-3 mr-1"></i>
                        DEMO ONLY
                    </button>`;
        }
    }

    openVRStore(storeUrl) {
        // Open the VR store page in a new tab
        window.open(storeUrl, '_blank', 'noopener,noreferrer');
        
        // Track the action
        console.log('User clicked to purchase VR experience:', storeUrl);
        this.showSuccess('Opening VR store page...');
    }

    searchForVR(title) {
        // Create search URLs for multiple platforms
        const searchQuery = encodeURIComponent(title + ' VR');
        const platforms = {
            steam: `https://store.steampowered.com/search/?term=${searchQuery}&category1=998`,
            oculus: `https://www.oculus.com/experiences/quest/?search=${searchQuery}`,
            psvr: `https://store.playstation.com/search/${searchQuery}`,
            general: `https://www.google.com/search?q=${searchQuery}+buy+download`
        };

        // Show platform selection modal
        this.showPlatformSelection(platforms, title);
    }

    showPlatformSelection(platforms, title) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm';
        modal.innerHTML = `
            <div class="cyber-modal max-w-md w-full mx-4">
                <h3 class="font-orbitron font-bold text-xl text-neon-blue mb-4">Find "${title}" on:</h3>
                <div class="space-y-3">
                    <button class="cyber-btn cyber-btn-primary w-full" onclick="window.open('${platforms.steam}', '_blank'); document.body.removeChild(this.closest('.fixed'))">
                        <i data-lucide="monitor" class="w-4 h-4 mr-2"></i>
                        Steam VR Store
                    </button>
                    <button class="cyber-btn cyber-btn-secondary w-full" onclick="window.open('${platforms.oculus}', '_blank'); document.body.removeChild(this.closest('.fixed'))">
                        <i data-lucide="glasses" class="w-4 h-4 mr-2"></i>
                        Oculus Store
                    </button>
                    <button class="cyber-btn cyber-btn-secondary w-full" onclick="window.open('${platforms.psvr}', '_blank'); document.body.removeChild(this.closest('.fixed'))">
                        <i data-lucide="gamepad-2" class="w-4 h-4 mr-2"></i>
                        PlayStation Store
                    </button>
                    <button class="cyber-btn cyber-btn-secondary w-full" onclick="window.open('${platforms.general}', '_blank'); document.body.removeChild(this.closest('.fixed'))">
                        <i data-lucide="search" class="w-4 h-4 mr-2"></i>
                        Search All Platforms
                    </button>
                </div>
                <button class="cyber-btn cyber-btn-danger w-full mt-4" onclick="document.body.removeChild(this.closest('.fixed'))">
                    <i data-lucide="x" class="w-4 h-4 mr-2"></i>
                    Cancel
                </button>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Re-initialize Lucide icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    getCategoryIcon(category) {
        const iconMap = {
            'Adventure & Action': 'mountain',
            'Education & Exploration': 'book-open',
            'Relaxation & Meditation': 'flower',
            'Art & Creativity': 'palette',
            'Sports & Fitness': 'dumbbell',
            'Horror & Thriller': 'ghost',
            'Sci-Fi & Space': 'rocket',
            'Music & Rhythm': 'music',
            'adventure': 'mountain',
            'education': 'book-open',
            'relaxation': 'flower',
            'creativity': 'palette',
            'fitness': 'dumbbell',
            'horror': 'ghost',
            'simulation': 'rocket',
            'gaming': 'gamepad-2',
            'entertainment': 'play'
        };
        
        return iconMap[category] || 'zap';
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showError('Please enter your email and password');
            return;
        }

        // Basic email format validation
        if (window.emailValidator) {
            const emailValidation = window.emailValidator.validateEmail(email);
            if (!emailValidation.isValid) {
                this.showError('Please enter a valid email address');
                return;
            }
        }

        // Show loading state
        const loginBtn = document.getElementById('loginSubmit');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>SIGNING IN...';
        loginBtn.disabled = true;

        try {
            const result = await window.authManager.signIn(email, password);
            if (result.success) {
                document.getElementById('authModal').classList.add('hidden');
                this.showSuccess('Successfully logged in!');
                await this.loadUserFavorites();
                
                // Check if email is verified
                if (result.user && !result.user.emailVerified) {
                    this.showNotification('Please verify your email address for full access.', 'warning');
                }
            } else {
                // Handle specific Firebase errors
                let errorMessage = result.error;
                if (result.error.includes('user-not-found')) {
                    errorMessage = 'No account found with this email. Please sign up first.';
                } else if (result.error.includes('wrong-password')) {
                    errorMessage = 'Incorrect password. Please try again.';
                } else if (result.error.includes('invalid-email')) {
                    errorMessage = 'Please enter a valid email address.';
                } else if (result.error.includes('too-many-requests')) {
                    errorMessage = 'Too many failed attempts. Please try again later.';
                }
                this.showError(errorMessage);
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('Login failed. Please try again.');
        } finally {
            // Reset button state
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    async handleSignup() {
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;

        if (!email || !password) {
            this.showError('Please complete registration with valid email and password');
            return;
        }

        // Advanced email validation
        if (window.emailValidator) {
            const emailValidation = window.emailValidator.validateEmail(email);
            
            if (!emailValidation.isValid) {
                this.showError(emailValidation.errors[0]);
                if (emailValidation.suggestions.length > 0) {
                    setTimeout(() => {
                        this.showNotification(emailValidation.suggestions[0], 'info');
                    }, 1000);
                }
                return;
            }

            // Check for email suggestions
            const suggestions = window.emailValidator.suggestCorrections(email);
            if (suggestions.length > 0) {
                const useCorrection = confirm(`${suggestions[0]}\n\nClick OK to use the suggested email, or Cancel to continue with your original email.`);
                if (useCorrection) {
                    const correctedEmail = suggestions[0].split(' ')[3]; // Extract email from suggestion
                    document.getElementById('signupEmail').value = correctedEmail;
                    return; // Let user review the correction
                }
            }
        }

        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }

        // Show loading state
        const signupBtn = document.getElementById('signupSubmit');
        const originalText = signupBtn.innerHTML;
        signupBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>CREATING ACCOUNT...';
        signupBtn.disabled = true;

        try {
            const result = await window.authManager.signUp(email, password);
            if (result.success) {
                document.getElementById('authModal').classList.add('hidden');
                this.showSuccess('Account created successfully! Please check your email for verification.');
                
                // Send email verification
                if (result.user && !result.user.emailVerified) {
                    await result.user.sendEmailVerification();
                    this.showNotification('Verification email sent. Please check your inbox.', 'info');
                }
            } else {
                // Handle specific Firebase errors
                let errorMessage = result.error;
                if (result.error.includes('email-already-in-use')) {
                    errorMessage = 'This email is already registered. Try logging in instead.';
                } else if (result.error.includes('invalid-email')) {
                    errorMessage = 'Please enter a valid email address.';
                } else if (result.error.includes('weak-password')) {
                    errorMessage = 'Password is too weak. Please use at least 6 characters.';
                }
                this.showError(errorMessage);
            }
        } catch (error) {
            console.error('Signup error:', error);
            this.showError('Registration failed. Please try again.');
        } finally {
            // Reset button state
            signupBtn.innerHTML = originalText;
            signupBtn.disabled = false;
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    async handleGoogleSignIn() {
        console.log('handleGoogleSignIn called');
        
        try {
            // Show loading state on both Google buttons
            const googleLoginBtn = document.getElementById('googleLoginBtn');
            const googleSignupBtn = document.getElementById('googleSignupBtn');
            
            if (googleLoginBtn) {
                googleLoginBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>CONNECTING TO GOOGLE...';
                googleLoginBtn.disabled = true;
            }
            if (googleSignupBtn) {
                googleSignupBtn.innerHTML = '<i data-lucide="loader" class="w-4 h-4 mr-2 animate-spin"></i>CONNECTING TO GOOGLE...';
                googleSignupBtn.disabled = true;
            }

            console.log('Calling authManager.signInWithGoogle()...');
            const result = await window.authManager.signInWithGoogle();
            console.log('Google Sign-In result:', result);
            
            if (result.success) {
                console.log('Google Sign-In successful');
                
                // Close auth modal
                const authModal = document.getElementById('authModal');
                if (authModal) {
                    authModal.classList.add('hidden');
                }
                
                // Handle redirect case
                if (result.redirect) {
                    console.log('Redirect initiated, waiting for redirect result...');
                    this.showSuccess('Redirecting to Google Sign-In...');
                    return;
                }
                
                // Handle successful popup sign-in
                if (result.user) {
                    console.log('User signed in:', result.user);
                    
                    if (result.isNewUser) {
                        this.showSuccess(`Welcome to VOID.exe! Account created with ${result.user.email}`);
                    } else {
                        this.showSuccess(`Welcome back, ${result.user.displayName || result.user.email}!`);
                    }
                    
                    // Load user favorites
                    await this.loadUserFavorites();
                    
                    // Refresh the current view to show favorite buttons
                    this.performSearch();
                    
                    // Show additional info for new Google users
                    if (result.isNewUser) {
                        setTimeout(() => {
                            this.showSuccess('Your Google account is now linked. Enjoy exploring VR experiences!');
                        }, 1500);
                    }
                }
            } else {
                console.error('Google Sign-In failed:', result.error);
                this.showError(result.error || 'Google Sign-In failed. Please try again.');
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            this.showError('Google Sign-In failed. Please try again.');
        } finally {
            // Reset button states
            const googleLoginBtn = document.getElementById('googleLoginBtn');
            const googleSignupBtn = document.getElementById('googleSignupBtn');
            
            if (googleLoginBtn) {
                googleLoginBtn.innerHTML = `
                    <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    CONTINUE WITH GOOGLE
                `;
                googleLoginBtn.disabled = false;
            }
            
            if (googleSignupBtn) {
                googleSignupBtn.innerHTML = `
                    <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24">
                        <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    SIGN UP WITH GOOGLE
                `;
                googleSignupBtn.disabled = false;
            }
            
            if (window.lucide) {
                window.lucide.createIcons();
            }
        }
    }

    async handleLogout() {
        const result = await window.authManager.signOut();
        if (result.success) {
            this.userFavorites = [];
            this.showSuccess('Successfully logged out!');
        } else {
            this.showError(result.error);
        }
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const noResults = document.getElementById('noResults');
        const vrGrid = document.getElementById('vrExperiences');
        
        if (show) {
            spinner.classList.remove('hidden');
            noResults.classList.add('hidden');
            vrGrid.innerHTML = '';
        } else {
            spinner.classList.add('hidden');
        }
    }

    displayExperiences(experiences) {
        const container = document.getElementById('vrExperiences');
        const noResults = document.getElementById('noResults');

        if (experiences.length === 0) {
            container.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }

        noResults.classList.add('hidden');
        container.innerHTML = experiences.map(exp => this.createExperienceCard(exp)).join('');
        
        // Re-initialize Lucide icons for new content
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    createExperienceCard(experience) {
        const stars = '★'.repeat(Math.floor(experience.rating)) + 
                     '☆'.repeat(5 - Math.floor(experience.rating));
        
        const priceText = experience.price === 0 ? 'FREE ACCESS' : `${experience.price} CREDITS`;
        
        return `
            <div class="vr-card animate-fade-in" data-id="${experience.id}">
                <h3 class="vr-card-title">${experience.title}</h3>
                <div class="vr-card-category">${experience.category}</div>
                <div class="vr-card-description">${experience.description}</div>
                <div class="vr-card-rating">
                    <span class="vr-card-stars">${stars}</span>
                    <span class="text-gray-400 font-rajdhani font-semibold">${experience.rating}/5</span>
                </div>
                <div class="vr-card-price">${priceText}</div>
                <div class="vr-card-platform">${experience.platform}</div>
                <div class="flex gap-2 mt-4">
                    ${this.createFavoriteButton(experience.id)}
                    ${this.createEnterRealmButton(experience)}
                </div>
            </div>
        `;
    }

    createFavoriteButton(experienceId) {
        if (!window.authManager.isAuthenticated()) {
            return `<button class="cyber-btn cyber-btn-primary flex-1" onclick="app.showLoginPrompt()">
                        <i data-lucide="log-in" class="w-4 h-4 mr-2"></i>
                        NEURAL LINK REQUIRED
                    </button>`;
        }

        const isFavorite = this.userFavorites.includes(experienceId);
        const buttonText = isFavorite ? 'REMOVE FROM FAVORITES' : 'ADD TO FAVORITES';
        const buttonClass = isFavorite ? 'cyber-btn-danger' : 'cyber-btn-primary';
        const icon = isFavorite ? 'heart-off' : 'heart';
        
        return `<button class="cyber-btn ${buttonClass} flex-1" onclick="app.toggleFavorite('${experienceId}')">
                    <i data-lucide="${icon}" class="w-4 h-4 mr-2"></i>
                    ${buttonText}
                </button>`;
    }

    createEnterRealmButton(experience) {
        // Priority: Official store URL > Video URL > Search
        if (experience.officialUrl && experience.officialUrl.trim() !== '') {
            // Has official store URL - prioritize this
            const buttonText = this.getStoreButtonText(experience.officialUrl);
            return `<button class="cyber-btn cyber-btn-secondary flex-1" onclick="app.enterRealm('${experience.officialUrl}', '${experience.title}', 'store')">
                        <i data-lucide="shopping-cart" class="w-4 h-4 mr-2"></i>
                        ${buttonText}
                    </button>`;
        } else if (experience.videoUrl && experience.videoUrl.trim() !== '') {
            // No store URL but has video - show video instead
            return `<button class="cyber-btn cyber-btn-secondary flex-1" onclick="app.enterRealm('${experience.videoUrl}', '${experience.title}', 'video')">
                        <i data-lucide="play" class="w-4 h-4 mr-2"></i>
                        WATCH TRAILER
                    </button>`;
        } else {
            // No URLs available - search fallback
            return `<button class="cyber-btn cyber-btn-secondary flex-1 opacity-50" onclick="app.searchForExperience('${experience.title}')">
                        <i data-lucide="search" class="w-4 h-4 mr-2"></i>
                        FIND REALM
                    </button>`;
        }
    }

    getStoreButtonText(url) {
        // Determine button text based on the store URL
        if (url.includes('oculus.com') || url.includes('meta.com')) {
            return 'GET ON META';
        } else if (url.includes('store.steampowered.com')) {
            return 'GET ON STEAM';
        } else if (url.includes('store.playstation.com')) {
            return 'GET ON PLAYSTATION';
        } else if (url.includes('microsoft.com') || url.includes('xbox.com')) {
            return 'GET ON XBOX';
        } else if (url.includes('apple.com') || url.includes('appstore')) {
            return 'GET ON APP STORE';
        } else if (url.includes('play.google.com')) {
            return 'GET ON GOOGLE PLAY';
        } else {
            return 'ENTER REALM';
        }
    }

    showLoginPrompt() {
        alert('Sign in to save favorites and get personalized recommendations!');
    }

    async toggleFavorite(experienceId) {
        const user = window.authManager.getCurrentUser();
        if (!user) return;

        const isFavorite = this.userFavorites.includes(experienceId);
        
        if (isFavorite) {
            const result = await window.databaseManager.removeUserFavorite(user.uid, experienceId);
            if (result.success) {
                this.userFavorites = this.userFavorites.filter(id => id !== experienceId);
                this.showSuccess('Realm removed from neural favorites');
            }
        } else {
            const result = await window.databaseManager.addUserFavorite(user.uid, experienceId);
            if (result.success) {
                this.userFavorites.push(experienceId);
                this.showSuccess('Realm added to neural favorites');
            }
        }

        // Refresh display
        this.performSearch();
    }

    enterRealm(url, title, type = 'store') {
        // Validate URL
        if (!url || url.trim() === '') {
            this.showError('No URL available for this experience');
            return;
        }

        // Add protocol if missing
        let finalUrl = url.trim();
        if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
            finalUrl = 'https://' + finalUrl;
        }

        // Different messages based on type
        let confirmMessage, successMessage;
        if (type === 'video') {
            confirmMessage = `🎬 LOADING TRAILER FOR: ${title}\n\nYou will be redirected to watch the video. Continue?`;
            successMessage = `Loading trailer for ${title}`;
        } else {
            const storeName = this.getStoreName(finalUrl);
            confirmMessage = `🛒 REDIRECTING TO ${storeName}: ${title}\n\nYou will be redirected to the official store. Continue?`;
            successMessage = `Redirecting to ${storeName} for ${title}`;
        }

        // Show confirmation with appropriate message
        const confirmed = confirm(confirmMessage);
        
        if (confirmed) {
            try {
                // Open in new tab for better user experience
                window.open(finalUrl, '_blank', 'noopener,noreferrer');
                this.showSuccess(successMessage);
            } catch (error) {
                console.error('Error opening URL:', error);
                this.showError('Failed to open link. Please try again.');
            }
        }
    }

    getStoreName(url) {
        // Determine store name from URL
        if (url.includes('oculus.com') || url.includes('meta.com')) {
            return 'META STORE';
        } else if (url.includes('store.steampowered.com')) {
            return 'STEAM STORE';
        } else if (url.includes('store.playstation.com')) {
            return 'PLAYSTATION STORE';
        } else if (url.includes('microsoft.com') || url.includes('xbox.com')) {
            return 'XBOX STORE';
        } else if (url.includes('youtube.com')) {
            return 'YOUTUBE';
        } else {
            return 'OFFICIAL SITE';
        }
    }

    searchForExperience(title) {
        // If no official URL is available, perform a web search
        const searchQuery = encodeURIComponent(`${title} VR experience buy download`);
        const searchUrl = `https://www.google.com/search?q=${searchQuery}`;
        
        const confirmed = confirm(`🔍 NO DIRECT LINK AVAILABLE\n\nSearching the web for: ${title}\n\nThis will open a Google search. Continue?`);
        
        if (confirmed) {
            try {
                window.open(searchUrl, '_blank', 'noopener,noreferrer');
                this.showSuccess(`Searching for ${title} across the digital realm`);
            } catch (error) {
                console.error('Error opening search:', error);
                this.showError('Search protocol failed. Please try again.');
            }
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type) {
        // Create notification element
        const notification = document.createElement('div');
        let bgClass, borderClass;
        
        switch(type) {
            case 'error':
                bgClass = 'bg-red-500/90';
                borderClass = 'border-red-400';
                break;
            case 'warning':
                bgClass = 'bg-yellow-500/90';
                borderClass = 'border-yellow-400';
                break;
            case 'info':
                bgClass = 'bg-blue-500/90';
                borderClass = 'border-blue-400';
                break;
            default:
                bgClass = 'bg-green-500/90';
                borderClass = 'border-green-400';
        }
        
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg font-rajdhani font-semibold animate-slide-in ${bgClass} border ${borderClass} text-white`;
        notification.style.backdropFilter = 'blur(10px)';
        notification.textContent = message;

        // Add to DOM
        document.body.appendChild(notification);

        // Remove after 4 seconds for info/warning, 3 for others
        const duration = (type === 'info' || type === 'warning') ? 4000 : 3000;
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }
}

// Initialize the app with error handling
try {
    console.log('Creating VRRecommenderApp instance...');
    window.app = new VRRecommenderApp();
    console.log('VRRecommenderApp instance created successfully');
} catch (error) {
    console.error('Failed to create VRRecommenderApp instance:', error);
    
    // Show user-friendly error message
    document.addEventListener('DOMContentLoaded', () => {
        const body = document.body;
        const errorDiv = document.createElement('div');
        errorDiv.className = 'fixed inset-0 bg-red-900/90 flex items-center justify-center z-50';
        errorDiv.innerHTML = `
            <div class="bg-black border border-red-500 rounded-lg p-8 max-w-md mx-4 text-center">
                <h2 class="text-red-400 font-orbitron font-bold text-xl mb-4">SYSTEM ERROR</h2>
                <p class="text-gray-300 font-rajdhani mb-4">Failed to initialize VOID.exe</p>
                <button onclick="location.reload()" class="cyber-btn cyber-btn-danger">
                    RESTART SYSTEM
                </button>
            </div>
        `;
        body.appendChild(errorDiv);
    });
}