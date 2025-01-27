import { getUserByEmail } from './js/db-utils.js';
import bcrypt from 'bcryptjs';

// Assuming you get email and password from a login form
const email = "user@example.com";  // The email the user enters
const password = "password123";    // The password the user enters

async function loginUser() {
  try {
    // Retrieve the user based on email
    const user = await getUserByEmail(email);

    if (user) {
      // Compare the entered password with the stored password (hashed)
      if (await checkPassword(password, user.password)) {
        console.log("Login successful!");

        // Redirect to the homepage or dashboard after successful login
        window.location.href = "index.html";  // Redirect to home page (or any other page)
      } else {
        console.log("Incorrect password!");
        alert("Incorrect password!");
      }
    } else {
      console.log("No user found with this email!");
      alert("No user found with this email!");
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
}

// Utility to check if the password matches the hashed one
async function checkPassword(enteredPassword, storedHashedPassword) {
  // Use bcrypt to compare the passwords
  return await bcrypt.compare(enteredPassword, storedHashedPassword);
}

// Add an event listener to the login form submission
document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission
  await loginUser(); // Call the loginUser function
});