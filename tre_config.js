// ========================================
// TRE WORKSPACE REQUEST FORM - CONFIGURATION
// ========================================
// 
// This file contains all configurable parameters for the TRE form system.
// Copy this file to config.js and update with your actual values.
// 
// DO NOT commit config.js to version control if it contains sensitive data.
// Add config.js to .gitignore
//

const TREConfig = {
  // ========================================
  // LOGIC APP ENDPOINTS
  // ========================================
  
  // LA1 (Approval workflow) HTTP POST endpoint
  // Get this from Azure Portal → Logic App → Trigger URL
  logicAppLA1Endpoint: "https://prod-XX.uksouth.logic.azure.com:443/workflows/XXXXXXXX/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=XXXXXXXXXXXXXXXXXXXXXXXX",

  // ========================================
  // FORM BEHAVIOR
  // ========================================
  
  // Show debug information in console
  debugMode: true,
  
  // Timeout for HTTP requests (milliseconds)
  requestTimeout: 30000,
  
  // Show full error messages to users (false for production)
  showDetailedErrors: true,

  // ========================================
  // VALIDATION RULES
  // ========================================
  
  validation: {
    // Workspace name pattern
    workspaceNamePattern: /^[a-z0-9-]{3,}$/,
    workspaceNameMinLength: 3,
    workspaceNameMaxLength: 50,
    
    // Email validation (basic pattern)
    emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    
    // Text field limits
    shortTextMaxLength: 200,
    longTextMaxLength: 2000
  },

  // ========================================
  // UI MESSAGES
  // ========================================
  
  messages: {
    success: {
      title: "Request submitted successfully!",
      body: "An approval email has been sent. You will be notified of the outcome."
    },
    
    error: {
      title: "Failed to submit request",
      networkError: "Unable to connect to the server. Please check your connection and try again.",
      serverError: "The server returned an error. Please contact TRE support.",
      validationError: "Please correct the highlighted fields and try again.",
      timeout: "The request took too long. Please try again or contact support."
    },
    
    validation: {
      workspaceNameInvalid: "Use only lowercase letters, numbers, and hyphens (minimum 3 characters)",
      emailInvalid: "Please enter a valid email address",
      required: "This field is required"
    }
  },

  // ========================================
  // SUPPORT CONTACT
  // ========================================
  
  support: {
    email: "tre-support@yourdomain.com",
    phone: "+44 (0)20 XXXX XXXX",
    ticketUrl: "https://helpdesk.yourdomain.com/tre"
  }
};

// ========================================
// ENVIRONMENT-SPECIFIC OVERRIDES
// ========================================

// Detect environment (if using build tools)
if (typeof window !== 'undefined') {
  const hostname = window.location.hostname;
  
  // Development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    TREConfig.debugMode = true;
    TREConfig.showDetailedErrors = true;
  }
  
  // Production environment
  if (hostname.includes('yourdomain.com')) {
    TREConfig.debugMode = false;
    TREConfig.showDetailedErrors = false;
  }
}

// ========================================
// EXPORT (for module systems)
// ========================================

// CommonJS
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TREConfig;
}

// ES6
if (typeof exports !== 'undefined') {
  exports.TREConfig = TREConfig;
}

// Browser global
if (typeof window !== 'undefined') {
  window.TREConfig = TREConfig;
}