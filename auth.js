import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { firestore, auth, storage } from './firebase-config.js'; // Import Firestore, Auth, and Storage
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";



let isSignup = true;

document.getElementById('auth-toggle').addEventListener('click', () => {
    isSignup = !isSignup;
    document.getElementById('auth-title').textContent = isSignup ? 'Sign Up' : 'Login';
    document.getElementById('auth-button').textContent = isSignup ? 'Sign Up' : 'Login';
    document.getElementById('auth-toggle').textContent = isSignup ? 'Already have an account? Login' : 'Don\'t have an account? Sign Up';
});

document.getElementById('auth-button').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const username = document.getElementById('username').value;
    const profileImage = document.getElementById('profileImage').files[0];

    try {
        if (isSignup) {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Handle profile image upload
            let profileImageURL = '';
            if (profileImage) {
                const imageRef = ref(storage, `profile_images/${user.uid}`);
                await uploadBytes(imageRef, profileImage);
                profileImageURL = await getDownloadURL(imageRef);
            }

            // Save user info in Firestore
            await setDoc(doc(firestore, 'users', user.uid), {
                username: username,
                profileImageURL: profileImageURL
            });

        } else {
            await signInWithEmailAndPassword(auth, email, password);
        }
        window.location.href = 'index.html';
    } catch (error) {
        alert(error.message);
    }
});
