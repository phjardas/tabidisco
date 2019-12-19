import { ApolloServer } from 'apollo-server-express';
import history from 'connect-history-api-fallback';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { schema } from './schema';

export const app = express();

const server = new ApolloServer({ schema });
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const { TABIDISCO_GUI_DIR: guiDir, PORT = '3000' } = process.env;

if (guiDir) {
  console.log('Serving GUI from %s', guiDir);
  app.use(helmet());
  app.use(history());
  app.use(express.static(guiDir));
}

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}${server.graphqlPath}`);
  console.log(`Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
});
