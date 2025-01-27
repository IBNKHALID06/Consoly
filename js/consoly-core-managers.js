// consoly-core-managers.js - Core managers for Consoly

// Import auth functions
import { register, login, logout, isLoggedIn, getCurrentUser } from './auth.js';
import { v4 as uuidv4 } from 'uuid';

// Authentication Manager

// Post Manager

// Search Manager

// Privacy Manager

// Constants for anonymous username generation

// Notification Manager

        notification.read = true;
        safeSetItem('consoly-notifications', this.notifications); // Persist changes

function safeGetItem(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.warn('Failed to access localStorage:', error);
        return [];
}

function safeSetItem(key, value) {
    try {
        const stringValue = JSON.stringify(value);
        if (stringValue === undefined) {
            console.warn('Failed to stringify value:', value);
            return;
        }
    } catch (error) {
        console.warn('Failed to set item in localStorage:', error);
    }
}
}

// Export all managers
export { AuthManager, PostManager, SearchManager, PrivacyManager, NotificationManager };

// Export all managers
export { AuthManager, PostManager, SearchManager, PrivacyManager, NotificationManager };