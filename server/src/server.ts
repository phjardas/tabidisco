import * as express from 'express';
import { Server } from 'http';
import * as socket from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as multer from 'multer';

import { tabidisco } from './tabidisco';

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const http = new Server(app);

app.get('/songs', (_, res, next) => tabidisco.songs.first().subscribe(songs => res.json({ songs }), next));
app.delete('/songs/:id', (req, res, next) => tabidisco.deleteSong(req.params.id).subscribe(() => res.status(204).end(), next));

app.get('/current', (_, res, next) => tabidisco.currentSong.first().subscribe(song => res.json({ song }), next));

app.post('/play', (req, res, next) => tabidisco.playSong(req.body.tokenId).subscribe(song => res.json({ song }), next));
app.post('/stop', (_, res) => {
  tabidisco.stop();
  res.status(204).end();
});

const upload = multer();
app.put('/songs/:tokenId', upload.single('file'), (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const { file } = req;
    tabidisco.setSong(tokenId, file.originalname, file.buffer).subscribe(song => res.send(song), next);
  } catch (err) {
    next(err);
  }
});

const io = socket(http);
tabidisco.events.subscribe(event => io.sockets.emit(event.type, event));

const port = process.env.PORT || 3001;
http.listen(port, () => console.log('listening on %d', port));
