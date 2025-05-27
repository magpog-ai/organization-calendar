// Import Firebase
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBVsIIqO96Xpyj8ujumpO1Slf3oUaNY5TM",
  authDomain: "ylcalendar-aa87e.firebaseapp.com",
  projectId: "ylcalendar-aa87e",
  storageBucket: "ylcalendar-aa87e.appspot.com",
  messagingSenderId: "436921391255",
  appId: "1:436921391255:web:abc123def456ghi789jkl"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const auth = firebase.auth();

export { firebase, db, auth }; 
