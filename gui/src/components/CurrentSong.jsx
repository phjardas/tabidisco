import React from 'react';
import FontAwesome from './FontAwesome';

export default function CurrentSong({ currentSong }) {
  return (
    <span className="navbar-text">
      <FontAwesome icon="play" className="mr-2" />
      {currentSong.title || currentSong.filename}
    </span>
  );
}
