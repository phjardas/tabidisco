import { Button, ButtonGroup, ListGroup, ListGroupItem, ListGroupItemHeading, Alert, ListGroupItemText } from 'reactstrap';
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
          <ListGroupItem key={song.tokenId} color={active ? 'info' : null} className="d-flex justify-content-between align-items-center">
            <div>
              <h5>
                {active && <FontAwesome name="play" className="mr-2" />}
                {song.title || song.filename}
              </h5>
              <p className="mb-0">
                {song.artist || <em className="text-muted">unknown artist</em>}
                <br />
                <small className="text-muted">{song.tokenId}</small>
              </p>
            </div>
            {active ? (
              <Button color="primary" onClick={stopSong}>
                stop
              </Button>
            ) : (
              <ButtonGroup>
                <Button color="primary" onClick={() => play(song.tokenId)}>
                  play
                </Button>
                <Button color="danger" outline onClick={() => deleteSong(song.tokenId)}>
                  delete
                </Button>
              </ButtonGroup>
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
