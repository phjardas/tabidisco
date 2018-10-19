import { ApolloServer } from 'apollo-server-express';
import * as http from 'http';
import * as express from 'express';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const port = parseInt(process.env.PORT || '3001');
httpServer.listen({ port }, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});
