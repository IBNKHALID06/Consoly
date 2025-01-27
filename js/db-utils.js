// db-utils.js

// Function to open the IndexedDB database
async function openDatabase() {
  return new Promise((resolve, reject) => {
      const request = indexedDB.open('userDatabase', 1);

      request.onupgradeneeded = (event) => {
          const db = event.target.result;
          // Create an object store for users if it doesn't exist
          if (!db.objectStoreNames.contains('users')) {
              const objectStore = db.createObjectStore('users', { keyPath: 'id' });
              // Create an index on the email to retrieve users by email
              objectStore.createIndex('email', 'email', { unique: true });
          }
      };

      request.onerror = (e) => {
      request.onsuccess = () => {
          if (request.result) {
              resolve(request.result);
          }
      };
          reject(e);
      };
      request.onsuccess = () => resolve(request.result);
  });
}

// Function to add a user to IndexedDB
export async function addUser(user) {
  const db = await openDatabase();
  const transaction = db.transaction('users', 'readwrite');
  const store = transaction.objectStore('users');

  return new Promise((resolve, reject) => {
      const request = store.add(user);

      request.onsuccess = () => resolve();
      request.onerror = (e) => {
          console.error('Error adding user:', e.target.error);
          reject("Error adding user: " + e.target.error);
      };
  });
}

// Function to retrieve a user by their email
export async function getUserByEmail(email) {
  const db = await openDatabase();
  const transaction = db.transaction('users', 'readonly');
  const store = transaction.objectStore('users');
  const index = store.index('email'); // Use the email index

  return new Promise((resolve, reject) => {
      const request = index.get(email);

      request.onsuccess = () => {
          if (request.result) {
              resolve(request.result);  // User found, return the user
          } else {
              resolve(null);  // No user found with the given email
          }
      };

      request.onerror = (e) => {
          console.error('Error retrieving user by email:', e.target.error);
          reject("Error retrieving user by email: " + e.target.error);
      };
  });
}