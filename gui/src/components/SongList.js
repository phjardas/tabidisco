import React from 'react';
import { Button, Alert, Table } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function Library({ songs, currentSong, play, deleteSong, stopSong }) {
  const sortedSongs = Object.keys(songs)
    .map(id => songs[id])
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return sortedSongs.length ? (
    <Table>
      <tbody>
        {sortedSongs.map(song => {
          const active = currentSong && currentSong.tokenId === song.tokenId;
          return (
            <tr key={song.tokenId} className={active ? 'table-active' : undefined}>
              <td>
                {active ? (
                  <Button key="stop" color="primary" size="sm" onClick={stopSong}>
                    <FontAwesome name="stop" />
                  </Button>
                ) : (
                  <Button key="play" color="primary" outline size="sm" onClick={() => play(song.tokenId)}>
                    <FontAwesome name="play" />
                  </Button>
                )}
              </td>
              <td>
                <strong>{song.title || <span className="text-muted">unknown</span>}</strong>
                <br />
                {song.artist || <span className="text-muted">unknown</span>}
              </td>
              <td>
                {song.filename}
                <br />
                <small className="text-muted">{song.tokenId}</small>
              </td>
              <td>
                <Button
                  color="danger"
                  outline
                  size="sm"
                  onClick={() => window.confirm('Are you sure you want to delete this song?') && deleteSong(song.tokenId)}
                >
                  <FontAwesome name="trash" />
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  ) : (
    <Alert color="warning">
      <FontAwesome name="exclamation-triangle" className="mr-1" />
      There are no songs in the library yet.
    </Alert>
  );
}
