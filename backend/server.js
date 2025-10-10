/**
 * VR Experience Recommender - Backend Server
 * Express.js API server for VR recommendation system
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const vrRoutes = require('./routes/vr-experiences');
const recommendationRoutes = require('./routes/recommendations');
const userRoutes = require('./routes/users');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5002;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.tailwindcss.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "https://cdn.tailwindcss.com", "https://unpkg.com"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://firebaseapp.com", "https://identitytoolkit.googleapis.com"]
        }
    }
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.'
    }
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(cors({
    origin: [
        'http://localhost:5002',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://localhost:5503',
        'http://127.0.0.1:5503',
        'https://vr-rec.web.app',
        'https://vr-rec.firebaseapp.com'
    ],
    credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'VR Recommender API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vr-experiences', vrRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'VR Experience Recommender API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            vrExperiences: '/api/vr-experiences',
            recommendations: '/api/recommendations',
            users: '/api/users'
        },
        documentation: 'https://github.com/yourusername/vr-experience-recommender'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        message: `The requested endpoint ${req.originalUrl} does not exist`,
        availableEndpoints: ['/health', '/api/auth', '/api/vr-experiences', '/api/recommendations', '/api/users']
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 VR Recommender API Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
    console.log(`📚 Documentation: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});

module.exports = app;