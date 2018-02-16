import 'reflect-metadata';
import { container } from './app';
import { Server, ServerSymbol } from './server';

const server = container.get<Server>(ServerSymbol);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
server.start(port);
