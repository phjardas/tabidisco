import React from 'react';
import { Button, Alert, ListGroup, ListGroupItem } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function Library({ songs, currentSong, play, deleteSong, stopSong }) {
  const sortedSongs = Object.keys(songs)
    .map(id => songs[id])
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return sortedSongs.length ? (
    <ListGroup>
      {sortedSongs.map(song => {
        const active = currentSong && currentSong.tokenId === song.tokenId;
        return (
          <ListGroupItem key={song.tokenId} className={`d-flex flex-row justify-content-between ${active ? 'active' : ''}`}>
            <div className="mr-3">
              {active ? (
                <Button key="stop" color="light" outline size="sm" onClick={stopSong}>
                  <FontAwesome name="stop" />
                </Button>
              ) : (
                <Button key="play" color="primary" outline size="sm" onClick={() => play(song.tokenId)}>
                  <FontAwesome name="play" />
                </Button>
              )}
            </div>
            <div className="mr-auto">
              <strong>{song.title || song.filename}</strong>
              <br />
              {song.artist || <span className="text-muted">Unknown artist</span>}
              <br />
              <small className="text-muted">{song.tokenId}</small>
            </div>
            {active || (
              <div>
                <Button
                  color="danger"
                  outline
                  size="sm"
                  onClick={() => window.confirm('Are you sure you want to delete this song?') && deleteSong(song.tokenId)}
                >
                  <FontAwesome name="trash" />
                </Button>
              </div>
            )}
          </ListGroupItem>
        );
      })}
    </ListGroup>
  ) : (
    <Alert color="warning">
      <FontAwesome name="exclamation-triangle" className="mr-1" />
      There are no songs in the library yet.
    </Alert>
  );
}
