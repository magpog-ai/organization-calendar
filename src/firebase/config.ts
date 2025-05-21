// Import Firebase
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "APIKEY",
  authDomain: "ylcalendar-aa87e.firebaseapp.com",
  projectId: "ylcalendar-aa87e",
  storageBucket: "ylcalendar-aa87e.appspot.com",
  messagingSenderId: "ID",
  appId: "appID"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

export { firebase, db, auth }; 
