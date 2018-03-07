import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Library, LibrarySymbol } from '../library';
import { READ_TOKEN } from './readToken.effect';

export const SET_SONG = 'set_song';

@injectable()
export class SetSongEffect implements EffectFactory {
  constructor(@inject(LibrarySymbol) private readonly library: Library) {}

  private setSong: Effect = ({ actions, request }) =>
    actions.filter(a => a.type === SET_SONG).mergeMap(action =>
      request({ type: READ_TOKEN })
        .mergeMap(({ token }) => {
          const { filename, data } = action.payload;
          const buffer = Buffer.from(data, 'base64');
          return this.library
            .setSong(token, filename, buffer)
            .mergeMap(data => [action.replySuccess(data.song), { type: `song_${data.oldSong ? 'modified' : 'added'}`, payload: data }]);
        })
        .catch(error => [action.replyError(error)])
    );

  getEffects(): Effect[] {
    return [this.setSong];
  }
}
