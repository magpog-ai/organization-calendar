// This script sets up admin users in Firestore
const firebase = require('firebase/app');
require('firebase/firestore');

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

const db = firebase.firestore();

// List of admin emails
const adminEmails = [
  'admin@example.com',
  'mpogodska@younglife.org'
  // Add more admin emails here as needed
];

// Set up admin users in Firestore
async function setupAdmins() {
  console.log("Setting up admin users in Firestore...\n");
  
  const adminsCollection = db.collection('admins');
  
  for (const email of adminEmails) {
    try {
      // Set the document ID to be the email address
      await adminsCollection.doc(email).set({
        email: email,
        isAdmin: true,
        dateAdded: new Date()
      });
      
      console.log(`✅ Added admin privileges for: ${email}`);
    } catch (error) {
      console.error(`❌ Error setting admin privileges for ${email}:`, error);
    }
  }
  
  console.log("\nSetup complete!");
  console.log("You can now log in to your application with these admin users.");
  console.log("To add more admin users, either:");
  console.log("1. Update this script and run it again, or");
  console.log("2. Add them directly in the Firebase console under Firestore database > 'admins' collection");
  
  // Exit the script
  process.exit(0);
}

setupAdmins(); 