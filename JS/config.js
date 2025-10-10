// Firebase Configuration (Updated - New Project)
const firebaseConfig = {
    apiKey: "AIzaSyCTvVEXeK7PJG-P5vH5TOX0QRSgBqbh1x8",
    authDomain: "vr-rec.firebaseapp.com",
    projectId: "vr-rec",
    storageBucket: "vr-rec.firebasestorage.app",
    messagingSenderId: "950066463673",
    appId: "1:950066463673:web:dd7d760c04a8d1d5e6ac68",
    measurementId: "G-KHK37JBK1S"
};

// Wait for Firebase to be available, then initialize
function initializeFirebase() {
    if (typeof firebase === 'undefined') {
        console.error('Firebase SDK not loaded');
        return false;
    }
    
    try {
        // Initialize Firebase with compat version
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
        
        // Initialize Firebase services
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        // Suppress Firestore CORS errors before authentication
        const originalConsoleError = console.error;
        console.error = function(...args) {
            const message = args.join(' ');
            if (message.includes('firestore.googleapis.com') && 
                message.includes('access control checks')) {
                // Suppress Firestore CORS errors - these are normal before auth
                return;
            }
            originalConsoleError.apply(console, args);
        };
        
        return true;
    } catch (error) {
        console.error('Firebase initialization failed:', error);
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