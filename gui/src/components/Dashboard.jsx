import React from 'react';
import { Container, Button } from 'reactstrap';

import FontAwesome from './FontAwesome';
import SongList from './SongList';
import UploadSong from './UploadSong';

const TokenInfo = ({ token }) => {
  if (token.pending) return 'Reading token...';
  if (token.token) return token.token;
  return null;
};

export default function Dashboard({ songs, currentSong, songUpload, token, play, deleteSong, uploadSong, stopSong, readToken }) {
  return (
    <Container className="mt-3">
      <div className="mb-3">
        <Button color="primary" outline size="sm" className="mr-3" style={{ marginLeft: '.75rem' }} onClick={readToken}>
          {token.pending ? <FontAwesome key="pending" name="spinner" className="fa-pulse" /> : <FontAwesome key="normal" name="tag" />}
        </Button>
        <TokenInfo token={token} />
      </div>

      <SongList songs={songs} currentSong={currentSong} play={play} deleteSong={deleteSong} stopSong={stopSong} />
      <UploadSong uploadSong={uploadSong} songUpload={songUpload} />
    </Container>
  );
}
