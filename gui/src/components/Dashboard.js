import React from 'react';
import { Container } from 'reactstrap';

import SongList from './SongList';
import UploadSong from './UploadSong';

export default function Dashboard({ songs, currentSong, play, deleteSong, uploadSong, stopSong }) {
  return (
    <Container className="mt-3">
      <SongList songs={songs} currentSong={currentSong} play={play} deleteSong={deleteSong} stopSong={stopSong} />
      <UploadSong uploadSong={uploadSong} />
    </Container>
  );
}
