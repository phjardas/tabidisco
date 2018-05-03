import { injectable, inject } from 'inversify';
import * as Sequelize from 'sequelize';
import * as path from 'path';

import { LogFactorySymbol, LogFactory, Log } from '../log';
import { Song, SongData } from './api';

export type SongInstance = Sequelize.Instance<Song>;
export type SongDataInstance = Sequelize.Instance<SongData>;

export interface DB {
  readonly dbDir: string;
  readonly Song: Sequelize.Model<SongInstance, Song>;
  readonly SongData: Sequelize.Model<SongDataInstance, SongData>;
  initialize(): Promise<any>;
}

export const DBSymbol = Symbol.for('DB');

@injectable()
export class DBImpl implements DB {
  private readonly log: Log;
  private readonly db: Sequelize.Sequelize;
  readonly dbDir: string;
  readonly Song: Sequelize.Model<SongInstance, Song>;
  readonly SongData: Sequelize.Model<SongDataInstance, SongData>;

  constructor(@inject(LogFactorySymbol) logFactory: LogFactory) {
    this.log = logFactory.getLog('db');
    this.dbDir = process.env.TABIDISCO_DB_DIR || path.resolve('db');

    const dbFile = path.resolve(this.dbDir, 'db.sqlite');
    const enableSqlLogging = process.env.DB_LOG_SQL === 'true';

    this.log.info('Opening sqlite database at %s', dbFile);
    const config: Sequelize.Options = {
      dialect: 'sqlite',
      storage: dbFile,
      logging: enableSqlLogging ? (msg: any) => this.log.debug('[sql] %s', msg) : false,
    };

    this.db = new Sequelize(config);

    this.Song = this.db.define<SongInstance, Song>('song', {
      id: { type: Sequelize.STRING, primaryKey: true },
      filename: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      size: { type: Sequelize.INTEGER, allowNull: false },
      title: { type: Sequelize.STRING },
      artist: { type: Sequelize.STRING },
      album: { type: Sequelize.STRING },
      plays: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      lastPlayedAt: { type: Sequelize.DATE },
    });

    this.SongData = this.db.define<SongDataInstance, SongData>('song_data', {
      id: { type: Sequelize.STRING, primaryKey: true },
      data: { type: Sequelize.BLOB, allowNull: false },
    });
  }

  async initialize() {
    return this.db
      .sync()
      .then(() => this.log.info('Database schema successfully synced.'))
      .catch(err => this.log.error('Error syncing database schema:', err));
  }
}
