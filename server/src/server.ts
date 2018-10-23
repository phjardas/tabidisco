import { ApolloServer } from 'apollo-server-express';
import * as history from 'connect-history-api-fallback';
import * as express from 'express';
import * as helmet from 'helmet';
import * as http from 'http';
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

if (process.env.TABIDISCO_GUI_DIR) {
  console.log('Serving GUI from %s', process.env.TABIDISCO_GUI_DIR);
  app.use(helmet());
  app.use(history());
  app.use(express.static(process.env.TABIDISCO_GUI_DIR));
}

const port = parseInt(process.env.PORT || '3001');
httpServer.listen({ port }, () => {
  console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});
