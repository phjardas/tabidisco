import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { parseTags, SongTags } from './mp3';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const deleteFile = promisify(fs.unlink);

export interface Song extends SongTags {
  readonly tokenId: string;
  readonly file: string;
  readonly filename: string;
  readonly type: string;
  readonly size: number;
  readonly plays?: number;
  readonly lastPlayedAt?: string;
}

export interface Library {
  readonly songs: Promise<Song[]>;
  setSong(tokenId: string, filename: string, buffer: Buffer): Promise<{ song: Song; oldSong?: Song }>;
  deleteSong(tokenId: string): Promise<{ oldSong?: Song }>;
  recordPlay(id: string): Promise<Song>;
}

type SongMap = { [tokenId: string]: Song };

export class FileLibrary implements Library {
  private readonly dbDir: string;
  private readonly dbFile: string;

  constructor() {
    this.dbDir = process.env.TABIDISCO_DB_DIR || path.resolve('db');
    this.dbFile = path.resolve(this.dbDir, 'songs.json');
  }

  get songs(): Promise<Song[]> {
    return this.load().then(songs => Object.keys(songs).map(id => songs[id]));
  }

  async setSong(tokenId: string, originalFilename: string, buffer: Buffer): Promise<{ song: Song; oldSong?: Song }> {
    console.info('setting song %s', tokenId);
    const suffix = originalFilename.replace(/^.+\.([^.]+)$/, '$1');
    const filename = `${tokenId}.${suffix}`;
    const fullFile = path.resolve(this.dbDir, filename);

    await writeFile(fullFile, buffer);
    const [songs, tags] = await Promise.all([this.load(), parseTags(fullFile)]);
    const song = {
      tokenId,
      file: filename,
      type: suffix,
      size: buffer.byteLength,
      filename: originalFilename,
      plays: 0,
      ...tags,
    };

    const oldSong = songs[tokenId];
    await this.save({ ...songs, [tokenId]: song });

    if (oldSong) {
      console.info('updated song %s', tokenId);
      return { song, oldSong };
    } else {
      console.info('added song %s', tokenId);
      return { song };
    }
  }

  async deleteSong(tokenId: string): Promise<{ oldSong?: Song }> {
    const songs = await this.load();
    const song = songs[tokenId];
    if (!song) return {};

    console.info('deleting song %s', tokenId);
    await deleteFile(path.resolve(this.dbDir, song.file));
    delete songs[tokenId];
    await this.save(songs);
    return { oldSong: song };
  }

  async recordPlay(id: string): Promise<Song> {
    const songs = await this.load();
    const song = songs[id];
    if (!song) throw new Error(`Song not found: ${id}`);

    const newSong = {
      ...song,
      plays: (song.plays || 0) + 1,
      lastPlayedAt: new Date().toISOString(),
    };

    await this.save({
      ...songs,
      [id]: newSong,
    });

    return { ...newSong, file: path.resolve(this.dbDir, newSong.file) };
  }

  private async load(): Promise<SongMap> {
    const data = await readFile(this.dbFile, 'utf-8');
    const songs: Song[] = JSON.parse(data || '[]');
    return songs
      .map(song => ({
        ...song,
        file: path.resolve(this.dbDir, song.file),
      }))
      .reduce(
        (a, b) => ({
          ...a,
          [b.tokenId]: b,
        }),
        {}
      );
  }

  private async save(songs: SongMap): Promise<any> {
    await writeFile(this.dbFile, JSON.stringify(Object.keys(songs).map(id => songs[id])), 'utf-8');
  }
}
