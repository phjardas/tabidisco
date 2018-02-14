import * as express from 'express';
import { Server } from 'http';
import * as socket from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';

import { bus } from './app';
import { Event } from './bus';

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(bodyParser.json());

const http = new Server(app);

const io = socket(http);
io.on('connection', socket => {
  bus.dispatch({ type: 'client_connected', payload: { id: socket.id } });
  socket.on('disconnect', () => bus.dispatch({ type: 'client_disconnected', payload: { id: socket.id } }));
  socket.on('action', action => bus.dispatch(action));
  socket.on('request', ({ action, requestId }) =>
    bus.request({ ...action, private: socket.id }).subscribe(reply => socket.emit('reply', { requestId, reply }))
  );
  bus.events.filter(event => event.action && event.action.private === socket.id).subscribe(event => publishEvent(socket, event));
});

bus.events.subscribe(event => {
  if (event.action && event.action.private) return;
  publishEvent(io, event);
});

const port = process.env.PORT || 3000;
http.listen(port, () => console.info('listening on %d', port));

function publishEvent(target: any, event: Event) {
  if (event.error) {
    event = { ...event, error: { message: event.error.message } };
  }

  if (event.action && event.action.error) {
    event = { ...event, action: { ...event.action, error: { message: event.action.error.message } } };
  }

  target.emit('event', event);
}
