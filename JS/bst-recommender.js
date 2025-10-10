// Binary Search Tree-based VR Experience Recommendation System

// BST Node class
class BSTNode {
    constructor(experience, key) {
        this.experience = experience;
        this.key = key; // The attribute we're sorting by (e.g., rating, duration, intensity)
        this.left = null;
        this.right = null;
    }
}

// Binary Search Tree class
class BST {
    constructor() {
        this.root = null;
    }

    // Insert a new experience into the BST
    insert(experience, key) {
        const newNode = new BSTNode(experience, key);
        
        if (this.root === null) {
            this.root = newNode;
        } else {
            this.insertNode(this.root, newNode);
        }
    }

    insertNode(node, newNode) {
        if (newNode.key < node.key) {
            if (node.left === null) {
                node.left = newNode;
            } else {
                this.insertNode(node.left, newNode);
            }
        } else {
            if (node.right === null) {
                node.right = newNode;
            } else {
                this.insertNode(node.right, newNode);
            }
        }
    }

    // Search for experiences within a range
    searchRange(minKey, maxKey) {
        const results = [];
        this.searchRangeHelper(this.root, minKey, maxKey, results);
        return results;
    }

    searchRangeHelper(node, minKey, maxKey, results) {
        if (node === null) return;

        // If current node's key is in range, add to results
        if (node.key >= minKey && node.key <= maxKey) {
            results.push(node.experience);
        }

        // Recursively search left subtree if needed
        if (node.key > minKey) {
            this.searchRangeHelper(node.left, minKey, maxKey, results);
        }

        // Recursively search right subtree if needed
        if (node.key < maxKey) {
            this.searchRangeHelper(node.right, minKey, maxKey, results);
        }
    }

    // Get all experiences (in-order traversal)
    getAllExperiences() {
        const results = [];
        this.inOrderTraversal(this.root, results);
        return results;
    }

    inOrderTraversal(node, results) {
        if (node !== null) {
            this.inOrderTraversal(node.left, results);
            results.push(node.experience);
            this.inOrderTraversal(node.right, results);
        }
    }

    // Search for exact matches
    search(key) {
        return this.searchNode(this.root, key);
    }

    searchNode(node, key) {
        if (node === null) return null;

        if (key === node.key) {
            return node.experience;
        } else if (key < node.key) {
            return this.searchNode(node.left, key);
        } else {
            return this.searchNode(node.right, key);
        }
    }
}

// VR Experience Recommendation Engine
class VRRecommendationEngine {
    constructor() {
        this.ratingBST = new BST();
        this.durationBST = new BST();
        this.intensityBST = new BST();
        this.experiences = [];
        this.initialized = false;
    }

    // Initialize BSTs with VR experiences
    initializeBSTs(experiences) {
        console.log('BST Engine: Initializing with', experiences.length, 'experiences');
        
        this.experiences = experiences;
        
        // Clear existing BSTs
        this.ratingBST = new BST();
        this.durationBST = new BST();
        this.intensityBST = new BST();

        // Add enhanced attributes to experiences
        const enhancedExperiences = experiences.map(exp => this.enhanceExperience(exp));
        console.log('BST Engine: Enhanced experiences:', enhancedExperiences);

        // Build BSTs based on different attributes
        enhancedExperiences.forEach(experience => {
            // Rating BST (sorted by rating)
            this.ratingBST.insert(experience, experience.rating);
            
            // Duration BST (sorted by duration score)
            this.durationBST.insert(experience, experience.durationScore);
            
            // Intensity BST (sorted by intensity score)
            this.intensityBST.insert(experience, experience.intensityScore);
        });

        this.initialized = true;
        console.log('BST Engine: Initialization complete with', enhancedExperiences.length, 'experiences');
    }

    // Enhance experience with additional attributes for recommendation
    enhanceExperience(experience) {
        const enhanced = { ...experience };

        // Add age suitability
        enhanced.ageSuitability = this.determineAgeSuitability(experience);
        
        // Add duration score (1-3: short, medium, long)
        enhanced.durationScore = this.calculateDurationScore(experience);
        
        // Add intensity score (1-3: light, moderate, high)
        enhanced.intensityScore = this.calculateIntensityScore(experience);
        
        // Add experience level requirement
        enhanced.experienceLevel = this.determineExperienceLevel(experience);
        
        // Add motion sensitivity rating
        enhanced.motionSensitivity = this.determineMotionSensitivity(experience);

        return enhanced;
    }

    determineAgeSuitability(experience) {
        // Determine age suitability based on category and content
        const category = experience.category.toLowerCase();
        
        if (category === 'education') return ['teen', 'young-adult', 'adult', 'mature'];
        if (category === 'gaming') {
            if (experience.title.toLowerCase().includes('beat saber') || 
                experience.title.toLowerCase().includes('pistol whip')) {
                return ['teen', 'young-adult', 'adult'];
            }
            return ['young-adult', 'adult', 'mature'];
        }
        if (category === 'fitness') return ['young-adult', 'adult', 'mature'];
        if (category === 'simulation') return ['adult', 'mature'];
        if (category === 'entertainment') return ['teen', 'young-adult', 'adult', 'mature'];
        
        return ['young-adult', 'adult']; // default
    }

    calculateDurationScore(experience) {
        // Assign duration scores based on typical session lengths
        const category = experience.category.toLowerCase();
        const title = experience.title.toLowerCase();
        
        if (category === 'fitness' || title.includes('beat saber') || title.includes('pistol whip')) {
            return 2; // medium duration (15-45 min)
        }
        if (category === 'education' && title.includes('google earth')) {
            return 3; // long duration (45+ min)
        }
        if (category === 'entertainment' && (title.includes('job simulator') || title.includes('the lab'))) {
            return 1; // short duration (5-15 min)
        }
        if (category === 'simulation') {
            return 3; // long duration
        }
        
        return 2; // default medium
    }

    calculateIntensityScore(experience) {
        // Assign intensity scores based on experience type
        const category = experience.category.toLowerCase();
        const title = experience.title.toLowerCase();
        
        if (title.includes('half-life') || title.includes('pistol whip')) {
            return 3; // high intensity
        }
        if (title.includes('beat saber') || category === 'fitness') {
            return 2; // moderate intensity
        }
        if (title.includes('google earth') || title.includes('tilt brush') || category === 'education') {
            return 1; // light intensity
        }
        if (category === 'simulation') {
            return 2; // moderate intensity
        }
        
        return 2; // default moderate
    }

    determineExperienceLevel(experience) {
        const category = experience.category.toLowerCase();
        const title = experience.title.toLowerCase();
        
        if (title.includes('half-life') || category === 'simulation') {
            return 'expert';
        }
        if (title.includes('beat saber') || title.includes('pistol whip') || category === 'gaming') {
            return 'intermediate';
        }
        
        return 'beginner'; // default
    }

    determineMotionSensitivity(experience) {
        const category = experience.category.toLowerCase();
        const title = experience.title.toLowerCase();
        
        if (title.includes('flight simulator') || title.includes('half-life')) {
            return 'high'; // high motion
        }
        if (category === 'gaming' && !title.includes('beat saber')) {
            return 'medium';
        }
        
        return 'low'; // default
    }

    // Generate recommendations based on user preferences
    generateRecommendations(preferences) {
        console.log('BST Engine: Generating recommendations for preferences:', preferences);
        
        if (!this.initialized) {
            console.error('Recommendation engine not initialized');
            return [];
        }

        if (!this.experiences || this.experiences.length === 0) {
            console.error('No experiences available for recommendations');
            return [];
        }

        // Map form values to dataset values
        const mappedPreferences = this.mapFormValuesToDataset(preferences);
        console.log('BST Engine: Mapped preferences:', mappedPreferences);

        // Start with all experiences and apply flexible scoring instead of hard filtering
        let candidates = [...this.experiences];
        console.log('BST Engine: Starting with', candidates.length, 'candidates');

        // Score all experiences based on preferences
        const scoredCandidates = candidates.map(exp => ({
            experience: exp,
            score: this.calculateRecommendationScore(exp, mappedPreferences)
        }));

        console.log('BST Engine: Scored candidates:', scoredCandidates.length);

        // Filter out experiences with very low scores (below 3 points)
        const filteredCandidates = scoredCandidates.filter(item => item.score >= 3);
        console.log('BST Engine: After filtering low scores:', filteredCandidates.length);

        // Sort by score (descending) and rating
        filteredCandidates.sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return b.experience.rating - a.experience.rating;
        });

        // Return top 6 experiences, or all if less than 6
        const topRecommendations = filteredCandidates.slice(0, 6).map(item => ({
            ...item.experience,
            matchScore: item.score,
            matchPercentage: Math.min(100, Math.max(25, Math.round((item.score / 15) * 100))) // Ensure at least 25% match
        }));

        console.log('BST Engine: Returning', topRecommendations.length, 'recommendations');
        console.log('BST Engine: Top recommendation:', topRecommendations[0]?.title, 'Score:', topRecommendations[0]?.matchScore);
        
        return topRecommendations;
    }

    // Map form values to dataset values
    mapFormValuesToDataset(preferences) {
        const mapped = { ...preferences };

        // Map age group
        const ageGroupMap = {
            'teen': 'Teen (13–17)',
            'young-adult': 'Young Adult (18–25)', 
            'adult': 'Adult (26–40)',
            'mature': 'Mature (40+)'
        };
        if (preferences.ageGroup && ageGroupMap[preferences.ageGroup]) {
            mapped.ageGroup = ageGroupMap[preferences.ageGroup];
        }

        // Map primary interest
        const interestMap = {
            'adventure': 'Adventure & Action',
            'education': 'Education & Exploration',
            'gaming': 'Adventure & Action', // Gaming maps to Adventure & Action in dataset
            'relaxation': 'Relaxation & Meditation',
            'fitness': 'Sports & Fitness',
            'creativity': 'Art & Creativity',
            'social': 'Music & Rhythm', // Social maps to Music & Rhythm in dataset
            'simulation': 'Sci-Fi & Space' // Simulation maps to Sci-Fi & Space in dataset
        };
        if (preferences.primaryInterest && interestMap[preferences.primaryInterest]) {
            mapped.primaryInterest = interestMap[preferences.primaryInterest];
        }

        // Map VR intensity
        const intensityMap = {
            'light': 'Light (Calm & Gentle)',
            'moderate': 'Moderate (Balanced)',
            'high': 'High (Fast-Paced)'
        };
        if (preferences.vrIntensity && intensityMap[preferences.vrIntensity]) {
            mapped.vrIntensity = intensityMap[preferences.vrIntensity];
        }

        // Map session duration
        const durationMap = {
            'short': 'Short (5–15 min)',
            'medium': 'Medium (15–30 min)',
            'long': 'Long (30+ min)'
        };
        if (preferences.sessionDuration && durationMap[preferences.sessionDuration]) {
            mapped.sessionDuration = durationMap[preferences.sessionDuration];
        }

        // Map experience level
        const levelMap = {
            'beginner': 'Beginner',
            'intermediate': 'Intermediate',
            'expert': 'Expert'
        };
        if (preferences.experienceLevel && levelMap[preferences.experienceLevel]) {
            mapped.experienceLevel = levelMap[preferences.experienceLevel];
        }

        // Map motion sensitivity
        const sensitivityMap = {
            'low': 'Low (No sensitivity)',
            'medium': 'Medium (Some sensitivity)',
            'high': 'High (Very sensitive)'
        };
        if (preferences.motionSensitivity && sensitivityMap[preferences.motionSensitivity]) {
            mapped.motionSensitivity = sensitivityMap[preferences.motionSensitivity];
        }

        return mapped;
    }

    // Calculate recommendation score based on preference matching
    calculateRecommendationScore(experience, preferences) {
        let score = 0;

        // Base score from rating (lower weight to prioritize preferences)
        score += experience.rating * 1;

        console.log(`Scoring ${experience.title}: Base rating score = ${experience.rating * 1}`);

        // Primary interest match - HIGHEST PRIORITY
        if (preferences.primaryInterest) {
            if (experience.primary_interest === preferences.primaryInterest) {
                score += 20; // Perfect interest match - HIGH WEIGHT
                console.log(`Interest perfect match: +20`);
            } else {
                // Enhanced category mapping for broader matches
                const categoryMap = {
                    'Adventure & Action': ['adventure', 'gaming', 'simulation'],
                    'Education & Exploration': ['education'],
                    'Gaming & Competition': ['gaming', 'adventure'],
                    'Relaxation & Meditation': ['relaxation', 'fitness'],
                    'Sports & Fitness': ['fitness'],
                    'Art & Creativity': ['creativity'],
                    'Social & Multiplayer': ['entertainment', 'gaming'],
                    'Sci-Fi & Space': ['simulation', 'education'],
                    'Music & Rhythm': ['gaming', 'entertainment'],
                    'Horror & Thriller': ['horror', 'gaming']
                };
                
                const targetCategories = categoryMap[preferences.primaryInterest] || [];
                if (targetCategories.includes(experience.category.toLowerCase())) {
                    score += 10; // Category match - MEDIUM WEIGHT
                    console.log(`Category match: +10`);
                } else {
                    // No match at all - significant penalty
                    score -= 5;
                    console.log(`No interest match: -5`);
                }
            }
        }

        // Age group match - use direct field if available, otherwise enhance
        if (preferences.ageGroup) {
            if (experience.age_group === preferences.ageGroup) {
                score += 8; // Perfect age match
                console.log(`Age perfect match: +8`);
            } else {
                // Fallback to enhanced age suitability
                const enhanced = this.enhanceExperience(experience);
                if (enhanced.ageSuitability.includes(preferences.ageGroup.toLowerCase().replace(/\s+\(.+\)/, ''))) {
                    score += 4;
                    console.log(`Age compatible: +4`);
                }
            }
        }

        // VR Intensity match - use direct field if available
        if (preferences.vrIntensity) {
            if (experience.vr_intensity === preferences.vrIntensity) {
                score += 6; // Perfect intensity match - HIGHER WEIGHT
                console.log(`Intensity perfect match: +6`);
            } else {
                // Fallback to enhanced intensity scoring
                const intensityMap = { 
                    'Light (Calm & Gentle)': 1, 
                    'Moderate (Balanced)': 2, 
                    'High (Fast-Paced)': 3 
                };
                const userIntensity = intensityMap[preferences.vrIntensity] || 2;
                const enhanced = this.enhanceExperience(experience);
                if (Math.abs(userIntensity - enhanced.intensityScore) <= 1) {
                    score += 3; // Close intensity match
                    console.log(`Intensity close match: +3`);
                } else {
                    // Penalty for very different intensity
                    score -= 2;
                    console.log(`Intensity mismatch: -2`);
                }
            }
        }

        // Session duration match - use direct field if available
        if (preferences.sessionDuration) {
            if (experience.session_duration === preferences.sessionDuration) {
                score += 6; // Perfect duration match - HIGHER WEIGHT
                console.log(`Duration perfect match: +6`);
            } else {
                // Fallback to enhanced duration scoring
                const durationMap = { 
                    'Short (5–15 min)': 1, 
                    'Medium (15–30 min)': 2, 
                    'Long (30+ min)': 3 
                };
                const userDuration = durationMap[preferences.sessionDuration] || 2;
                const enhanced = this.enhanceExperience(experience);
                if (Math.abs(userDuration - enhanced.durationScore) <= 1) {
                    score += 3; // Close duration match
                    console.log(`Duration close match: +3`);
                } else {
                    // Penalty for very different duration
                    score -= 2;
                    console.log(`Duration mismatch: -2`);
                }
            }
        }

        // Experience level compatibility - use direct field if available
        if (preferences.experienceLevel) {
            if (experience.vr_experience_level === preferences.experienceLevel) {
                score += 2; // Perfect level match
                console.log(`Experience level perfect match: +2`);
            } else {
                const levelOrder = { 'Beginner': 1, 'Intermediate': 2, 'Expert': 3 };
                const userLevel = levelOrder[preferences.experienceLevel] || 1;
                const expLevel = levelOrder[experience.vr_experience_level] || 1;
                if (expLevel <= userLevel) {
                    score += 1; // Experience is at or below user level
                    console.log(`Experience level compatible: +1`);
                }
            }
        }

        // Motion sensitivity compatibility - use direct field if available
        if (preferences.motionSensitivity) {
            const sensitivityMap = {
                'Low (No sensitivity)': 1,
                'Medium (Some sensitivity)': 2,
                'High (Very sensitive)': 3
            };
            const userSensitivity = sensitivityMap[preferences.motionSensitivity] || 2;
            const expSensitivity = sensitivityMap[experience.motion_sensitivity] || 2;
            
            if (userSensitivity >= expSensitivity) {
                score += 2; // User can handle this experience
                console.log(`Motion sensitivity compatible: +2`);
            }
        }

        // Bonus points for free experiences
        if (experience.price === 0) {
            score += 1;
            console.log(`Free experience bonus: +1`);
        }

        // Bonus for highly rated experiences
        if (experience.rating >= 4.5) {
            score += 1;
            console.log(`High rating bonus: +1`);
        }

        console.log(`Final score for ${experience.title}: ${score}`);
        return score;
    }

    // Get recommendation explanation
    getRecommendationExplanation(experience, preferences) {
        const reasons = [];

        if (experience.rating >= 4.5) {
            reasons.push("Highly rated by users");
        }

        // Check for direct primary interest match
        if (preferences.primaryInterest && experience.primary_interest === preferences.primaryInterest) {
            reasons.push(`Perfect match for ${preferences.primaryInterest.toLowerCase()}`);
        }

        // Check for VR intensity match
        if (preferences.vrIntensity && experience.vr_intensity === preferences.vrIntensity) {
            reasons.push(`Ideal ${preferences.vrIntensity.toLowerCase()} intensity`);
        }

        // Check for session duration match
        if (preferences.sessionDuration && experience.session_duration === preferences.sessionDuration) {
            reasons.push(`Perfect ${preferences.sessionDuration.toLowerCase()} session length`);
        }

        // Check for experience level match
        if (preferences.experienceLevel && experience.vr_experience_level === preferences.experienceLevel) {
            reasons.push(`Designed for ${preferences.experienceLevel} users`);
        }

        // Check for age group compatibility
        if (preferences.ageGroup && experience.age_group === preferences.ageGroup) {
            reasons.push(`Age-appropriate content`);
        }

        // Check for motion sensitivity compatibility
        if (preferences.motionSensitivity === 'high' && experience.motion_sensitivity === 'Low (No sensitivity)') {
            reasons.push("Motion-sickness friendly");
        }

        // Check for free experiences
        if (experience.price === 0) {
            reasons.push("Free to experience");
        }

        // Check for fitness benefits
        if (experience.estimated_calories_burned > 50) {
            reasons.push(`Great workout (${experience.estimated_calories_burned} calories)`);
        }

        return reasons.length > 0 ? reasons.join(" • ") : "AI-curated match for your preferences";
    }
}

// Create global recommendation engine instance
window.vrRecommendationEngine = new VRRecommendationEngine();