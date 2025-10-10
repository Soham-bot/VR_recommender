# Firebase Setup Guide

## Quick Setup Instructions

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select existing project `vr-recommender-36a16`
3. Follow the setup wizard

### 2. Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable these providers:
   - ✅ **Email/Password** (required)
   - ✅ **Google** (recommended)

### 3. Configure Google Sign-In (Optional but Recommended)
1. In Authentication > Sign-in method > Google
2. Click "Enable"
3. Add your domain to authorized domains:
   - `localhost` (for development)
   - Your production domain

### 4. Set up Firestore Database
1. Go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in production mode"
4. Select a location close to your users

### 5. Get Firebase Configuration
1. Go to **Project Settings** (gear icon)
2. Scroll to "Your apps" section
3. Click "Add app" > Web (</>) if no web app exists
4. Copy the `firebaseConfig` object

### 6. Update Configuration
Replace the placeholder values in `JS/config.js`:

```javascript
const firebaseConfig = {
    apiKey: "your-actual-api-key",
    authDomain: "vr-recommender-36a16.firebaseapp.com",
    projectId: "vr-recommender-36a16",
    storageBucket: "vr-recommender-36a16.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "your-app-id",
    measurementId: "your-measurement-id"
};
```

### 7. Test Authentication
1. Open the app in your browser
2. Click "LOGIN" button
3. Try both email/password and Google Sign-In
4. Check browser console for any errors

## Troubleshooting

### Common Issues:

**"API key not valid" error:**
- Make sure you've replaced all placeholder values in `config.js`
- Verify the API key is correct in Firebase Console

**Google Sign-In popup blocked:**
- Allow popups for your domain
- The app will automatically fallback to redirect method

**Domain not authorized:**
- Add your domain to Firebase Authentication > Settings > Authorized domains

### Development vs Production

**Development (localhost):**
- Use `http://localhost` or `http://127.0.0.1`
- Firebase automatically allows localhost for development

**Production:**
- Add your production domain to authorized domains
- Use HTTPS for production deployments

## Security Notes

- Never commit real Firebase credentials to public repositories
- Use environment variables for production deployments
- Regularly rotate API keys if compromised
- Set up proper Firestore security rules

## Need Help?

Check the browser console for detailed error messages. Most authentication issues are related to configuration or domain authorization.