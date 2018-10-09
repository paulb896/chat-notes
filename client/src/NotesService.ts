import ApolloClient, { InMemoryCache } from 'apollo-boost';
import gql from 'graphql-tag';

class NotesService {
    private client : ApolloClient<InMemoryCache>;
    private NOTES_QUERY = gql`
        query ($messageText: String) {
            notes (messageText: $messageText) {
                id
                message
            }
        }
    `;

    constructor(serverBaseUrl: string) {
        this.client = new ApolloClient({
            cache: new InMemoryCache(),
            uri: serverBaseUrl
        });
    }

    /**
     * Get a list of notes.
     * 
     * @returns Promise
     */
    public getNotes(searchText: string) {
        return this.client.query({
            query: this.NOTES_QUERY,
            variables: {
                messageText: searchText
            }
        })
        .then(res => {
            // @ts-ignore
            return res.data.notes;
        });
    }

    /**
     * Attempt to add a new note.
     * 
     * @param {string} message.
     * 
     * @returns Promise
     */
    public addNote(message: string) {
        return this.client.mutate({
            mutation: gql`
                mutation {
                    addNote(message:"${message}") {
                        message
                        id
                    }
                }
            `,
            update: (proxy, { data }) => {
                // @ts-ignore
                const addNote = data.addNote;
                // @ts-ignore
                const cachedNotes : [any] = proxy.readQuery({ query: this.NOTES_QUERY });
                if (cachedNotes) {
                    // @ts-ignore
                    const notes = cachedNotes.notes;
                    notes.push(addNote);

                    // @ts-ignore
                    proxy.writeQuery({ query: this.NOTES_QUERY, notes });
                }
            }
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
        return this.client.mutate({
            mutation: gql`
                mutation {
                    editNote(id: "${id}", message:"${message}") {
                        message
                        id
                    }
                }
            `,
            update: (proxy, { data }) => {
                // @ts-ignore
                const editNote = data.editNote;
                // @ts-ignore
                const cachedNotes : [any] = proxy.readQuery({ query: this.NOTES_QUERY });
                if (cachedNotes) {
                    // @ts-ignore
                    const notes = cachedNotes.notes.map(note => {
                        if (note.id === editNote.id) {
                            note.message = editNote.message;
                        }

                        return note;
                    });

                    // @ts-ignore
                    proxy.writeQuery({ query: this.NOTES_QUERY, notes });
                }
            }
        });
    }
}

export default NotesService;