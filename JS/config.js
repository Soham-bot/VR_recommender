// Firebase Configuration - Demo/Development Setup
// IMPORTANT: Replace with your actual Firebase project credentials for production
const firebaseConfig = {
    apiKey: "AIzaSyDemo_Replace_With_Your_Actual_API_Key",
    authDomain: "vr-recommender-36a16.firebaseapp.com",
    projectId: "vr-recommender-36a16",
    storageBucket: "vr-recommender-36a16.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:demo_app_id",
    measurementId: "G-DEMO_MEASUREMENT_ID"
};

// Configuration validation
function validateFirebaseConfig() {
    const requiredFields = ['apiKey', 'authDomain', 'projectId'];
    const missingFields = requiredFields.filter(field => 
        !firebaseConfig[field] || firebaseConfig[field].includes('YOUR_') || firebaseConfig[field].includes('Demo')
    );
    
    if (missingFields.length > 0) {
        console.warn('⚠️ Firebase Configuration Warning:');
        console.warn('Missing or placeholder values detected in Firebase config.');
        console.warn('Please update JS/config.js with your actual Firebase credentials.');
        console.warn('Missing/placeholder fields:', missingFields);
        
        // Show user-friendly warning
        const warningDiv = document.createElement('div');
        warningDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-yellow-900/90 border border-yellow-500 rounded-lg px-4 py-2 text-yellow-200 font-rajdhani text-sm z-40 max-w-md text-center';
        warningDiv.innerHTML = `
            <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                <span>Firebase not configured - Authentication disabled</span>
            </div>
        `;
        document.body.appendChild(warningDiv);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (warningDiv.parentNode) {
                warningDiv.remove();
            }
        }, 5000);
        
        return false;
    }
    
    return true;
}

// Wait for Firebase to be available, then initialize
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return false;
    }
    
    // Validate configuration first
    const isConfigValid = validateFirebaseConfig();
    
    try {
        // Initialize Firebase with compat version
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
        
        // Initialize Firebase services
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        // Set up authentication state persistence
        if (isConfigValid) {
            window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        }
        
        // Suppress Firestore CORS errors before authentication
        const originalConsoleError = console.error;
        console.error = function(...args) {
            const message = args.join(' ');
            if (message.includes('firestore.googleapis.com') && 
                message.includes('access control checks')) {
                // Suppress Firestore CORS errors - these are normal before auth
                return;
            }
            if (message.includes('auth/api-key-not-valid') && !isConfigValid) {
                // Suppress API key errors when config is not set up
                return;
            }
            originalConsoleError.apply(console, args);
        };
        
        return true;
    } catch (error) {
        if (!isConfigValid) {
            console.warn('Firebase initialization failed due to invalid configuration');
        } else {
            console.error('Firebase initialization failed:', error);
        }
        return false;
    }
}

// Initialize Firebase immediately if available, or wait for it
if (typeof firebase !== 'undefined') {
    initializeFirebase();
} else {
    // Wait for Firebase to load
    const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined') {
            clearInterval(checkFirebase);
            initializeFirebase();
        }
    }, 100);
}

// API Configuration
const API_CONFIG = {
    baseURL: 'http://localhost:5002/api',
    endpoints: {
        vrExperiences: '/vr-experiences',
        recommendations: '/recommendations',
        users: '/users',
        auth: '/auth'
    }
};

// Export for use in other files
window.API_CONFIG = API_CONFIG;

// Note: Offline persistence is now handled through FirestoreSettings.cache
// The deprecated enablePersistence() method has been removed to avoid warnings
// Modern Firebase versions handle caching automatically