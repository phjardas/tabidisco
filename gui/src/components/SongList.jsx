import React from 'react';
import { Button, Alert, ListGroup, ListGroupItem } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function Library({ songs, currentSong, playSong, deleteSong, stopSong }) {
  const sortedSongs = Object.keys(songs)
    .map(id => songs[id])
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return sortedSongs.length ? (
    <ListGroup>
      {sortedSongs.map(song => {
        const active = currentSong && currentSong.id === song.id;
        return (
          <ListGroupItem key={song.id} className={`d-flex flex-row justify-content-between ${active ? 'active' : ''}`}>
            <div className="mr-3">
              {active ? (
                <Button key="stop" color="light" outline size="sm" onClick={stopSong}>
                  <FontAwesome icon="stop" />
                </Button>
              ) : (
                <Button key="play" color="primary" outline size="sm" onClick={() => playSong(song.id)}>
                  <FontAwesome icon="play" />
                </Button>
              )}
            </div>
            <div className="mr-auto d-flex flex-column">
              <strong>{song.title || song.filename}</strong>
              {song.artist ? <span>{song.artist}</span> : <span className="text-muted">Unknown artist</span>}
              {song.description ? <small>{song.description}</small> : <small className="text-muted">No description</small>}
              {song.plays ? (
                <small className="text-muted">
                  {song.plays} plays, last played at {new Date(song.lastPlayedAt).toLocaleString()}
                </small>
              ) : (
                <small className="text-muted">never played yet</small>
              )}
            </div>
            {active || (
              <div>
                <Button
                  color="danger"
                  outline
                  size="sm"
                  onClick={() => window.confirm('Are you sure you want to delete this song?') && deleteSong(song.id)}
                >
                  <FontAwesome icon="trash" />
                </Button>
              </div>
            )}
          </ListGroupItem>
        );
      })}
    </ListGroup>
  ) : (
    <Alert color="warning">
      <FontAwesome icon="exclamation-triangle" className="mr-1" />
      There are no songs in the library yet.
    </Alert>
  );
}
