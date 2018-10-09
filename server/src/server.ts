import { ApolloServer } from 'apollo-server-express';
import * as express from 'express';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

const port = parseInt(process.env.PORT || '3000');
app.listen({ port }, () => console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`));
