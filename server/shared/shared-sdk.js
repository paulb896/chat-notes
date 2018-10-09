(function() {
    const NOTE_CHARACTER_LIMIT = 60;
    let SharedSdk = (function() {
        return {
            /**
             * Validator object containing validator methods
             */
            validator: {
                /**
                 * Validate a given note message and return any validation errors.
                 * 
                 * @param string message Note message
                 * 
                 * @returns Array
                 */
                validateNote: (message) => {
                    const errors = [];

                    if (!message) {
                        errors.push('Note message cannot be empty');
                    }

                    if (message.length > NOTE_CHARACTER_LIMIT) {
                        errors.push(`Note cannot be more than ${NOTE_CHARACTER_LIMIT} characters`);
                    }

                    return errors;
                }
            }
        };
    })();

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = SharedSdk;
    } else {
        window.SharedSdk = SharedSdk;
    }
})();