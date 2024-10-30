let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let clearBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn'); // Select the clear button
  noteList = document.querySelector('#list-group');
}

let activeNote = {};  // Used to keep track of the note being edited

// Show and hide elements
const show = (elem) => { elem.style.display = 'inline'; };
const hide = (elem) => { elem.style.display = 'none'; };

// Clear Form Function
const handleClearForm = () => {
  noteTitle.value = '';
  noteText.value = '';
  activeNote = {};
  hide(saveNoteBtn); // Hide the save button when the form is cleared
};

// Fetch all notes from the server
const getNotes = () => fetch('/api/notes').then((res) => res.json());

// Save a new note to the server
const saveNote = (note) =>
  fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });

// Render the list of note titles in the sidebar
const renderNoteList = (notes) => {
  noteList.innerHTML = '';

  notes.forEach((note) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.dataset.note = JSON.stringify(note);

    const span = document.createElement('span');
    span.classList.add('list-item-title');
    span.innerText = note.title;
    span.addEventListener('click', handleNoteView);

    // Add the delete icon
    const delBtn = document.createElement('i');
    delBtn.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevents triggering the note view event
      handleNoteDelete(note.id); // Calls the delete function with the note ID
    });

    li.appendChild(span);
    li.appendChild(delBtn); // Append the delete icon to the list item

    noteList.appendChild(li);
  });
};

// Handle note delete function
const handleNoteDelete = (id) => {
  deleteNote(id).then(() => {
    getAndRenderNotes(); // Refresh the note list after deletion
    renderActiveNote();
  });
};

const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

// Render the active note in the editor
const renderActiveNote = () => {
  if (activeNote.id) {
    noteTitle.setAttribute('readonly', true);
    noteText.setAttribute('readonly', true);
    noteTitle.value = activeNote.title;
    noteText.value = activeNote.text;
  } else {
    noteTitle.removeAttribute('readonly');
    noteText.removeAttribute('readonly');
    noteTitle.value = '';
    noteText.value = '';
  }
};

// Handle saving a new note
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Show Save button only if there's text in both title and text fields
const handleRenderBtns = () => {
  if (noteTitle.value.trim() && noteText.value.trim()) {
    show(saveNoteBtn);
  } else {
    hide(saveNoteBtn);
  }
};

// Event listeners
if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', () => {
    activeNote = {};
    renderActiveNote();
  });
  clearBtn.addEventListener('click', handleClearForm); // Add the event listener for clearing form
  noteTitle.addEventListener('input', handleRenderBtns);
  noteText.addEventListener('input', handleRenderBtns);
}

// Initial call to render notes when the page loads
const getAndRenderNotes = () => getNotes().then(renderNoteList);
getAndRenderNotes();

// Function to handle displaying a note when clicked in the sidebar
const handleNoteView = (event) => {
  event.preventDefault();
  const selectedNote = JSON.parse(event.target.parentElement.dataset.note);
  activeNote = selectedNote;
  renderActiveNote();
};