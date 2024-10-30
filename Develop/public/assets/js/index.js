let noteTitle;
let noteText;
let saveNoteBtn;
let newNoteBtn;
let noteList;

if (window.location.pathname === '/notes') {
  noteTitle = document.querySelector('.note-title');
  noteText = document.querySelector('.note-textarea');
  saveNoteBtn = document.querySelector('.save-note');
  newNoteBtn = document.querySelector('.new-note');
  noteList = document.querySelector('#list-group');
}

let activeNote = {};  // Used to keep track of the note being edited

// Show and hide elements
const show = (elem) => { elem.style.display = 'inline'; };
const hide = (elem) => { elem.style.display = 'none'; };

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
    li.innerText = note.title;

    li.addEventListener('click', () => {
      activeNote = note;
      renderActiveNote();
    });

    noteList.appendChild(li);
  });
};

// Fetch notes and render them to the sidebar
const getAndRenderNotes = () => getNotes().then(renderNoteList);

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

// Event listeners for saving and creating a new note
if (window.location.pathname === '/notes') {
  saveNoteBtn.addEventListener('click', handleNoteSave);
  newNoteBtn.addEventListener('click', () => {
    activeNote = {};
    renderActiveNote();
  });
  noteTitle.addEventListener('input', handleRenderBtns);
  noteText.addEventListener('input', handleRenderBtns);
}

// Initial call to render notes when the page loads
getAndRenderNotes();
