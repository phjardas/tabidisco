import React from 'react';
import { usePlayback } from '../data';
import Library from './library';
import Playback from './playback';

export default function Pages() {
  const playback = usePlayback();
  return playback.playback ? <Playback {...playback} /> : <Library />;
}
