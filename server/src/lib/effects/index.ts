import { ButtonPlayEffect } from './buttonPlay.effect';
import { ButtonStopEffect } from './buttonStop.effect';
import { CurrentSongEffect } from './currentSong.effect';
import { DeleteSongEffect } from './deleteSong.effect';
import { InfoEffect } from './info.effect';
import { ListSongsEffect } from './listSongs.effect';
import { PlaySongEffect } from './playSong.effect';
import { PowerEffect } from './power.effect';
import { ReadTokenEffect } from './readToken.effect';
import { SetSongEffect } from './setSong.effect';
import { ShutdownTimerEffect } from './shutdownTimer.effect';

export const EffectsSymbol = Symbol.for('Effects');

export const effects = [
  ButtonPlayEffect,
  ButtonStopEffect,
  CurrentSongEffect,
  DeleteSongEffect,
  InfoEffect,
  ListSongsEffect,
  PlaySongEffect,
  PowerEffect,
  ReadTokenEffect,
  SetSongEffect,
  ShutdownTimerEffect,
];
