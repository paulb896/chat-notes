/**
 *  TODO: Add validator interface
 */

/**
 * Validator that tries to load a dynamic implementation from the server.
 */
class NoteMessageValidator {
    private serverBaseUrl : string = 'http://localhost:4000';
    private messageValidator : any;

    /**
     * Set default validator, and attempt to load message validator from the server.
     */
    constructor() {
        this.messageValidator = {
            validateNote: (rawMessage : string) => (!rawMessage.length)
        };

        // @ts-ignore
        if (SystemJS) {
            // @ts-ignore
            SystemJS.import(`${this.serverBaseUrl}/shared-sdk.js`).then( (sdk : any) => {
                this.messageValidator = sdk.validator;
            });
        }
    }

    public validateNote(message) {
        return this.messageValidator.validateNote(message);
    }
}

export default NoteMessageValidator;