import { firestore } from './firebase-config.js';
import { getFirestore, collection, addDoc, getDocs, query,Timestamp, orderBy, where, doc, deleteDoc,writeBatch,getDoc,updateDoc  } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";


document.addEventListener('DOMContentLoaded', async function() {


    
    const modalsContainer = document.getElementById('modals-container');

    // Function to load modal content from a URL
    const loadModals = async () => {
       try {
           const response = await fetch('modals.html');
           if (!response.ok) throw new Error('Failed to load modals');
           const text = await response.text();
           modalsContainer.innerHTML = text;
   
           // Attach event listeners to trigger buttons
           document.getElementById('add_folder').addEventListener('click', () => {
               showModal('newFolderModal');
           });
   
           document.getElementById('add_note').addEventListener('click', () => {
               showModal('newNoteModal');
           });
   
           // Attach event listeners to close buttons inside modals
           document.querySelectorAll('.closeModal').forEach(button => {
               button.addEventListener('click', () => {
                   hideModal(button.closest('.modal').id);
                   
               });
           });
   
           // Close modal when clicking outside of the modal content
           document.querySelectorAll('.modal').forEach(modal => {
               modal.addEventListener('click', (e) => {
                   if (e.target === modal) {
                       hideModal(modal.id);
                   }
               });
           });
   
           // Handle sidebar and button states
           document.querySelectorAll('.sidebar a').forEach(button => {
               button.addEventListener('click', () => {
                   document.querySelectorAll('.sidebar a').forEach(btn => btn.classList.remove('bg-blue-100', 'text-blue-700'));
                   button.classList.add('bg-blue-100', 'text-blue-700');
               });
           });
   
           // Handle the active status for note buttons
           document.querySelectorAll('#today_note_button, #week_note_button, #month_note_button').forEach(button => {
               button.addEventListener('click', () => {
                   toggleActiveButton(button, '#today_note_button, #week_note_button, #month_note_button');
               });
           });
   
           // Handle the active status for folder buttons
           document.querySelectorAll('#today_button, #week_button, #month_button').forEach(button => {
               button.addEventListener('click', () => {
                   toggleActiveButton(button, '#today_button, #week_button, #month_button');
               });
           });
        }catch (error) {
            console.error('Error loading modals:', error);
        }
    };

     // Handle color selection
   document.querySelectorAll('.color-option').forEach(option => {
    option.addEventListener('click', (e) => {
        selectColor(e.target.dataset.color);
    });
});

// Set the selected color
const selectColor = (colorClass) => {
    const colorInput = document.getElementById('newNoteColor');
    if (colorInput) {
        colorInput.value = colorClass; // Correctly set the value of the hidden input
    } else {
        console.error('Element with ID newNoteColor not found');
    }
};
    // Show modal function
   const showModal = (modalId) => {
    document.getElementById(modalId).classList.remove('hidden');
};

// Hide modal function
const hideModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
};

// Toggle active class for buttons
const toggleActiveButton = (activeButton, selector) => {
    document.querySelectorAll(selector).forEach(button => {
        if (button === activeButton) {
            button.classList.add('font-bold', 'text-gray-700', 'border-b-2', 'border-gray-700');
            button.classList.remove('text-gray-500');
        } else {
            button.classList.remove('font-bold', 'text-gray-700', 'border-b-2', 'border-gray-700');
            button.classList.add('text-gray-500');
        }
    });
};

// Load modals on page load
loadModals();       




   
});
