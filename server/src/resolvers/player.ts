import { IResolvers } from 'apollo-server-express';
import { library, pi, player, Song } from '../lib';

interface PlaySongArgs {
  tokenId?: String;
}

type PlaySongResult =
  | {
      success: true;
      song: Song;
    }
  | {
      success: false;
      error: string;
    };

async function playSong(_: any, args: PlaySongArgs): Promise<PlaySongResult> {
  try {
    const token = args.tokenId || (await pi.readToken());
    let song = (await library.songs).find(song => song.tokenId === token);
    if (!song) throw new Error(`Song ${token} not found`);
    song = await library.recordPlay(song.tokenId);
    await player.play(song);
    return { success: true, song };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

type SimpleResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

async function stopSong(): Promise<SimpleResult> {
  try {
    await player.stop();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const resolvers: IResolvers = {
  Query: {
    currentSong: () => player.currentSong,
  },
  Mutation: {
    playSong,
    stopSong,
  },
};
