// Database functionality for VR experiences - Firestore only
class DatabaseManager {
    constructor() {
        this.vrExperiences = [];
        this.initializeDatabase();
    }

    async initializeDatabase() {
        console.log('Initializing database - fetching from Firestore...');
        
        try {
            // Load VR experiences from Firestore database
            await this.loadFromFirestore();
            
            // Initialize recommendation engine
            if (window.vrRecommendationEngine) {
                window.vrRecommendationEngine.initializeBSTs(this.vrExperiences);
            }
            
            // Display the experiences
            this.displayExperiences();
            
        } catch (error) {
            console.error('Error loading from Firestore:', error);
            this.showError('Failed to load VR experiences from database. Please check your connection.');
        }
    }

    async loadFromFirestore() {
        try {
            // Check if Firestore is available
            if (!window.db) {
                console.warn('Firestore not available, skipping data load');
                return false;
            }
            
            console.log('Fetching VR experiences from Firestore...');
            
            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Firestore request timeout')), 10000)
            );
            
            const firestorePromise = window.db.collection('vrExperiences').get();
            
            const snapshot = await Promise.race([firestorePromise, timeoutPromise]);
            this.vrExperiences = [];
            
            snapshot.forEach((doc) => {
                const data = doc.data();
                this.vrExperiences.push({
                    id: doc.id,
                    ...data
                });
            });
            
            console.log('✅ Loaded', this.vrExperiences.length, 'VR experiences from Firestore');
            return true;
            
        } catch (error) {
            console.warn('⚠️ Could not load from Firestore:', error.message);
            
            // Load sample data as fallback
            console.log('📦 Loading sample VR experiences as fallback...');
            this.loadSampleData();
            return false;
        }
    }
    
    loadSampleData() {
        // Fallback sample data when Firestore is not available
        this.vrExperiences = [
            {
                id: 'sample-1',
                title: 'Virtual Reality Adventure',
                description: 'Explore amazing virtual worlds',
                category: 'Adventure',
                rating: 4.5,
                platform: 'PC VR',
                price: 29.99,
                imageUrl: 'https://via.placeholder.com/300x200?text=VR+Adventure'
            },
            {
                id: 'sample-2', 
                title: 'Space Exploration VR',
                description: 'Journey through the cosmos',
                category: 'Simulation',
                rating: 4.8,
                platform: 'Oculus',
                price: 39.99,
                imageUrl: 'https://via.placeholder.com/300x200?text=Space+VR'
            },
            {
                id: 'sample-3',
                title: 'VR Puzzle Master',
                description: 'Mind-bending puzzle challenges',
                category: 'Puzzle',
                rating: 4.2,
                platform: 'PlayStation VR',
                price: 19.99,
                imageUrl: 'https://via.placeholder.com/300x200?text=Puzzle+VR'
            }
        ];
        console.log('✅ Loaded', this.vrExperiences.length, 'sample VR experiences');
    }

    displayExperiences() {
        console.log('Displaying VR experiences:', this.vrExperiences.length);
        
        // Update the UI to show experiences
        if (window.searchManager) {
            window.searchManager.displayExperiences(this.vrExperiences);
        } else {
            // Fallback display method
            this.fallbackDisplayExperiences();
        }
    }

    fallbackDisplayExperiences() {
        const container = document.getElementById('vrExperiences');
        const noResults = document.getElementById('noResults');
        
        if (!container) return;
        
        if (this.vrExperiences.length === 0) {
            container.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            return;
        }
        
        if (noResults) noResults.classList.add('hidden');
        
        container.innerHTML = this.vrExperiences.map(experience => `
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
        if (window.searchManager && window.searchManager.attachRealMButtonListeners) {
            window.searchManager.attachRealMButtonListeners();
        }
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg font-rajdhani font-semibold bg-red-500/90 border border-red-400 text-white';
        notification.style.backdropFilter = 'blur(10px)';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }

    getAllExperiences() {
        return this.vrExperiences;
    }

    async addUserFavorite(userId, experienceId) {
        try {
            await db.collection('userFavorites').doc(`${userId}_${experienceId}`).set({
                userId: userId,
                experienceId: experienceId,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { success: true };
        } catch (error) {
            console.error('Error adding favorite:', error);
            return { success: false, error: error.message };
        }
    }

    async removeUserFavorite(userId, experienceId) {
        try {
            await db.collection('userFavorites').doc(`${userId}_${experienceId}`).delete();
            return { success: true };
        } catch (error) {
            console.error('Error removing favorite:', error);
            return { success: false, error: error.message };
        }
    }

    async getUserFavorites(userId) {
        try {
            const snapshot = await db.collection('userFavorites')
                .where('userId', '==', userId)
                .get();
            
            const favorites = [];
            snapshot.forEach((doc) => {
                favorites.push(doc.data().experienceId);
            });
            return favorites;
        } catch (error) {
            console.error('Error getting user favorites:', error);
            return [];
        }
    }
}

// Create global database manager instance
window.databaseManager = new DatabaseManager();