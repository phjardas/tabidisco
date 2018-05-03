import { injectable, inject } from 'inversify';
import * as fs from 'fs';
import { promisify } from 'util';

import { Log, LogFactory, LogFactorySymbol } from './../log';
import { DB, DBSymbol } from './db';
import { Library, LibrarySymbol } from './library';

const getStats = promisify(fs.stat);
const readFile = promisify(fs.readFile);

@injectable()
export class Migration {
  private log: Log;

  constructor(
    @inject(DBSymbol) private readonly db: DB,
    @inject(LibrarySymbol) private readonly library: Library,
    @inject(LogFactorySymbol) logFactory: LogFactory
  ) {
    this.log = logFactory.getLog('migration');
  }

  async migrateDatabase() {
    const dbFile = `${this.db.dbDir}/songs.json`;
    const stats = await getStats(dbFile);

    if (stats.isFile()) {
      this.log.info('migrating old file-based database to sqlite');
      const songs: any[] = JSON.parse(await readFile(dbFile, 'utf-8'));
      for (const song of songs) {
        await this.importSong(song);
      }
      this.log.info('concluded migration of old file-based database');
    }
  }

  private async importSong(song: any): Promise<any> {
    this.log.info('importing song: %s', song.tokenId);
    const data = await readFile(`${this.db.dbDir}/${song.file}`);
    await this.library.setSong(song.tokenId, song.filename, data);
  }
}
