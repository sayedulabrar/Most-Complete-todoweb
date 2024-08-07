import { firestore } from './firebase-config.js'; // Import firestore from the config file
import { getFirestore, collection, addDoc, getDocs, query, Timestamp, orderBy, where, doc, deleteDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {
    const notesContainer = document.querySelector('#notelist');
    let showAll = false; // Track if showing all notes or limited to 3

    // Fetch notes from Firestore
    const notesQuery = query(collection(firestore, 'notes'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(notesQuery);

    // Clear existing notes, but keep the "Add Note" button
    const addNoteButton = notesContainer.querySelector('#add_note');
    notesContainer.innerHTML = '';
    notesContainer.appendChild(addNoteButton);

    // Add fetched notes to the UI
    let notes = [];
    querySnapshot.forEach((doc) => {
        const note = doc.data();
        notes.push({ id: doc.id, ...note });
    });
    displayNotes(notes, showAll);

    // Event listener for creating a new note
    document.getElementById('createNoteBtn').addEventListener('click', async function() {
        console.log('Create Note button clicked');
        const date = document.getElementById('newNoteDate').value;
        const time = document.getElementById('newNoteTime').value;
        const title = document.getElementById('newNoteTitle').value;
        const description = document.getElementById('newNoteDescription').value;
        const folderName = document.getElementById('newNoteFolder').value;
        const color = document.getElementById('colorSelector').value || 'blue'; // Default color

        if (!date || !time || !title || !description || !folderName) {
            console.log('All fields are required');
            return;
        }

        try {
            // Check if folder exists
            const foldersRef = collection(firestore, 'folders');
            const folderQuery = query(foldersRef, where('name', '==', folderName));
            const folderSnapshot = await getDocs(folderQuery);

            if (folderSnapshot.empty) {
                alert('Folder does not exist. Please create the folder first.');
                return;
            }

            // Use existing folder ID
            const folderId = folderSnapshot.docs[0].id;

            // Create note with separate date and time fields
            const noteDocRef = await addDoc(collection(firestore, 'notes'), {
                date: date,
                time: time,
                title: title,
                description: description,
                folderId: folderId,
                color: color
            });
            console.log('Document written with ID: ', noteDocRef.id);

            // Close modal
            document.getElementById('newNoteModal').classList.add('hidden');

            // Update UI
            const newNote = { id: noteDocRef.id, date, time, title, description, folderId, color };
            notes.push(newNote);
            displayNotes(notes, showAll);
        } catch (e) {
            console.error('Error adding document: ', e);
        }
    });

    // Event listener for toggling "Show All" notes
    document.getElementById('show_all_notes').addEventListener('click', () => {
        showAll = !showAll;
        displayNotes(notes, showAll);
    });
});

function displayNotes(notes, showAll) {
    const notesContainer = document.querySelector('#notelist');
    const addNoteButton = notesContainer.querySelector('#add_note');

    // Clear existing notes, but keep the "Add Note" button
    notesContainer.innerHTML = '';
    notesContainer.appendChild(addNoteButton);

    // Sort notes by date descending
    notes.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display notes
    const notesToShow = showAll ? notes : notes.slice(0, 3);
    notesToShow.forEach(note => addNoteToUI(note));
}

function addNoteToUI(note) {
    const { id, date, time, title, description, color } = note;

    // Check if the note already exists in the UI
    if (document.querySelector(`[data-note-id="${id}"]`)) {
        return; // If it exists, don't add it again
    }

    // Convert color name to Tailwind CSS class
    const colorClass = `bg-${color}-100`; // Adjust the color classes as needed

    const noteElement = document.createElement('div');
    noteElement.className = `${colorClass} p-4 rounded-xl shadow relative note-card`;
    noteElement.setAttribute('data-note-id', id);
    noteElement.innerHTML = `
        <div class="flex justify-between items-start relative min-h-[4rem]"> <!-- Add min-height for consistency -->
            <h3 class="text-lg font-bold mb-2 truncate">${title}</h3> <!-- Added truncate to ensure long titles don't overflow -->
            <div class="relative flex items-center"> <!-- Ensure vertical alignment with flex items-center -->
                <i class="fa-solid fa-square-pen cursor-pointer" data-id="${id}" title="More options"></i>
                <div class="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 pointer-events-none transition-opacity duration-300 dropdown-menu" id="dropdown-${id}">
                    <ul class="py-1">
                        <li><button class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onclick="editNote('${id}')">Edit</button></li>
                        <li><button class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onclick="deleteNote('${id}')">Delete</button></li>
                    </ul>
                </div>
            </div>
        </div>
        <p class="text-sm text-gray-500">${date}</p>
        <p class="text-sm truncate-2-lines">${description}</p> <!-- Added truncate class for description -->
        <p class="text-sm text-gray-500 mt-2">${time}</p>
    `;

    const notesContainer = document.querySelector('#notelist');
    const addNoteButton = notesContainer.querySelector('#add_note');
    notesContainer.insertBefore(noteElement, addNoteButton);

    // If we have more than 3 notes, remove the oldest one
    const noteCards = notesContainer.querySelectorAll('.note-card');
    if (noteCards.length > 3 && !showAll) {
        noteCards[0].remove();
    }

    // Add event listener to the icon to toggle the dropdown menu
    const icon = noteElement.querySelector('.fa-square-pen');
    const dropdownMenu = noteElement.querySelector('.dropdown-menu');

    icon.addEventListener('click', () => {
        dropdownMenu.classList.toggle('opacity-100');
        dropdownMenu.classList.toggle('pointer-events-auto');
    });

    // Close the dropdown if clicking outside
    document.addEventListener('click', (event) => {
        if (!noteElement.contains(event.target)) {
            dropdownMenu.classList.remove('opacity-100');
            dropdownMenu.classList.remove('pointer-events-auto');
        }
    });
}

// Delete a note from Firestore and UI
async function deleteNote(noteId) {
    try {
        // Reference to the note document
        const noteDocRef = doc(firestore, 'notes', noteId);

        // Delete the note document from Firestore
        await deleteDoc(noteDocRef);
        console.log('Note deleted successfully');

        // Remove the note from the UI
        const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
        if (noteElement) {
            noteElement.remove();
        }
    } catch (error) {
        console.error('Error deleting note: ', error);
    }
}

async function editNote(noteId) {
    try {
        // Fetch note details
        const noteRef = doc(firestore, 'notes', noteId);
        const noteDoc = await getDoc(noteRef);
        if (!noteDoc.exists()) {
            console.error('No such document!');
            return;
        }

        const note = noteDoc.data();

        // Fetch folder name using folderId
        const folderRef = doc(firestore, 'folders', note.folderId);
        const folderDoc = await getDoc(folderRef);
        if (!folderDoc.exists()) {
            console.error('Folder does not exist!');
            return;
        }

        const folderName = folderDoc.data().name;

        // Populate modal with note data
        document.getElementById('editNoteDate').value = note.date;
        document.getElementById('editNoteTime').value = note.time;
        document.getElementById('editNoteTitle').value = note.title;
        document.getElementById('editNoteDescription').value = note.description;
        document.getElementById('editNoteFolder').value = folderName; // Set folder name
        document.getElementById('editColorSelector').value = note.color;

        // Update button action
        const updateNoteBtn = document.getElementById('updateNoteBtn');
        updateNoteBtn.onclick = async function() {
            const updatedDate = document.getElementById('editNoteDate').value;
            const updatedTime = document.getElementById('editNoteTime').value;
            const updatedTitle = document.getElementById('editNoteTitle').value;
            const updatedDescription = document.getElementById('editNoteDescription').value;
            const updatedFolderName = document.getElementById('editNoteFolder').value;
            const updatedColor = document.getElementById('editColorSelector').value || 'blue'; // Default color

            if (!updatedDate || !updatedTime || !updatedTitle || !updatedDescription || !updatedFolderName) {
                console.log('All fields are required');
                return;
            }

            try {
                // Check if folder exists
                const foldersRef = collection(firestore, 'folders');
                const folderQuery = query(foldersRef, where('name', '==', updatedFolderName));
                const folderSnapshot = await getDocs(folderQuery);

                if (folderSnapshot.empty) {
                    alert('Folder does not exist. Please create the folder first.');
                    return;
                }

                // Use existing folder ID
                const folderId = folderSnapshot.docs[0].id;

                // Update note
                await updateDoc(noteRef, {
                    date: updatedDate,
                    time: updatedTime,
                    title: updatedTitle,
                    description: updatedDescription,
                    folderId: folderId,
                    color: updatedColor
                });
                console.log('Document updated with ID: ', noteId);

                // Close modal
                document.getElementById('editNoteModal').classList.add('hidden');

                // Update UI
                const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
                if (noteElement) {
                    noteElement.querySelector('h3').textContent = updatedTitle;
                    noteElement.querySelector('p.text-sm.text-gray-500').textContent = updatedDate;
                    noteElement.querySelector('p.text-sm.truncate-2-lines').textContent = updatedDescription;
                    noteElement.querySelector('p.text-sm.text-gray-500.mt-2').textContent = updatedTime;
                    noteElement.style.backgroundColor = `var(--${updatedColor}-100)`;
                }

            } catch (e) {
                console.error('Error updating document: ', e);
            }
        };

        // Show the edit modal
        document.getElementById('editNoteModal').classList.remove('hidden');
    } catch (e) {
        console.error('Error fetching document: ', e);
    }
}

// Expose the deleteNote function to the global scope
window.deleteNote = deleteNote;
window.editNote = editNote;
