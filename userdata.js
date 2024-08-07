import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firestore } from './firebase-config.js'; // Import Firestore instance
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

// Initialize Firebase Authentication
const auth = getAuth();

// Function to update the UI with user information
const updateUserUI = async (user) => {
    const userDocRef = doc(firestore, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
        const userData = userDoc.data();
        document.querySelector('#username-display').textContent = userData.username;
        document.querySelector('#profile-image').src = userData.profileImageURL;
    } else {
        console.error('User document does not exist');
    }
};

document.addEventListener('DOMContentLoaded', async () => {

    onAuthStateChanged(auth, (user) => {
        if (user) {
            updateUserUI(user);
        } else {
            // Handle user not logged in
            window.location.href = 'auth.html'; // Redirect to auth.html if not logged in
        }
    });
});