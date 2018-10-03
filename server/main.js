const uuidv4 = require('uuid/v4');
const Koa = require('koa');
const koaStatic = require('koa-static');
const { ApolloServer, gql } = require('apollo-server-koa');
const sharedSdk = require('./shared/shared-sdk');
const client = {
    set: () => {},
    get: () => {}
};

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

            client.set(`notes-${note.id}`, note);

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









