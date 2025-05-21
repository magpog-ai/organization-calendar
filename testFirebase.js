// This file is for testing Firebase configuration
const firebase = require('firebase/app');
require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyBVsIIqO96Xpyj8ujumpO1Slf3oUaNY5TM",
  authDomain: "ylcalendar-aa87e.firebaseapp.com",
  projectId: "ylcalendar-aa87e",
  storageBucket: "ylcalendar-aa87e.appspot.com",
  messagingSenderId: "436921391255",
  appId: "1:436921391255:web:abc123def456ghi789jkl"
};

// Initialize Firebase
if (!firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig);
}

console.log("Attempting to verify Firebase connection...");

// Test sign-in with test credentials
const email = 'admin@example.com';
const password = 'password123';

firebase.auth().signInWithEmailAndPassword(email, password)
  .then((userCredential) => {
    console.log("Authentication successful!", userCredential.user.uid);
    console.log("Your Firebase configuration is correct.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Authentication error:", error.code, error.message);
    console.log("\nPossible solutions:");
    console.log("1. Check the Firebase console to ensure Email/Password auth is enabled");
    console.log("2. Make sure the user 'admin@example.com' exists in Firebase Authentication");
    console.log("3. Verify the password for the admin user is correct");
    process.exit(1);
  }); 