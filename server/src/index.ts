import 'reflect-metadata';
import { container } from './app';
import { Types } from './di';
import { Server } from './server';

const server = container.get<Server>(Types.Server);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
server.start(port);
