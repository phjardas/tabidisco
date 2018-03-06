import { injectable, inject } from 'inversify';
import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as socket from 'socket.io';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as helmet from 'helmet';

import { Tabidisco, TabidiscoSymbol } from './lib/tabidisco';
import { applyBusLogging, prepareEventForLogging } from './bus-logger';

export interface Server {
  start(port: number): void;
}

export const ServerSymbol = Symbol.for('Server');

@injectable()
export class ServerImpl implements Server {
  private readonly httpServer: http.Server;

  constructor(@inject(TabidiscoSymbol) tabidisco: Tabidisco) {
    const bus = tabidisco.bus;

    const guiDir = process.env.TABIDISCO_GUI_DIR || path.resolve('../../gui/dist');
    console.log('[server] serving GUI resources from %s', guiDir);

    const app = express();
    app.use(helmet());
    app.use(cors({ origin: true }));
    app.use(bodyParser.json());

    // Serve static resources with History API fallback
    app.use(express.static(guiDir));
    app.use((req, res, next) => {
      if ((req.method === 'GET' || req.method === 'HEAD') && req.accepts('html')) {
        res.sendFile('index.html', { root: guiDir }, (err: Error) => err && next());
      } else {
        next();
      }
    });

    this.httpServer = new http.Server(app);

    const io = socket(this.httpServer);
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
  }

  start(port: number) {
    this.httpServer.listen(port, () => console.info('[server] listening on %d', port));
  }
}
