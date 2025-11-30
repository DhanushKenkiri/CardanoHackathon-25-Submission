// Firebase configuration for ParknGo
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyDH7a5YqLMJH4nbz-1wWa9_X5qZ8RxF7vQ",
  authDomain: "parkngo-ai.firebaseapp.com",
  databaseURL: "https://parkngo-ai-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "parkngo-ai",
  storageBucket: "parkngo-ai.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
