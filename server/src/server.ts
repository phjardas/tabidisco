import * as express from 'express';
import { Request, Response, NextFunction } from 'express';
import { Server } from 'http';
import { ReplaySubject, BehaviorSubject } from 'rxjs';
import * as socket from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';
import * as multer from 'multer';

import { tabidisco } from './tabidisco';
import { Event, LogEvent } from './events';

interface ServerEvent {
  timestamp: Date;
  id: string;
  [key: string]: any;
}

const log = new ReplaySubject<ServerEvent>(100);
const events = new BehaviorSubject<ServerEvent[]>([]);
log.scan((a, b) => [...a, b], []).subscribe(e => events.next(e.reverse()));

let nextEventId = 1;
function addLog(event: Event) {
  log.next({ ...event, timestamp: new Date(), id: (nextEventId++).toString() });
}
log.subscribe(event => console.log('[%s]', event.type, JSON.stringify(event)));
tabidisco.events.subscribe(addLog);

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const http = new Server(app);

app.get('/songs', (_, res, next) => tabidisco.songs.first().subscribe(songs => res.json({ songs }), next));
app.delete('/songs/:id', (req, res, next) => tabidisco.deleteSong(req.params.id).subscribe(() => res.status(204).end(), next));

app.get('/current', (_, res, next) => tabidisco.currentSong.first().subscribe(song => res.json({ song }), next));
app.get('/token', (_, res, next) => tabidisco.readToken().subscribe(token => res.json({ token }), next));

app.post('/play', (req, res, next) => tabidisco.playSong(req.body.tokenId).subscribe(song => res.json({ song }), next));
app.post('/stop', (_, res) => tabidisco.stop().subscribe(() => res.status(204).end()));

app.post('/button/:type', (req, res, next) => tabidisco.onButton(req.params.type).subscribe(val => res.send(val), next));

app.get('/events', (_, res, next) => events.first().subscribe(events => res.json({ events }), next));

const upload = multer();
app.post('/songs', upload.single('file'), (req, res, next) => {
  const { file } = req;
  tabidisco
    .readToken()
    .flatMap(tokenId => tabidisco.setSong(tokenId, file.originalname, file.buffer))
    .subscribe(song => res.send(song), next);
});

app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  res.status(500).send({
    error: true,
    message: err.message,
    code: err.code || undefined,
    stack: err.stack,
  });
});

const io = socket(http);
log.subscribe(event => io.sockets.emit('event', event));

const port = process.env.PORT || 3001;
http.listen(port, () => addLog(new LogEvent('info', 'listening on %d', port)));
