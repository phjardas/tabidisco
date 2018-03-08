import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Library, LibrarySymbol } from '../library';

export const SET_SONG = 'set_song';

@injectable()
export class SetSongEffect implements EffectFactory {
  constructor(@inject(LibrarySymbol) private readonly library: Library) {}

  private setSong: Effect = ({ actions }) =>
    actions.filter(a => a.type === SET_SONG).mergeMap(action => {
      const { tokenId, filename, data } = action.payload;
      return this.library
        .setSong(tokenId, filename, data)
        .mergeMap(data => [action.replySuccess(data.song), { type: `song_${data.oldSong ? 'modified' : 'added'}`, payload: data }])
        .catch(error => [action.replyError(error)]);
    });

  getEffects(): Effect[] {
    return [this.setSong];
  }
}
