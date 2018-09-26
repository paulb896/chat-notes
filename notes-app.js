(function() {
    class NotesApp {
        /**
         * @param {NotesService} notesService 
         * @param {SharedSdk} sharedSdk 
         */
        constructor(notesService, sharedSdk) {
            this.notesElement = document.getElementById('notes');
            this.noteAddButtonElement = document.getElementById('add-note-button');
            this.noteAddMessageElement = document.getElementById('add-note-input');
            this.noteAddErrorsElement = document.getElementById('note-errors');
            this.notesService = notesService;
            this.sharedSdk = sharedSdk;

            this.addInputListeners();
            notesService.getNotes().then(notes => this.renderNotes(notes));
        }

        /**
         * Add click listener for create note attempt.
         */
        addInputListeners() {
            this.noteAddButtonElement.addEventListener('click', () => {
                const noteMessage = this.noteAddMessageElement.value;
                const noteErrors = this.sharedSdk.validator.validateNote(noteMessage);

                if (noteErrors.length) {
                    this.renderNoteErrors(noteErrors);

                    return;
                }

                this.notesService.addNote(noteMessage).then(() => {
                    this.noteAddMessageElement.value = '';
                    this.notesService.getNotes().then(notes => this.renderNotes(notes));
                });
            });
        }

        /**
         * Render a given list of note message errors and hide them after a couple seconds.
         *
         * @param {Array} noteMessageErrors Shown when note message is invalid.
         */
        renderNoteErrors(noteMessageErrors) {
            const noteAddErrorsElement = this.noteAddErrorsElement || document.getElementById('note-errors');

            noteAddErrorsElement.innerHTML = '';
            noteMessageErrors.forEach(noteError => {
                const errorElement = document.createElement('div');

                errorElement.innerHTML = noteError;
                errorElement.classList.add('note-error');
                noteAddErrorsElement.appendChild(errorElement);
            });

            setTimeout(() => {
                noteAddErrorsElement.innerHTML = '';
            }, 2000)
        }

        /**
         * Render a note element for each of the given list of notes.
         *
         * @param {Array} notes Note objects.
         */
        renderNotes(notes) {
            this.notesElement.innerHTML = '';
            const notesService = this.notesService;
            const validateNote = this.sharedSdk.validator.validateNote;
            const self = this;

            notes.map(note => {
                const noteElement = document.createElement('div');

                noteElement.innerHTML = note.message;
                noteElement.classList.add('note');
                noteElement.contentEditable = true;
                noteElement.addEventListener('keydown', (event) => {
                    const noteText = noteElement.innerHTML;
                    const noteErrors = validateNote(noteText);

                    if (noteErrors.length) {
                        self.renderNoteErrors(noteErrors);

                        return;
                    }

                    notesService.editNote(note.id, noteElement.innerHTML);
                });
                this.notesElement.appendChild(noteElement);
            });
        }
    }

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = NotesApp;
    } else {
        window.NotesApp = NotesApp;
    }
})();