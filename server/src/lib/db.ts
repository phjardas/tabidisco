import { injectable, inject } from 'inversify';
import * as Sequelize from 'sequelize';
import * as path from 'path';

import { LogFactorySymbol, LogFactory, Log } from '../log';
import { Song, SongData } from './api';

export type SongInstance = Sequelize.Instance<Song>;
export type SongDataInstance = Sequelize.Instance<SongData>;

export interface DB {
  readonly Song: Sequelize.Model<SongInstance, Song>;
  readonly SongData: Sequelize.Model<SongDataInstance, SongData>;
}

export const DBSymbol = Symbol.for('DB');

@injectable()
export class DBImpl implements DB {
  private readonly log: Log;
  private readonly db: Sequelize.Sequelize;
  readonly Song: Sequelize.Model<SongInstance, Song>;
  readonly SongData: Sequelize.Model<SongDataInstance, SongData>;

  constructor(@inject(LogFactorySymbol) logFactory: LogFactory) {
    this.log = logFactory.getLog('db');

    const dbDir = process.env.TABIDISCO_DB_DIR || path.resolve('db');
    const dbFile = path.resolve(dbDir, 'db.sqlite');
    const enableSqlLogging = process.env.DB_LOG_SQL === 'true';

    this.log.info('[db] Opening sqlite database at %s', dbFile);
    const config: Sequelize.Options = {
      dialect: 'sqlite',
      storage: dbFile,
      logging: enableSqlLogging ? (msg: any) => this.log.debug('[db] [sql] %s', msg) : false,
    };

    this.db = new Sequelize(config);

    this.Song = this.db.define<SongInstance, Song>('song', {
      id: { type: Sequelize.STRING, primaryKey: true },
      filename: { type: Sequelize.STRING, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      size: { type: Sequelize.INTEGER, allowNull: false },
    });

    this.SongData = this.db.define<SongDataInstance, SongData>('song_data', {
      id: { type: Sequelize.STRING, primaryKey: true },
      data: { type: Sequelize.BLOB, allowNull: false },
    });

    this.db.sync();
  }
}
