import React from 'react';
import Frame from '../components/Frame';
import { usePlayback } from '../data';
import Library from './library';
import Playback from './playback';

export default function Main() {
  const playback = usePlayback();

  return <Frame>{playback.playback ? <Playback {...playback} /> : <Library />}</Frame>;
}
