import * as React from 'react';
import NotesService from './NotesService';

import './Note.css';

class Note extends React.Component<any, any> {
    private notesService : NotesService;
    private messageValidator : any;

    constructor(props: any) {
        super(props);
        const { message, id } = props;
        const serverBaseUrl : string = 'http://localhost:4000';

        this.messageValidator = (rawMessage : string) => (!rawMessage.length);

        // @ts-ignore
        SystemJS.import(`${serverBaseUrl}/shared-sdk.js`).then( (sdk : any) => {
            this.messageValidator = sdk.validator;
        });

        this.notesService = new NotesService('http://localhost:4000/graphql');
        this.state = {
            id,
            message
        };
        this.handleNoteMessageChange = this.handleNoteMessageChange.bind(this);
    }



    /**
     * Update message state when note input updates.
     * 
     * @param event Note message change event.
     */
    public handleNoteMessageChange(event: any) {
        const message = event.currentTarget.value;

        if (this.messageValidator.validateNote(message).length === 0) {
            this.notesService.editNote(this.state.id, message);
            this.setState({ message });
        }
    }

    public render() {
        return (
            <div className="note">
                  <textarea
                      className="edit-note_message"
                      onChange={ this.handleNoteMessageChange }
                      value= { this.state.message } />
            </div>
        );
    }
}

export default Note;
