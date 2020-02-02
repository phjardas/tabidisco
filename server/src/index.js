import { ApolloServer } from 'apollo-server-express';
import history from 'connect-history-api-fallback';
import express from 'express';
import helmet from 'helmet';
import http from 'http';
import { guiDir, port } from './config';
import { findMedium } from './library';
import { schema } from './schema';

export const app = express();

const server = new ApolloServer({ schema });
server.applyMiddleware({ app });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

app.get('/media/:id.mp3', async (req, res) => {
  try {
    const medium = await findMedium(req.params.id);
    if (!medium) return res.status(404).end();
    res.header('Content-Type', medium.file.type);
    const stream = await medium.createAudioStream();
    stream.pipe(res);
  } catch (error) {
    console.error('Error playing %s:', req.params.id, error);
    res.status(500).send({ success: false, message: error.message, stack: error.stack });
  }
});

app.get('/media/:id/cover', async (req, res) => {
  try {
    const medium = await findMedium(req.params.id);
    if (!medium) return res.status(404).end();
    res.header('Content-Type', medium.image.type);
    medium.createImageStream().pipe(res);
  } catch (error) {
    console.error('Error getting image for %s:', req.params.id, error);
    res.status(500).send({ success: false, message: error.message, stack: error.stack });
  }
});

if (guiDir) {
  console.log('Serving GUI from %s', guiDir);
  app.use(helmet());
  app.use(history());
  app.use(express.static(guiDir));
}

httpServer.listen(port, () => {
  console.log(`Server ready at http://localhost:${port}/${server.graphqlPath}`);
  console.log(`Subscriptions ready at ws://localhost:${port}/${server.subscriptionsPath}`);
});
