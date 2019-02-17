import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import history from 'connect-history-api-fallback';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import helmet from 'helmet';
import http from 'http';
import multer from 'multer';
import { tabidisco } from './lib';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

const app = express();
app.use(cors());

const upload = multer({ dest: '/tmp' });
app.put('/songs/:id', bodyParser.json(), upload.single('file'), async (req, res, next) => {
  const stream = fs.createReadStream(req.file.path);
  const id = req.params.id;
  const filename = req.file.filename;
  const description = req.body.description;
  try {
    const song = await tabidisco.addSong(stream, filename, id, description);
    res.send(song);
  } catch (error) {
    next(error);
  }
});

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
