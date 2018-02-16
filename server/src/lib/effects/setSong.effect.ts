import { Observable } from 'rxjs';
import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Library, LibrarySymbol } from '../library';

@injectable()
export class SetSongEffect implements EffectFactory {
  constructor(@inject(LibrarySymbol) private readonly library: Library) {}

  private setSong: Effect = ({ actions, request }) => {
    return actions.filter(a => a.type === 'set_song').mergeMap(action =>
      request({ type: 'read_token' })
        .mergeMap(({ token }) => {
          const { filename, data } = action.payload;
          const buffer = Buffer.from(data, 'base64');
          return this.library.setSong(token, filename, buffer);
        })
        .mergeMap(data => Observable.of(action.replySuccess(data), { type: `song_${data.oldSong ? 'modified' : 'added'}`, payload: data }))
        .catch(error => [action.replyError(error)])
    );
  };

  getEffects(): Effect[] {
    return [this.setSong];
  }
}
