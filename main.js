const { ApolloServer, gql } = require('apollo-server');
const uuidv4 = require('uuid/v4');
const sharedSdk = require('./shared/shared-sdk');

// TODO: Replace with Redis
const notes = [];

const typeDefs = gql`

    type User {
        name: String
    }

    type Note {
        id: String
        message: String
        creator: User
        author: [User]
    }

    type Mutation {
        addNote(message: String): String
        editNote(message: String, id: String): String
    }

    type Subscription {
        noteChanged(id: String!): Note
    }

    type Query {
        notes: [Note]
    }
`;

const NOTE_CHANGED = 'note_changed';

const resolvers = {
    Query: {
        notes: () => notes
    },
    Mutation: {
        addNote: (ctx, note) => {
            const validationErrors = sharedSdk.validator.validateNote(note.message);

            if (validationErrors.length) {
                return;
            }

            notes.push(Object.assign({id: uuidv4()}, note));
        },
        editNote: (ctx, editedNote) => {
            const validationErrors = sharedSdk.validator.validateNote(editedNote.message);

            if (validationErrors.length) {
                return;
            }

            notes.forEach((note, key) => {
                if (note.id === editedNote.id) {
                    notes[key] = Object.assign(notes[key], editedNote);
                    pubsub.publish(NOTE_CHANGED, { noteChanged: note});
                }
            })
        }
    },
    Subscription: {
        noteChanged: {
            subscribe: () => pubsub.asyncIterator(NOTE_CHANGED),
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });
server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`);
});