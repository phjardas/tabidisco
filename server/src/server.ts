import { ApolloServer } from 'apollo-server-express';
import bodyParser from 'body-parser';
import history from 'connect-history-api-fallback';
import cors from 'cors';
import express from 'express';
import fs from 'fs';
import helmet from 'helmet';
import http from 'http';
import multer from 'multer';
import { externalIp, guiDir, port } from './config';
import { logger, tabidisco } from './lib';
import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

const log = logger.child({ module: 'server' });

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

app.get('/songs/:id.mp3', async (req, res, next) => {
  try {
    const song = (await tabidisco.songs).find(s => s.id === req.params.id);
    if (!song) return res.status(404).end();
    res.header('Content-Type', 'audio/mp3');
    fs.createReadStream(song.file).pipe(res);
  } catch (error) {
    console.error('Error playing %s:', req.params.id, error);
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

if (guiDir) {
  log.info(`Serving GUI from ${guiDir}`);
  app.use(helmet());
  app.use(history());
  app.use(express.static(guiDir));
}

httpServer.listen({ port }, () => {
  log.info(`Server ready at http://${externalIp}:${port}${server.graphqlPath}`);
  log.info(`Subscriptions ready at ws://${externalIp}:${port}${server.subscriptionsPath}`);
});
