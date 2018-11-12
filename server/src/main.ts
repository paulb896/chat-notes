import 'babel-polyfill';
const Koa = require('koa');
const koaStatic = require('koa-static');
const { ApolloServer, gql } = require('apollo-server-koa');
const sharedSdk = require('./shared/shared-sdk');
const NotesClient = require('./NotesClient');
const notesClient = new NotesClient();

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

    input NoteInput {
        message: String
        id: String
    }

    type Mutation {
        addNote(note: NoteInput) : Note
        editNote(note: NoteInput) : Note
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
        notes: async (ctx, args) => {
            const { messageText } = args;

            return notesClient.getNotes(messageText);
        }
    },
    Mutation: {
        addNote: (ctx, { note }) => {
            const validationErrors = sharedSdk.validator.validateNote(note.message);

            if (validationErrors.length) {
                return;
            }

            return notesClient.addNote(note.message);
        },
        editNote: (ctx, { note }) => {
            const validationErrors = sharedSdk.validator.validateNote(note.message);

            if (!note.id || validationErrors.length) {
                return;
            }

            return notesClient.editNote(note.id, note.message);
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
const SHARED_MODULE_DIRECTORY = __dirname + '/shared';
app.use(koaStatic(SHARED_MODULE_DIRECTORY));

app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    ctx.set('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    await next();
});



server.applyMiddleware({ app });

app.listen({ port: 4000 }, () =>
    console.log(`Server ready at http://localhost:4000${server.graphqlPath}`),
);









