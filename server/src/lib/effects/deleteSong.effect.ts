import { Observable } from 'rxjs';
import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Library, LibrarySymbol } from '../library';

@injectable()
export class DeleteSongEffect implements EffectFactory {
  constructor(@inject(LibrarySymbol) private readonly library: Library) {}

  private deleteSong: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'delete_song').mergeMap(action =>
      this.library
        .deleteSong(action.payload.token)
        .mergeMap(data => Observable.of(action.replySuccess(data), { type: 'song_deleted', payload: data }))
        .catch(error => [action.replyError(error)])
    );
  };

  getEffects(): Effect[] {
    return [this.deleteSong];
  }
}
