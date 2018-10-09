const uuidv4 = require('uuid/v4');
const Koa = require('koa');
const koaStatic = require('koa-static');
const { ApolloServer, gql } = require('apollo-server-koa');
const sharedSdk = require('./shared/shared-sdk');

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
        addNote(message: String) : Note
        editNote(message: String, id: String) : Note
    }

    type Subscription {
        noteChanged(id: String!): Note
    }

    type Query {
        notes(messageText: String): [Note]
    }
`;

const NOTE_CHANGED = 'note_changed';

const resolvers = {
    Query: {
        notes: (ctx, args) => {
            const { messageText } = args;

            return notes.filter((note) => {
                return !messageText || note.message.toLowerCase().indexOf(messageText.toLowerCase()) >= 0;
            });
        }
    },
    Mutation: {
        addNote: (ctx, note) => {
            const validationErrors = sharedSdk.validator.validateNote(note.message);

            if (validationErrors.length) {
                return;
            }

            const addedNote = Object.assign({id: uuidv4()}, note);

            notes.push(addedNote);

            return addedNote;
        },
        editNote: (ctx, updatedNote) => {
            const validationErrors = sharedSdk.validator.validateNote(updatedNote.message);

            if (validationErrors.length) {
                return;
            }

            let editedNote;

            notes.forEach((note, key) => {
                if (note.id === updatedNote.id) {
                    editedNote = updatedNote;
                    notes[key] = Object.assign(notes[key], editedNote);
                }
            });

            return editedNote;
        }
    },
    Subscription: {
        noteChanged: {
            subscribe: () => pubsub.asyncIterator(NOTE_CHANGED)
        }
    }
};

const server = new ApolloServer({ typeDefs, resolvers });
const app = new Koa();
const SHARED_MODULE_DIRECTORY = 'shared';

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    await next();
});

app.use(koaStatic(SHARED_MODULE_DIRECTORY));

server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);









