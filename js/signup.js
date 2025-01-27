import { addUser } from './js/db-utils.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// Assuming you have form data or variables for the user's details
const email = "user@example.com"; // The user's email
const password = "password123";   // The user's plain text password

async function signupUser() {
  try {
    // Hash the password before saving it
    const hashedPassword = await hashPassword(password);
    const userId = uuidv4(); // Generate a unique ID for the user

    // Call addUser to store the new user in IndexedDB
    await addUser({ email, password: hashedPassword, id: userId }).catch(error => {
      if (error.message === 'User already exists') {
        console.error("Error: User already exists");
        // Handle the case where the user already exists (e.g., show a message to the user)
      } else {
    window.location.href = "login.html";
      }
    });

    console.log("User added successfully!");

    // Redirect to the login page after successful sign-up
    window.location.href = "login.html";  // Redirect to login page (or any other page)
  } catch (error) {
    console.error("Error signing up:", error);
  }
}

// Utility to hash the password using bcrypt
const config = {
  saltRounds: process.env.SALT_ROUNDS || 10
};

async function hashPassword(password) {
  const salt = await bcrypt.genSalt(config.saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
// Removed generateUniqueId function as it is no longer needed
// Utility to generate a unique ID for the user
function generateUniqueId() {
  return uuidv4();
}

// Add an event listener to the form submission
document.getElementById('signupForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission
  await signupUser(); // Call the signup function
});