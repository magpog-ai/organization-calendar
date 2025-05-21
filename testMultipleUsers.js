// This file tests multiple Firebase users
const firebase = require('firebase/app');
require('firebase/auth');

const firebaseConfig = {
  apiKey: "APIKEY",
  authDomain: "ylcalendar-aa87e.firebaseapp.com",
  projectId: "ylcalendar-aa87e",
  storageBucket: "ylcalendar-aa87e.appspot.com",
  messagingSenderId: "ID",
  appId: "appID"
};

// Initialize Firebase
if (!firebase.apps?.length) {
  firebase.initializeApp(firebaseConfig);
}

// List of admin emails (must match the list in AuthContext.tsx)
const adminEmails = [
  'admin@example.com',
  'mpogodska@younglife.org',
  // Add more admin emails here as needed
];

// This is where you can add the email addresses and passwords of users to test
// Format: [email, password, expected role (admin/user)]
const usersToTest = [
  ["admin@example.com", "password123", "admin"] // Replace with actual password
];

// Test each user
async function testUsers() {
  console.log("TESTING USER LOGINS\n==================");
  
  for (const [email, password, role] of usersToTest) {
    console.log(`Testing ${email} (expected role: ${role})...`);
    
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      console.log(`✅ SUCCESS: User ${email} authenticated successfully!`);
      console.log(`   User ID: ${userCredential.user.uid}`);
      console.log(`   Email: ${userCredential.user.email}`);
      
      // Check if this email is in the admin list
      const isAdmin = adminEmails.includes(email);
      console.log(`   Is admin in your app: ${isAdmin ? 'Yes' : 'No'}`);
      
      if ((isAdmin && role === 'admin') || (!isAdmin && role === 'user')) {
        console.log(`   ✅ Role matches expected: ${role}`);
      } else {
        console.log(`   ❌ Role DOES NOT match expected: ${role}, actual: ${isAdmin ? 'admin' : 'user'}`);
      }
      
      // Sign out before testing next user
      await firebase.auth().signOut();
      console.log(`   Signed out successfully.\n`);
    } catch (error) {
      console.error(`❌ ERROR: Failed to authenticate ${email}:`);
      console.error(`   ${error.code}: ${error.message}\n`);
    }
  }
  
  console.log("\nUSER LOGIN TEST SUMMARY");
  console.log("====================");
  console.log(`Total users tested: ${usersToTest.length}`);
  console.log("\nIMPORTANT NOTES:");
  console.log("1. In your application, admin privileges are given to these emails:");
  adminEmails.forEach(email => console.log(`   - ${email}`));
  console.log("2. All other users will have regular user privileges (can view but not edit)");
  console.log("3. To modify admin emails, edit the adminEmails array in src/context/AuthContext.tsx");
}

testUsers(); 
