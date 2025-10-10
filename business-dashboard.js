// Business Dashboard JavaScript

class BusinessDashboard {
    constructor() {
        this.charts = {};
        this.init();
    }

    async init() {
        console.log('Initializing Business Dashboard...');
        
        // Wait for Firebase to initialize
        await this.waitForFirebase();
        
        // Initialize charts
        this.initializeCharts();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load real-time data
        this.loadDashboardData();
        
        console.log('Business Dashboard initialized successfully');
    }

    async waitForFirebase() {
        let attempts = 0;
        while ((!window.db || !window.auth) && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
    }

    initializeCharts() {
        // Acquisition Funnel Chart
        this.createAcquisitionChart();
        
        // Satisfaction Trends Chart
        this.createSatisfactionChart();
        
        // RFM Segmentation Chart
        this.createRFMChart();
        
        // CLV Chart
        this.createCLVChart();
    }

    createAcquisitionChart() {
        const ctx = document.getElementById('acquisitionChart');
        if (!ctx) return;

        this.charts.acquisition = new Chart(ctx, {
            type: 'funnel',
            data: {
                labels: ['Website Visits', 'Sign-ups', 'Active Users', 'Premium Users', 'Loyal Customers'],
                datasets: [{
                    label: 'User Acquisition Funnel',
                    data: [10000, 2450, 1680, 420, 180],
                    backgroundColor: [
                        'rgba(0, 245, 255, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(255, 0, 128, 0.8)',
                        'rgba(0, 255, 136, 0.8)',
                        'rgba(255, 165, 0, 0.8)'
                    ],
                    borderColor: [
                        'rgba(0, 245, 255, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(255, 0, 128, 1)',
                        'rgba(0, 255, 136, 1)',
                        'rgba(255, 165, 0, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const percentage = context.dataIndex > 0 ? 
                                    ((context.parsed / context.dataset.data[context.dataIndex - 1]) * 100).toFixed(1) : 100;
                                return `${context.label}: ${context.parsed.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    createSatisfactionChart() {
        const ctx = document.getElementById('satisfactionChart');
        if (!ctx) return;

        this.charts.satisfaction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Customer Satisfaction',
                    data: [4.2, 4.3, 4.5, 4.4, 4.6, 4.7],
                    borderColor: 'rgba(0, 245, 255, 1)',
                    backgroundColor: 'rgba(0, 245, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 3.5,
                        max: 5,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    createRFMChart() {
        const ctx = document.getElementById('rfmChart');
        if (!ctx) return;

        this.charts.rfm = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Champions', 'Loyal Customers', 'Potential Loyalists', 'At Risk', 'Others'],
                datasets: [{
                    data: [18, 25, 22, 15, 20],
                    backgroundColor: [
                        'rgba(0, 255, 136, 0.8)',
                        'rgba(0, 245, 255, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(255, 0, 128, 0.8)',
                        'rgba(255, 165, 0, 0.8)'
                    ],
                    borderColor: [
                        'rgba(0, 255, 136, 1)',
                        'rgba(0, 245, 255, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(255, 0, 128, 1)',
                        'rgba(255, 165, 0, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: 20
                        }
                    }
                }
            }
        });
    }

    createCLVChart() {
        const ctx = document.getElementById('clvChart');
        if (!ctx) return;

        this.charts.clv = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Champions', 'Loyal', 'Potential', 'At Risk', 'Others'],
                datasets: [{
                    label: 'Average CLV ($)',
                    data: [285, 180, 95, 45, 25],
                    backgroundColor: [
                        'rgba(0, 255, 136, 0.8)',
                        'rgba(0, 245, 255, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(255, 0, 128, 0.8)',
                        'rgba(255, 165, 0, 0.8)'
                    ],
                    borderColor: [
                        'rgba(0, 255, 136, 1)',
                        'rgba(0, 245, 255, 1)',
                        'rgba(139, 92, 246, 1)',
                        'rgba(255, 0, 128, 1)',
                        'rgba(255, 165, 0, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                return '$' + value;
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                }
            }
        });
    }

    setupEventListeners() {
        // Export PDF Report
        const exportPdfBtn = document.getElementById('exportPdfBtn');
        if (exportPdfBtn) {
            exportPdfBtn.addEventListener('click', () => this.exportPDFReport());
        }

        // Export Excel Data
        const exportExcelBtn = document.getElementById('exportExcelBtn');
        if (exportExcelBtn) {
            exportExcelBtn.addEventListener('click', () => this.exportExcelData());
        }

        // Schedule Reports
        const scheduleReportBtn = document.getElementById('scheduleReportBtn');
        if (scheduleReportBtn) {
            scheduleReportBtn.addEventListener('click', () => this.scheduleReports());
        }

        // Export Report Button (main)
        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportPDFReport());
        }
    }

    async loadDashboardData() {
        try {
            // Simulate loading real data from Firebase
            // In a real implementation, you would fetch this from your database
            
            // Update metrics with animation
            this.animateCounter('totalUsers', 1247);
            this.animateCounter('monthlyRevenue', 8450, '$');
            
            // Load user analytics
            await this.loadUserAnalytics();
            
            // Load business metrics
            await this.loadBusinessMetrics();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        }
    }

    async loadUserAnalytics() {
        // Simulate API call to get user analytics
        const analytics = {
            totalUsers: 1247,
            activeUsers: 890,
            newUsers: 156,
            returningUsers: 734,
            avgSessionTime: '12m 34s',
            bounceRate: 0.23,
            conversionRate: 0.248
        };

        // Update UI with analytics data
        this.updateAnalyticsUI(analytics);
    }

    async loadBusinessMetrics() {
        // Simulate API call to get business metrics
        const metrics = {
            revenue: {
                monthly: 8450,
                quarterly: 24680,
                annual: 98720
            },
            customers: {
                total: 1247,
                premium: 420,
                churn: 0.05
            },
            nps: 72,
            csat: 4.6,
            clv: 127.50,
            cac: 23.40
        };

        // Update UI with business metrics
        this.updateBusinessMetricsUI(metrics);
    }

    animateCounter(elementId, targetValue, prefix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 2000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
            element.textContent = prefix + currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    updateAnalyticsUI(analytics) {
        // Update various analytics displays
        console.log('Analytics updated:', analytics);
    }

    updateBusinessMetricsUI(metrics) {
        // Update business metrics displays
        console.log('Business metrics updated:', metrics);
    }

    exportPDFReport() {
        // Create comprehensive PDF report
        const reportData = this.generateReportData();
        
        // Simulate PDF generation
        this.showNotification('Generating PDF report...', 'info');
        
        setTimeout(() => {
            // In a real implementation, you would use a library like jsPDF
            const blob = new Blob([this.generatePDFContent(reportData)], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `VR-Recommender-Business-Report-${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('PDF report downloaded successfully!', 'success');
        }, 2000);
    }

    exportExcelData() {
        // Export data to Excel format
        this.showNotification('Generating Excel report...', 'info');
        
        setTimeout(() => {
            const csvContent = this.generateCSVContent();
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `VR-Recommender-Data-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Excel data exported successfully!', 'success');
        }, 1500);
    }

    scheduleReports() {
        // Show scheduling modal
        const scheduleOptions = prompt('Schedule reports:\n1. Daily\n2. Weekly\n3. Monthly\n\nEnter your choice (1-3):');
        
        if (scheduleOptions) {
            const scheduleType = ['Daily', 'Weekly', 'Monthly'][parseInt(scheduleOptions) - 1];
            if (scheduleType) {
                this.showNotification(`${scheduleType} reports scheduled successfully!`, 'success');
            }
        }
    }

    generateReportData() {
        return {
            executiveSummary: {
                totalUsers: 1247,
                monthlyRevenue: 8450,
                avgSessionTime: '12m 34s',
                conversionRate: 24.8
            },
            customerJourney: {
                awareness: 2450,
                interest: 1680,
                consideration: 890,
                purchase: 320,
                loyalty: 180
            },
            npsMetrics: {
                score: 72,
                promoters: 68,
                passives: 28,
                detractors: 4
            },
            rfmSegmentation: {
                champions: 18,
                loyal: 25,
                potential: 22,
                atRisk: 15,
                others: 20
            },
            clvAnalysis: {
                averageCLV: 127.50,
                cac: 23.40,
                ratio: 5.4,
                paybackPeriod: 2.8
            }
        };
    }

    generatePDFContent(data) {
        // Generate PDF content (simplified for demo)
        return `VR Recommender Business Report
Generated: ${new Date().toLocaleDateString()}

EXECUTIVE SUMMARY
================
Total Users: ${data.executiveSummary.totalUsers}
Monthly Revenue: $${data.executiveSummary.monthlyRevenue}
Average Session Time: ${data.executiveSummary.avgSessionTime}
Conversion Rate: ${data.executiveSummary.conversionRate}%

CUSTOMER JOURNEY
===============
Awareness: ${data.customerJourney.awareness} visitors
Interest: ${data.customerJourney.interest} engaged users
Consideration: ${data.customerJourney.consideration} trial users
Purchase: ${data.customerJourney.purchase} conversions
Loyalty: ${data.customerJourney.loyalty} repeat customers

NPS METRICS
===========
NPS Score: ${data.npsMetrics.score}
Promoters: ${data.npsMetrics.promoters}%
Passives: ${data.npsMetrics.passives}%
Detractors: ${data.npsMetrics.detractors}%

RFM SEGMENTATION
===============
Champions: ${data.rfmSegmentation.champions}%
Loyal Customers: ${data.rfmSegmentation.loyal}%
Potential Loyalists: ${data.rfmSegmentation.potential}%
At Risk: ${data.rfmSegmentation.atRisk}%

CLV ANALYSIS
============
Average CLV: $${data.clvAnalysis.averageCLV}
Customer Acquisition Cost: $${data.clvAnalysis.cac}
CLV:CAC Ratio: ${data.clvAnalysis.ratio}:1
Payback Period: ${data.clvAnalysis.paybackPeriod} months`;
    }

    generateCSVContent() {
        return `Metric,Value,Period
Total Users,1247,Current
Monthly Revenue,8450,December 2024
Conversion Rate,24.8%,December 2024
NPS Score,72,Q4 2024
Average CLV,$127.50,Current
Customer Acquisition Cost,$23.40,Current
Champions Segment,18%,Current
Loyal Customers,25%,Current
Potential Loyalists,22%,Current
At Risk Customers,15%,Current`;
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        let bgClass, borderClass;
        
        switch(type) {
            case 'success':
                bgClass = 'bg-green-500/90';
                borderClass = 'border-green-400';
                break;
            case 'error':
                bgClass = 'bg-red-500/90';
                borderClass = 'border-red-400';
                break;
            case 'warning':
                bgClass = 'bg-yellow-500/90';
                borderClass = 'border-yellow-400';
                break;
            default:
                bgClass = 'bg-blue-500/90';
                borderClass = 'border-blue-400';
        }

        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg font-rajdhani font-semibold ${bgClass} text-white border ${borderClass}`;
        notification.style.backdropFilter = 'blur(10px)';
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.businessDashboard = new BusinessDashboard();
});

// Initialize Lucide icons when page loads
window.addEventListener('load', () => {
    if (window.lucide) {
        window.lucide.createIcons();
    }
});