// Import the necessary Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDw3EJVpE4h-5Hiaw2u0chwOcexwipWCi0",
    authDomain: "todo-7c8db.firebaseapp.com",
    projectId: "todo-7c8db",
    storageBucket: "todo-7c8db.appspot.com",
    messagingSenderId: "782668656116",
    appId: "1:782668656116:web:3aaedf7f56beac789b9da1",
    measurementId: "G-7DPBLSQ374"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app); // Initialize Firebase Authentication
const storage = getStorage(app); // Initialize Firebase Storage

export { firestore, auth, storage };
