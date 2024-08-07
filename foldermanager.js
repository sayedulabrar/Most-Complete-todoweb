import { firestore } from './firebase-config.js'; // Import firestore from the config file
import { getFirestore, collection, addDoc, getDocs, query, Timestamp, orderBy, where, doc, deleteDoc, writeBatch, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function() {
    const folderContainer = document.querySelector('#folderlist');
    let showAllFolders = false; // Track if showing all folders or limited to 3

    // Fetch folders from Firestore
    const folderQuery = query(collection(firestore, 'folders'), orderBy('lastVisited', 'desc'));
    const querySnapshot2 = await getDocs(folderQuery);

    // Clear existing folders, but keep the "Add Folder" button
    const addFolderButton = folderContainer.querySelector('#add_folder');
    folderContainer.innerHTML = '';
    if (addFolderButton) {
        folderContainer.appendChild(addFolderButton);
    } else {
        console.error('Add folder button not found');
        alert('Folder button not found');
    }

    // Add fetched folders to the UI
    let folders = [];
    querySnapshot2.forEach((doc) => {
        const folder = doc.data();
        folders.push({ id: doc.id, ...folder });
    });
    displayFolders(folders, showAllFolders);

    // Event listener for creating a new folder
    document.getElementById('createFolderBtn').addEventListener('click', async function() {
        console.log('Create folder button clicked');
        const folderName = document.getElementById('newFolderName').value;
        const color = document.getElementById('colorSelectorFolder').value || 'blue'; // Default color

        if (!folderName) {
            alert('All fields are required');
            return;
        }

        try {
            // Check if folder exists
            const foldersRef = collection(firestore, 'folders');
            const folderQuery = query(foldersRef, where('name', '==', folderName));
            const folderSnapshot = await getDocs(folderQuery);

            if (!folderSnapshot.empty) {
                // Folder exists
                alert('Folder already exists...');
                return;
            }

            // Create folder
            const folderDocRef = await addDoc(collection(firestore, 'folders'), {
                createdAt: new Date(),
                name: folderName,
                color: color,
                lastVisited: new Date()
            });
            console.log('Document folder written with ID: ', folderDocRef.id);

            // Close modal
            document.getElementById('newFolderModal').classList.add('hidden');

            // Update UI
            const newFolder = { id: folderDocRef.id, name: folderName, color: color, lastVisited: new Date() };
            folders.push(newFolder);
            displayFolders(folders, showAllFolders);
        } catch (e) {
            console.error('Error adding document: ', e);
        }
    });

    // Event listener for toggling "Show All" folders
    document.getElementById('show_all_folders').addEventListener('click', () => {
        showAllFolders = !showAllFolders;
        displayFolders(folders, showAllFolders);
    });
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Function to convert Firebase timestamp to JavaScript Date
function convertToDate(firebaseTimestamp) {
    // Assuming firebaseTimestamp is a Firestore Timestamp object
    if (firebaseTimestamp instanceof Timestamp) {
        return firebaseTimestamp.toDate(); // Converts Firestore Timestamp to JavaScript Date
    }
    // If it's already a JavaScript Date object or a string that can be parsed
    return new Date(firebaseTimestamp);
}

function displayFolders(folders, showAll) {
    const folderContainer = document.querySelector('#folderlist');
    const addFolderButton = folderContainer.querySelector('#add_folder');

    // Clear existing folders, but keep the "Add Folder" button
    folderContainer.innerHTML = '';
    folderContainer.appendChild(addFolderButton);

    // Sort folders by lastVisited descending
    folders.sort((a, b) => new Date(b.lastVisited) - new Date(a.lastVisited));

    // Display folders
    const foldersToShow = showAll ? folders : folders.slice(0, 3);
    foldersToShow.forEach(folder => addFolderToUI(folder));
}

function addFolderToUI(folder) {
    const { id, name, color, lastVisited } = folder;
    const dateObject = convertToDate(lastVisited);

    // Check if the folder already exists in the UI
    if (document.querySelector(`[data-folder-id="${id}"]`)) {
        return; // If it exists, don't add it again
    }

    // Convert color name to Tailwind CSS class
    const colorClass = `bg-${color}-100`; // Adjust the color classes as needed

    const folderElement = document.createElement('div');
    folderElement.className = `${colorClass} p-4 rounded shadow relative folder-card`;
    folderElement.setAttribute('data-folder-id', id);
    folderElement.innerHTML = `
        <div class="relative flex items-center"> <!-- Add dropdown menu to folders -->
            <i class="fa-duotone fa-solid fa-file mr-2 fa-2x"></i>
            <i class="fas fa-ellipsis-h absolute top-2 right-2 text-gray-500 cursor-pointer" data-id="${id}" title="More options"></i>
            <div class="absolute right-0 mt-2 w-40 bg-white border border-gray-300 rounded-lg shadow-lg opacity-0 pointer-events-none transition-opacity duration-300 dropdown-menu" id="dropdown-${id}">
                <ul class="py-1">
                    <li><button class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onclick="editFolder('${id}')">Edit</button></li>
                    <li><button class="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100" onclick="deleteFolder('${id}')">Delete</button></li>
                </ul>
            </div>
        </div>
        <h3 class="text-lg font-bold mb-2">${name}</h3>
        <p class="text-sm text-gray-500">${formatDate(dateObject)}</p>
    `;

    const folderContainer = document.querySelector('#folderlist');
    const addFolderButton = folderContainer.querySelector('#add_folder');
    folderContainer.insertBefore(folderElement, addFolderButton);

    // If we have more than 3 folders, remove the oldest one
    const folderCards = folderContainer.querySelectorAll('.folder-card');
    
    if (!document.getElementById('notelist').classList.contains('hidden')) {
        // If notes section is visible, proceed with removal
        if (folderCards.length > 3 && !showAllFolders) {
            folderCards[0].remove();
        }
    }

    // Add event listener to the icon to toggle the dropdown menu
    const icon = folderElement.querySelector('.fa-ellipsis-h');
    const dropdownMenu = folderElement.querySelector('.dropdown-menu');

    icon.addEventListener('click', () => {
        dropdownMenu.classList.toggle('opacity-100');
        dropdownMenu.classList.toggle('pointer-events-auto');
    });

    // Close the dropdown if clicking outside
    document.addEventListener('click', (event) => {
        if (!folderElement.contains(event.target)) {
            dropdownMenu.classList.remove('opacity-100');
            dropdownMenu.classList.remove('pointer-events-auto');
        }
    });
}
// foldermanager.js

async function deleteFolder(folderId) {
    try {
        // Query to find all notes associated with the folder
        const notesQuery = query(collection(firestore, 'notes'), where('folderId', '==', folderId));
        const notesSnapshot = await getDocs(notesQuery);

        // Call deleteNote for each note
        notesSnapshot.forEach(doc => {
            deleteNote(doc.id);
        });

        // Delete the folder itself
        await deleteDoc(doc(firestore, 'folders', folderId));
        console.log('Folder successfully deleted');

        // Update the UI
        const folderElement = document.querySelector(`[data-folder-id="${folderId}"]`);
        if (folderElement) {
            folderElement.remove();
        }
    } catch (error) {
        console.error('Error deleting folder or notes: ', error);
    }
}



async function editFolder(folderId) {
    try {
        // Fetch folder details
        const folderRef = doc(firestore, 'folders', folderId);
        const folderDoc = await getDoc(folderRef);
        if (!folderDoc.exists()) {
            console.error('No such folder!');
            return;
        }

        const folder = folderDoc.data();

        // Populate modal with folder data
        document.getElementById('editFolderName').value = folder.name;
        document.getElementById('editColorSelectorFolder').value = folder.color;

        // Update button action
        const updateFolderBtn = document.getElementById('updateFolderBtn');
        updateFolderBtn.onclick = async function() {
            const updatedFolderName = document.getElementById('editFolderName').value;
            const updatedColor = document.getElementById('editColorSelectorFolder').value || 'blue'; // Default color

            if (!updatedFolderName) {
                console.log('Folder name is required');
                return;
            }

            try {
                // Update folder
                await updateDoc(folderRef, {
                    name: updatedFolderName,
                    color: updatedColor
                });
                console.log('Folder updated with ID: ', folderId);

                // Close modal
                document.getElementById('editFolderModal').classList.add('hidden');

            } catch (e) {
                console.error('Error updating folder: ', e);
            }
        };

        // Show the edit modal
        document.getElementById('editFolderModal').classList.remove('hidden');
    } catch (e) {
        console.error('Error fetching folder: ', e);
    }
}

window.deleteFolder = deleteFolder
window.editFolder = editFolder