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
        notes: async (ctx, args) => {
            const { messageText } = args;

            return notesClient.getNotes(messageText);
        }
    },
    Mutation: {
        addNote: (ctx, args) => {
            const validationErrors = sharedSdk.validator.validateNote(args.message);

            if (validationErrors.length) {
                return;
            }

            return notesClient.addNote(args.message);
        },
        editNote: (ctx, updatedNote) => {
            const validationErrors = sharedSdk.validator.validateNote(updatedNote.message);

            if (!updatedNote.id || validationErrors.length) {
                return;
            }

            return notesClient.editNote(updatedNote.id, updatedNote.message);
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
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`),
);









