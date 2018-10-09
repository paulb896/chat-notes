
class NotesService {
    private serverBaseUrl: string;

    constructor(serverBaseUrl: string) {
        this.serverBaseUrl = serverBaseUrl;
    }

    /**
     * Get a list of notes.
     * 
     * @returns Promise
     */
    public getNotes() {
        return fetch(this.serverBaseUrl, {
            body: JSON.stringify({ query: '{ notes { message id } }' }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST'
        })
        .then(res => res.json())
        .then(res => res.data.notes);
    }

    /**
     * Attempt to add a new note.
     * 
     * @param {string} message.
     * 
     * @returns Promise
     */
    public addNote(message: string) {
        return fetch(this.serverBaseUrl, {
            body: JSON.stringify({ query: `mutation{ addNote (message: "${message}") }` }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST'
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
    public editNote(id: string, message: string) {
        return fetch(this.serverBaseUrl, {
            body: JSON.stringify({ query: `mutation{ editNote (message: "${message}", id: "${id}") }` }),
            headers: { 'Content-Type': 'application/json' },
            method: 'POST'
        });
    }
}

export default NotesService;