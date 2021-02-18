const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { MONGO_DB } = require('./config');

const server = new ApolloServer({
    typeDefs,
    resolvers
});

mongoose.connect(MONGO_DB, { useNewUrlParser: true })
    .then(() => server.listen({ port: 5000 }))
    .then(res => console.log(`Server running at ${res.url}`));
    