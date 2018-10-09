import * as React from 'react';
import './App.css';
import Note from './Note';
import NotesService from './NotesService';

class App extends React.Component<any, any> {
    private notesService : NotesService;
    public constructor(props: any) {
        super(props);

        this.state = {
            noteMessage: '',
            notes: []
        };
        this.notesService = new NotesService('http://localhost:4000/graphql');
        this.handleNoteMessageChange = this.handleNoteMessageChange.bind(this);
        this.handleAddNote = this.handleAddNote.bind(this);

        this.loadNotes();
    }

    /**
     * Load all notes from the notes service.
     */
    public loadNotes() {
        this.notesService.getNotes().then(notes => {
            this.setState({ notes })
        });
    }

    /**
     * Add `state.noteMessage` to list of current notes.
     */
    public handleAddNote() {
        this.notesService.addNote(this.state.noteMessage).then(() => {
            this.setState({ noteMessage: '' });
            this.loadNotes();
        })
    }

    /**
     * Update message state when note input updates.
     * 
     * @param event Note message change event.
     */
    public handleNoteMessageChange(event: any) {
        const noteMessage = event.currentTarget.value;

        this.setState({ noteMessage });
    }

    public render() {
        return (
            <div className="App">
              <header className="App-header">
                  <h1 className="App-title">Create a Note to Chat About</h1>
              </header>
              <div className="create-note">
                  <textarea
                      className="create-note_message"
                      onChange={ this.handleNoteMessageChange }
                      value= { this.state.noteMessage } />
                  <button
                      className="create-note_button"
                      onClick={this.handleAddNote}>Add Note
                  </button>
              </div>
              <div className="notes">
              {
                  this.state.notes.map((note: any, index: number) => {
                      return (
                          <Note key={ note.id } id={ note.id } message={ note.message } />
                      );
                  })
              }
              </div>
            </div>
        );
    }
}

export default App;
