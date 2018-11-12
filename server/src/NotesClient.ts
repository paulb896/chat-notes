const uuidv4 = require('uuid/v4');
const circuitBreaker = require('opossum');

// TODO: Convert to Redis Storage
const notes = [];

module.exports = class NotesClient {
    loadNotesWithBreaker: { fire(...args: any[]): Promise<any> };

    constructor() {
        const options = {
            timeout: 3000,
            errorThresholdPercentage: 50,
            resetTimeout: 10000
        };

        this.loadNotesWithBreaker = circuitBreaker(this.loadNotes, options);
    }

    /**
     * Load notes that match given search text.
     * 
     * @param {string} searchMessageText
     * 
     * @returns Array
     */
    loadNotes(searchMessageText) {
        return notes.filter((note) => {
            return !searchMessageText || note.message.toLowerCase().indexOf(searchMessageText.toLowerCase()) >= 0;
        });
    }

    /**
     * Call breaker to load notes.
     *
     * @param {string} searchMessageText
     * 
     * @returns Promise<Array>
     */
    getNotes(searchMessageText) {
        return this.loadNotesWithBreaker.fire(searchMessageText)
            .catch(console.error);
    }

    /**
     * Add a note with the message, and return it.
     *
     * @param {string} message
     *
     * @returns Object
     */
    addNote(message) {
        const note = {
            id: uuidv4(),
            message
        };

        notes.push(note);

        return note;
    }

    /**
     * Edit a note with the given search text, and return it.
     *
     * @param {string} message
     *
     * @returns Object
     */
    editNote(id, message) {
        let editedNote;

        notes.forEach((note, key) => {
            if (id === note.id) {
                notes[key].message = message;
            }
        });

        return editedNote;
    }
}