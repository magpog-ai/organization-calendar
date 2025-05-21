const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Create a service account key file
const serviceAccountData = {
  "type": "service_account",
  "project_id": "ylcalendar-aa87e",
  "client_email": "firebase-adminsdk@ylcalendar-aa87e.iam.gserviceaccount.com",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "universe_domain": "googleapis.com"
};

console.log("To create an admin user, you need to:");
console.log("1. Go to https://console.firebase.google.com/project/ylcalendar-aa87e/authentication/users");
console.log("2. Click 'Add User'");
console.log("3. Enter these credentials:");
console.log("   - Email: admin@example.com");
console.log("   - Password: password123");
console.log("\nAfter creating the user, you can log in to your calendar app with these credentials.");
console.log("\nAlternatively, you can enable Email/Password authentication in your Firebase project if not already enabled:");
console.log("1. Go to https://console.firebase.google.com/project/ylcalendar-aa87e/authentication/providers");
console.log("2. Click on 'Email/Password' provider");
console.log("3. Toggle the 'Enable' switch to on");
console.log("4. Click 'Save'"); 