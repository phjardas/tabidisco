import { ButtonPlayEffect } from './buttonPlay.effect';
import { ButtonStopEffect } from './buttonStop.effect';
import { CurrentSongEffect } from './currentSong.effect';
import { DeleteSongEffect } from './deleteSong.effect';
import { ListSongsEffect } from './listSongs.effect';
import { PlaySongEffect } from './playSong.effect';
import { ReadTokenEffect } from './readToken.effect';
import { SetSongEffect } from './setSong.effect';

export const EffectsSymbol = Symbol.for('Effects');

export const effects = [
  ButtonPlayEffect,
  ButtonStopEffect,
  CurrentSongEffect,
  DeleteSongEffect,
  ListSongsEffect,
  PlaySongEffect,
  ReadTokenEffect,
  SetSongEffect,
];