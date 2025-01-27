// auth.js - Handles user authentication with auto-generated numeric IDs and secure password hashing

// Import bcrypt and uuid libraries
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs
import bcrypt from 'bcryptjs';

// Simulated user database (stored in localStorage)
const usersKey = 'consoly-users';

// Safeguard localStorage operations
function safeGetItem(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (error) {
        console.warn('Failed to access localStorage:', error);
        return [];


// Generate a unique 6-digit numeric ID


// Hash a password using bcrypt
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

// Verify a password using bcrypt
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}
}

// Verify a password using bcrypt
async function verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
}
// Hash a password using bcrypt

}

// Register a new user
async function register(password) {
    try {
        const users = safeGetItem(usersKey);

        // Generate a unique numeric ID and anonymous ID
        const userId = generateNumericId();
        // Hash the password
        const anonymousId = `anon-${uuidv4()}`;

        // Hash the password
        const hashedPassword = await hashPassword(password);

        // Create a new user object
        const newUser = {
            id: userId,
            password: hashedPassword,
            anonymousId
        };

        // Save the user to localStorage
        users.push(newUser);
        safeSetItem(usersKey, users);

        return newUser;
    } catch (error) {
        console.error('Error registering user:', error);
        throw new Error('Registration failed.');
    }
}

// Login a user
async function login(userId, password) {
    try {
        const users = safeGetItem(usersKey);

        // Find the user by numeric ID
        const user = users.find(user => user.id === userId);

        // Check if the user exists and the password matches
        if (!user || !(await verifyPassword(password, user.password))) {
            throw new Error('Invalid user ID or password.');
        }

        // Save the current user to localStorage (simulate a session)
        safeSetItem('currentUser', user);

        return user;
    } catch (error) {
        console.error('Error during login:', error);
        throw new Error('Login failed.');
    }
}

// Logout the current user
function logout(redirectUrl = 'consoly-signup-html.html') {
    localStorage.removeItem('currentUser');
    window.location.href = redirectUrl; // Configurable redirect
}

// Check if a user is logged in
function isLoggedIn() {
    return safeGetItem('currentUser') !== null;
}

// Get the current user
function getCurrentUser() {
    return safeGetItem('currentUser');
}

// Export functions for use in other files
export { register, login, logout, isLoggedIn, getCurrentUser };