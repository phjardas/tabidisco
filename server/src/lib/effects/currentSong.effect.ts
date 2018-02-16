import { injectable } from 'inversify';

import { Effect, EffectFactory } from '../bus';
import { Song } from '../api';
import { Play } from '../player';

export interface CurrentSong {
  readonly song: Song;
  readonly play: Play;
}

@injectable()
export class CurrentSongEffect implements EffectFactory {
  private currentSong: CurrentSong = null;

  private getCurrentSong: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'current_song').map(action => action.replySuccess(this.currentSong));
  };

  private setCurrentSong: Effect = ({ actions }) => {
    return actions.filter(a => a.type === 'set_current_song').map(action => (this.currentSong = action.payload));
  };

  getEffects(): Effect[] {
    return [this.getCurrentSong, this.setCurrentSong];
  }
}
