import 'reflect-metadata';

import { container } from './app';
import { Server, ServerSymbol } from './server';
import { Configuration, ConfigurationSymbol } from './config';

const config = container.get<Configuration>(ConfigurationSymbol);
console.log('Starting Tabidisco version %s commit %s branch %s', config.version, config.buildInfo.commit, config.buildInfo.branch);

const server = container.get<Server>(ServerSymbol);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
server.start(port);
