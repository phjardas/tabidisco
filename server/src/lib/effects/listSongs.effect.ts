import { injectable, inject } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Library, LibrarySymbol } from '../library';

@injectable()
export class ListSongsEffect implements EffectFactory {
  constructor(@inject(LibrarySymbol) private readonly library: Library) {}

  private listSongs: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'list_songs').mergeMap(action =>
      this.library.songs
        .first()
        .map(songs => action.replySuccess({ songs }))
        .catch(error => [action.replyError(error)])
    );
  };

  getEffects(): Effect[] {
    return [this.listSongs];
  }
}
