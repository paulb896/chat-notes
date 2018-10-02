(function() {
    class NotesService {
        constructor(serverBaseUrl) {
            this.serverBaseUrl = serverBaseUrl;
        }

        /**
         * Get a list of notes.
         * 
         * @returns Promise
         */
        getNotes() {
            return fetch(this.serverBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ notes { message id } }' })
            })
            .then(res => res.json())
            .then(res => res.data.notes);
        }

        /**
         * Attempt to add a new note.
         * 
         * @param {Object} message.
         * 
         * @returns Promise
         */
        addNote(message) {
            return fetch(this.serverBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: `mutation{ addNote (message: "${message}") }` })
            });
        }

        /**
         * Edit a note message with the given id.
         * 
         * @param {String} id Note Id
         * @param {String} message Note message.
         * 
         * @returns Promise
         */
        editNote(id, message) {
            return fetch(this.serverBaseUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: `mutation{ editNote (message: "${message}", id: "${id}") }` })
            });
        }
    }
        
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = NotesService;
    } else {
        window.NotesService = NotesService;
    }
})();