// Advanced Email Validation System
class EmailValidator {
    constructor() {
        this.validDomains = [
            'gmail.com',
            'googlemail.com', // Alternative Gmail domain
            'outlook.com',
            'hotmail.com',
            'yahoo.com',
            'icloud.com',
            'protonmail.com'
        ];
        
        this.disposableEmailDomains = [
            '10minutemail.com',
            'tempmail.org',
            'guerrillamail.com',
            'mailinator.com',
            'throwaway.email',
            'temp-mail.org'
        ];
    }

    // Comprehensive email validation
    validateEmail(email) {
        const result = {
            isValid: false,
            errors: [],
            warnings: [],
            suggestions: []
        };

        // Basic format validation
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        
        if (!email) {
            result.errors.push('Email address is required');
            return result;
        }

        if (!emailRegex.test(email)) {
            result.errors.push('Please enter a valid email format');
            return result;
        }

        const [localPart, domain] = email.toLowerCase().split('@');

        // Check for valid domains
        if (!this.validDomains.includes(domain)) {
            result.errors.push('Please use a valid email provider (Gmail, Outlook, Yahoo, etc.)');
            result.suggestions.push('Try using your Gmail, Outlook, or Yahoo email address');
            return result;
        }

        // Check for disposable email domains
        if (this.disposableEmailDomains.includes(domain)) {
            result.errors.push('Temporary email addresses are not allowed');
            result.suggestions.push('Please use your permanent email address');
            return result;
        }

        // Gmail specific validation
        if (domain === 'gmail.com' || domain === 'googlemail.com') {
            if (!this.validateGmailFormat(localPart)) {
                result.errors.push('Invalid Gmail format');
                result.suggestions.push('Gmail addresses must be 6-30 characters and contain only letters, numbers, and periods');
                return result;
            }
        }

        // Additional checks
        if (localPart.length < 3) {
            result.errors.push('Email username is too short');
            return result;
        }

        if (localPart.length > 64) {
            result.errors.push('Email username is too long');
            return result;
        }

        // Check for suspicious patterns
        if (this.hasSuspiciousPatterns(email)) {
            result.warnings.push('This email format looks unusual');
        }

        result.isValid = true;
        return result;
    }

    // Gmail specific format validation
    validateGmailFormat(localPart) {
        // Gmail rules:
        // - 6-30 characters
        // - Letters, numbers, periods only
        // - Cannot start or end with period
        // - Cannot have consecutive periods
        
        if (localPart.length < 6 || localPart.length > 30) {
            return false;
        }

        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            return false;
        }

        if (localPart.includes('..')) {
            return false;
        }

        const gmailRegex = /^[a-zA-Z0-9.]+$/;
        return gmailRegex.test(localPart);
    }

    // Check for suspicious patterns
    hasSuspiciousPatterns(email) {
        const suspiciousPatterns = [
            /test/i,
            /fake/i,
            /dummy/i,
            /example/i,
            /\d{10,}/, // Too many consecutive numbers
            /(.)\1{4,}/ // Same character repeated 5+ times
        ];

        return suspiciousPatterns.some(pattern => pattern.test(email));
    }

    // Email verification through Firebase Auth
    async verifyEmailExists(email) {
        try {
            // This will attempt to send a verification email
            // If the email doesn't exist, it will fail
            const actionCodeSettings = {
                url: window.location.origin,
                handleCodeInApp: true
            };

            // Note: This requires the user to actually verify their email
            await firebase.auth().sendSignInLinkToEmail(email, actionCodeSettings);
            return { exists: true, verified: false };
        } catch (error) {
            console.error('Email verification error:', error);
            return { exists: false, verified: false, error: error.message };
        }
    }

    // Real-time email suggestions
    suggestCorrections(email) {
        const suggestions = [];
        const [localPart, domain] = email.toLowerCase().split('@');

        // Common domain typos
        const domainCorrections = {
            'gmai.com': 'gmail.com',
            'gmial.com': 'gmail.com',
            'gmail.co': 'gmail.com',
            'gmail.cm': 'gmail.com',
            'outlok.com': 'outlook.com',
            'hotmial.com': 'hotmail.com',
            'yahooo.com': 'yahoo.com'
        };

        if (domainCorrections[domain]) {
            suggestions.push(`Did you mean ${localPart}@${domainCorrections[domain]}?`);
        }

        return suggestions;
    }

    // Format email for display
    formatEmail(email) {
        return email.toLowerCase().trim();
    }
}

// Create global email validator instance
window.emailValidator = new EmailValidator();