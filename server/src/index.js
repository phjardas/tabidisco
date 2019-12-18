import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { schema } from './schema';
import http from 'http';

export const app = express();

const server = new ApolloServer({ schema });
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const port = process.env.PORT || 3000;
httpServer.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});
