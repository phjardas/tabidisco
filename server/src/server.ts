import * as express from 'express';
import { Server } from 'http';
import * as socket from 'socket.io';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';

import { library, jukebox } from './app';

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));

const http = new Server(app);
const io = socket(http);

app.get('/songs', (_, res, next) => library.songs.then(songs => res.json({ songs })).catch(next));
app.get('/current', (_, res) => res.json({ song: jukebox.currentSong }));

const dbDir = path.resolve(__dirname, '..', 'db');
const upload = multer();
app.put('/songs/:tokenId', upload.single('file'), async (req, res, next) => {
  try {
    const { tokenId } = req.params;
    const { file } = req;
    const filename = `${tokenId}${file.originalname.replace(/^.+(\.[^.]+)$/, '$1')}`;
    const fullFile = path.resolve(dbDir, filename);

    await new Promise((resolve, reject) =>
      fs.writeFile(fullFile, file.buffer, err => {
        err ? reject(err) : resolve();
      })
    );

    const song = { tokenId, file: filename, type: file.mimetype, size: file.size, filename: file.originalname };
    await library.setSong(song);
    res.send(song);
  } catch (err) {
    next(err);
  }
});

jukebox.on('play', (event: any) => io.sockets.emit('play', event));
jukebox.on('stop', (event: any) => io.sockets.emit('stop', event));
library.on('added', (event: any) => io.sockets.emit('song_added', event));
library.on('modified', (event: any) => io.sockets.emit('song_modified', event));
library.on('removed', (event: any) => io.sockets.emit('song_removed', event));

io.on('connection', socket => {
  socket.on('play', (tokenId: string) => jukebox.playSong(tokenId));
  socket.on('stop', () => jukebox.stop());
});

const port = process.env.PORT || 3001;
http.listen(port, () => console.log('listening on %d', port));
