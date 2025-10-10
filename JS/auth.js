// Authentication functionality
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.firebaseReady = false;
        this.initializeAuthManager();
    }

    async initializeAuthManager() {
        // Wait for Firebase to be available
        await this.waitForFirebase();
        this.initializeAuthListeners();
    }

    async waitForFirebase() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.auth && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.auth) {
            throw new Error('Firebase Auth not available after waiting');
        }
        
        this.firebaseReady = true;
        console.log('Firebase Auth is ready');
    }

    initializeAuthListeners() {
        // Listen for authentication state changes
        window.auth.onAuthStateChanged((user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
            console.log('User details:', user);
            this.currentUser = user;
            this.updateUI(user);
            
            // Also handle redirect results for Google Sign-In
            this.handleRedirectResult();
        });
    }

    async handleRedirectResult() {
        try {
            console.log('Checking for redirect result...');
            const result = await window.auth.getRedirectResult();
            console.log('Redirect result:', result);
            
            if (result && result.user) {
                console.log('Redirect result user:', result.user);
                console.log('User signed in via redirect:', result.user.email);
                
                // Update current user
                this.currentUser = result.user;
                
                // Force UI update after redirect
                this.updateUI(result.user);
                
                // Show success message
                if (window.app && window.app.showSuccess) {
                    window.app.showSuccess(`Welcome back, ${result.user.displayName || result.user.email}!`);
                }
                
                return true;
            } else {
                console.log('No redirect result found');
                return false;
            }
        } catch (error) {
            console.error('Redirect result error:', error);
            return false;
        }
    }

    updateUI(user) {
        console.log('Updating UI for user:', user);
        
        const logoutBtn = document.getElementById('logoutBtn');
        const userInfo = document.getElementById('userInfo');

        // Check if elements exist
        if (!logoutBtn || !userInfo) {
            console.error('UI elements not found:', {
                logoutBtn: !!logoutBtn,
                userInfo: !!userInfo
            });
            return;
        }

        if (user) {
            console.log('User is signed in, updating UI...');
            
            // User is signed in
            logoutBtn.classList.remove('hidden');
            userInfo.classList.remove('hidden');
            
            // Display user info based on sign-in method
            let displayText = '';
            if (user.displayName) {
                // Google user with display name
                displayText = user.displayName;
            } else if (user.email) {
                // Email user or Google user without display name
                displayText = user.email.split('@')[0];
            } else {
                displayText = 'User';
            }
            
            // Add provider info
            const providerData = user.providerData;
            if (providerData && providerData.length > 0) {
                const provider = providerData[0].providerId;
                if (provider === 'google.com') {
                    displayText += ' (Google)';
                }
            }
            
            // Add profile picture if available (Google users)
            if (user.photoURL) {
                userInfo.innerHTML = `
                    <div class="flex items-center gap-2">
                        <img src="${user.photoURL}" alt="Profile" class="w-8 h-8 rounded-full border-2 border-neon-green">
                        <span class="text-neon-green font-semibold">${displayText}</span>
                    </div>
                `;
            } else {
                userInfo.innerHTML = `<span class="text-neon-green font-semibold">${displayText}</span>`;
            }
            
            // Close auth modal if open
            const authModal = document.getElementById('authModal');
            if (authModal && !authModal.classList.contains('hidden')) {
                authModal.classList.add('hidden');
            }
            
            console.log('UI updated successfully for logged in user');
            
            // Show success notification
            if (window.app && window.app.showSuccess) {
                window.app.showSuccess(`Logged in as ${displayText}`);
            }
        } else {
            console.log('User is signed out, updating UI...');
            
            // User is signed out - show guest mode
            logoutBtn.classList.add('hidden');
            userInfo.textContent = 'Guest Mode - Browse VR experiences';
            userInfo.classList.remove('hidden');
            
            console.log('UI updated successfully for logged out user');
        }
    }

    async signUp(email, password) {
        try {
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            console.log('User signed up:', userCredential.user);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            console.log('User signed in:', userCredential.user);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signInWithGoogle() {
        console.log('Starting Google Sign-In process...');
        
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            
            // Add custom parameters for better UX
            provider.addScope('email');
            provider.addScope('profile');
            provider.setCustomParameters({
                'prompt': 'select_account',
                'hd': '' // Allow any domain
            });

            console.log('Google provider configured');
            console.log('Current domain:', window.location.hostname);
            console.log('Current protocol:', window.location.protocol);

            // Check if we're on a secure domain
            const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
            console.log('Is secure domain:', isSecure);
            
            // Check if domain is likely authorized
            const authorizedDomains = [
                'localhost',
                '127.0.0.1',
                'vr-rec.web.app',
                'vr-rec.firebaseapp.com'
            ];
            const currentDomain = window.location.hostname;
            const isDomainAuthorized = authorizedDomains.includes(currentDomain);
            console.log('Is domain authorized:', isDomainAuthorized, 'Domain:', currentDomain);
            
            let result;
            
            // Always try popup first for better UX
            try {
                console.log('Attempting popup sign-in...');
                result = await window.auth.signInWithPopup(provider);
                console.log('Popup sign-in successful:', result);
            } catch (popupError) {
                console.log('Popup failed, trying redirect:', popupError);
                
                // Check if popup was blocked or other popup-specific errors
                if (popupError.code === 'auth/popup-blocked' || 
                    popupError.code === 'auth/popup-closed-by-user' ||
                    popupError.code === 'auth/cancelled-popup-request') {
                    
                    console.log('Using redirect method as fallback...');
                    try {
                        await window.auth.signInWithRedirect(provider);
                        console.log('Redirect initiated successfully');
                        return { success: true, redirect: true };
                    } catch (redirectError) {
                        console.error('Redirect also failed:', redirectError);
                        throw redirectError;
                    }
                } else {
                    // For other errors, throw them
                    throw popupError;
                }
            }
            
            console.log('Google sign in successful:', result.user);
            
            // Force UI update immediately
            this.updateUI(result.user);
            
            // Get additional user info
            const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
            const token = credential ? credential.accessToken : null;
            
            return { 
                success: true, 
                user: result.user,
                isNewUser: result.additionalUserInfo?.isNewUser || false,
                token: token
            };
        } catch (error) {
            console.error('Google sign in error:', error);
            
            // Handle specific Google auth errors
            let errorMessage = error.message;
            if (error.code === 'auth/popup-closed-by-user') {
                errorMessage = 'Sign-in cancelled. Please try again.';
            } else if (error.code === 'auth/popup-blocked') {
                errorMessage = 'Pop-up blocked. Please allow pop-ups and try again.';
            } else if (error.code === 'auth/account-exists-with-different-credential') {
                errorMessage = 'An account already exists with this email using a different sign-in method.';
            } else if (error.code === 'auth/unauthorized-domain') {
                errorMessage = 'This domain is not authorized for Google Sign-In. Please contact support.';
            }
            
            return { success: false, error: errorMessage };
        }
    }

    async linkGoogleAccount() {
        try {
            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await window.auth.currentUser.linkWithPopup(provider);
            console.log('Google account linked:', result.user);
            return { success: true, user: result.user };
        } catch (error) {
            console.error('Google account linking error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            await window.auth.signOut();
            console.log('User signed out');
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Manual UI refresh function
    refreshUI() {
        console.log('Manually refreshing UI...');
        const currentUser = window.auth.currentUser;
        console.log('Current Firebase user:', currentUser);
        this.currentUser = currentUser;
        this.updateUI(currentUser);
    }
}

// Create global auth manager instance with error handling
try {
    console.log('Creating AuthManager instance...');
    
    // Check if Firebase is available
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase is not loaded');
    }
    
    if (typeof auth === 'undefined') {
        throw new Error('Firebase Auth is not initialized');
    }
    
    window.authManager = new AuthManager();
    console.log('AuthManager created successfully');
} catch (error) {
    console.error('Failed to create AuthManager:', error);
    
    // Retry after a delay
    setTimeout(() => {
        try {
            console.log('Retrying AuthManager creation...');
            window.authManager = new AuthManager();
            console.log('AuthManager created successfully on retry');
        } catch (retryError) {
            console.error('AuthManager creation failed on retry:', retryError);
        }
    }, 1000);
}

// Debug function to test authentication state
window.debugAuth = function() {
    console.log('=== AUTH DEBUG INFO ===');
    console.log('Current user:', window.authManager.getCurrentUser());
    console.log('Is authenticated:', window.authManager.isAuthenticated());
    console.log('Firebase auth current user:', auth.currentUser);
    console.log('Auth manager current user:', window.authManager.currentUser);
    
    // Test UI elements
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    
    console.log('UI Elements:', {
        logoutBtn: logoutBtn ? 'found' : 'missing',
        userInfo: userInfo ? 'found' : 'missing'
    });
    
    console.log('UI States:', {
        logoutBtnHidden: logoutBtn ? logoutBtn.classList.contains('hidden') : 'N/A',
        userInfoHidden: userInfo ? userInfo.classList.contains('hidden') : 'N/A'
    });
    
    console.log('========================');
};
// Helper function for users to manually check and refresh auth state
window.checkAuthState = function() {
    console.log('=== MANUAL AUTH STATE CHECK ===');
    
    const currentUser = window.auth.currentUser;
    console.log('Firebase currentUser:', currentUser);
    
    if (currentUser) {
        console.log('User is signed in:', {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            emailVerified: currentUser.emailVerified
        });
        
        // Force UI update
        if (window.authManager) {
            window.authManager.refreshUI();
            console.log('UI refreshed');
        }
        
        return true;
    } else {
        console.log('No user is signed in');
        return false;
    }
};

// Helper function to manually trigger Google Sign-In
window.manualGoogleSignIn = async function() {
    console.log('Manual Google Sign-In triggered');
    
    if (!window.authManager) {
        console.error('Auth manager not available');
        return;
    }
    
    try {
        const result = await window.authManager.signInWithGoogle();
        console.log('Manual Google Sign-In result:', result);
        return result;
    } catch (error) {
        console.error('Manual Google Sign-In error:', error);
        return { success: false, error: error.message };
    }
};