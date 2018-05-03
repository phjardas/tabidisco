import 'reflect-metadata';

import { container } from './app';
import { Server, ServerSymbol } from './server';
import { Configuration, ConfigurationSymbol } from './config';
import { DB, DBSymbol } from './lib/db';
import { Migration } from './lib/migration';

const config = container.get<Configuration>(ConfigurationSymbol);
console.log('Starting Tabidisco version %s commit %s branch %s', config.version, config.buildInfo.commit, config.buildInfo.branch);

async function initialize() {
  await container.get<DB>(DBSymbol).initialize();
  await container.get(Migration).migrateDatabase();
}

initialize()
  .then(() => {
    const server = container.get<Server>(ServerSymbol);
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    server.start(port);
  })
  .catch(err => this.log.error('error starting:', err));
