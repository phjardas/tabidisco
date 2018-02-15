import * as express from 'express';
import { Server } from 'http';
import * as socket from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';

import { bus } from './app';
import { applyBusLogging, prepareEventForLogging } from './bus-logger';

const app = express();
app.use(helmet());
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(express.static(`${__dirname}/../../gui/build`));

const http = new Server(app);

const io = socket(http);
io.on('connection', socket => {
  bus.dispatch({ type: 'client_connected', payload: { id: socket.id } });
  socket.on('disconnect', () => bus.dispatch({ type: 'client_disconnected', payload: { id: socket.id } }));
  socket.on('action', action => bus.dispatch(action));
  socket.on('request', ({ action, requestId }) =>
    bus.request({ ...action, private: socket.id }).subscribe(reply => socket.emit('reply', { requestId, reply }))
  );
  bus.events
    .filter(event => event.action && event.action.private === socket.id)
    .subscribe(event => socket.emit('event', prepareEventForLogging(event)));
});

bus.events.subscribe(event => {
  if (event.action && event.action.private) return;
  io.emit('event', prepareEventForLogging(event));
});

applyBusLogging(bus);

const port = process.env.PORT || 3001;
http.listen(port, () => console.info('listening on %d', port));
