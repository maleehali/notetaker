let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let clearBtn;
let noteList;
let activeNote = {};  // Track the note being edited

if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  clearBtn = document.querySelector('.clear-btn');
  noteList = document.querySelector('#list-group');
}

// Show and hide elements
const show = (elem) => { elem.style.display = 'inline'; };
const hide = (elem) => { elem.style.display = 'none'; };

// Handle clearing the form
const handleClearForm = () => {
  noteTitle.value = '';
  noteText.value = '';
  activeNote = {};
  hide(saveNoteBtn); // Hide the save button when the form is cleared
};

// Handle creating a new note
const handleNewNote = () => {
  activeNote = {};
  renderActiveNote();
};

// Save a new note to the server
const saveNote = (note) => 
  fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(note),
  });

// Handle saving a note
const handleNoteSave = () => {
  const newNote = {
    title: noteTitle.value,
    text: noteText.value,
  };
  saveNote(newNote).then(() => {
    getAndRenderNotes();  // Refresh note list
    renderActiveNote();    // Reset the note editor
  });
};

// Render the active note in the editor
const renderActiveNote = () => {
  hide(saveNoteBtn);  // Hide save button by default
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

// Show Save button only if there's text in both title and text fields
const handleRenderBtns = () => {
  if (noteTitle.value.trim() && noteText.value.trim()) {
    show(saveNoteBtn);
  } else {
    hide(saveNoteBtn);
  }
};

// Fetch all notes from the server
const getNotes = () => fetch('/api/notes').then((res) => res.json());

// Render list of note titles in the sidebar
const renderNoteList = (notes) => {
  // Clear the note list container first
  noteList.innerHTML = '';

  notes.forEach((note) => {
    // Create a list item for each note
    const li = document.createElement('li');
    li.classList.add('list-group-item');
    li.dataset.note = JSON.stringify(note);


     // Create a span for the note title text
    const span = document.createElement('span');
    span.classList.add('list-item-title');
    span.innerText = note.title;
    span.addEventListener('click', handleNoteView); // View note on click

    // Add delete icon
    const delBtn = document.createElement('i');
    delBtn.classList.add('fas', 'fa-trash-alt', 'float-right', 'text-danger', 'delete-note');
    delBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleNoteDelete(note.id);
    });

     // Append the title span and delete icon to the list item
     li.appendChild(span);
     li.appendChild(delBtn);
     li.addEventListener('click', handleNoteView);

    // Append the list item to the note list container
    noteList.appendChild(li);
  });
};

// Refresh note list and render sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);
getAndRenderNotes(); // Refresh the note list after deletion

// Display selected note in the editor
const handleNoteView = (event) => {
  event.preventDefault();
  const selectedNote = JSON.parse(event.target.parentElement.dataset.note);
  activeNote = selectedNote;
  renderActiveNote();
};

// Delete a note from the server
const deleteNote = (id) =>
  fetch(`/api/notes/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

// Function to delete a note
const handleNoteDelete = (id) => {
  deleteNote(id).then(() => {
    renderActiveNote(); // Clear the note editor if the deleted note was active
  });
};

// Event listeners
if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', handleNewNote);
  clearBtn.addEventListener('click', handleClearForm);
  noteTitle.addEventListener('input', handleRenderBtns);
  noteText.addEventListener('input', handleRenderBtns);
}

// Initial rendering of notes on page load
getAndRenderNotes();
