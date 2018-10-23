import React from 'react';
import { Alert, Container } from 'reactstrap';
import { WithLibrary } from '../providers/Library';
import SongList from './SongList';

export default () => (
  <Container className="mt-3">
    <WithLibrary>
      {({ loading, error, songs, currentSong, deleteSong, playSong, stopSong }) => {
        if (loading) return <Alert color="info">Loading&hellip;</Alert>;
        if (error) return <Alert color="danger">Error: {error.message}</Alert>;
        return <SongList songs={songs} currentSong={currentSong} playSong={playSong} stopSong={stopSong} deleteSong={deleteSong} />;
      }}
    </WithLibrary>
  </Container>
);
