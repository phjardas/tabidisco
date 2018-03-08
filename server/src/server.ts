import { injectable, inject } from 'inversify';
import * as express from 'express';
import * as http from 'http';
import * as path from 'path';
import * as multer from 'multer';
import * as socket from 'socket.io';
import * as cors from 'cors';
import * as helmet from 'helmet';

import { Configuration, ConfigurationSymbol } from './config';
import { Tabidisco, TabidiscoSymbol } from './lib/tabidisco';
import { applyBusLogging, prepareEventForLogging } from './bus-logger';

export interface Server {
  start(port: number): void;
}

export const ServerSymbol = Symbol.for('Server');

function formatError(error: Error) {
  if (error)
    return {
      type: error.name || error.constructor.name,
      message: error.message,
    };
}

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

    const upload = multer();
    app.put('/files/:tokenId', upload.single('file'), (req, res, next) => {
      const filename = req.file.originalname;
      const data = req.file.buffer;

      bus
        .request({ type: 'set_song', payload: { tokenId: req.params.tokenId, filename, data } })
        .subscribe(() => res.json({ success: true }), next);
    });

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
        bus.request<any>({ ...action, private: socket.id }, { throwError: false }).subscribe(reply =>
          socket.emit('reply', {
            requestId,
            reply: reply && {
              ...reply,
              error: formatError(reply.error),
            },
          })
        )
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
