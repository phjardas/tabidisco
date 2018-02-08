import * as express from 'express';
import { Server } from 'http';
import * as socket from 'socket.io';

import { library, jukebox } from './app';

const app = express();
const http = new Server(app);
const io = socket(http);

app.get('/songs', (_, res, next) => library.songs.then(songs => res.json({ songs })).catch(next));
app.get('/current', (_, res) => res.json({ song: jukebox.currentSong }));

jukebox.on('play', (event: any) => io.sockets.emit('play', event));
jukebox.on('stop', (event: any) => io.sockets.emit('stop', event));

io.on('connection', socket => {
  socket.on('play', (tokenId: string) => jukebox.playSong(tokenId));
  socket.on('stop', () => jukebox.stop());
});

const port = process.env.PORT || 3001;
http.listen(port, () => console.log('listening on %d', port));
