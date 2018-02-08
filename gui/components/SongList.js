import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText, Alert } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function Library({ songs, currentSong, play }) {
  const sortedSongs = Object.keys(songs)
    .map(id => songs[id])
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return sortedSongs.length ? (
    <ListGroup>
      {sortedSongs.map(song => (
        <ListGroupItem
          key={song.tokenId}
          action
          active={currentSong && currentSong.tokenId === song.tokenId}
          style={{ cursor: 'pointer' }}
          onClick={e => {
            e.preventDefault();
            play(song.tokenId);
          }}
        >
          <ListGroupItemHeading>
            {currentSong && currentSong.tokenId === song.tokenId && <FontAwesome name="play" className="mr-2" />}
            {song.filename}
          </ListGroupItemHeading>
          <ListGroupItemText className="mb-0">
            <dl className="row">
              <dt className="col-3">ID</dt>
              <dd className="col-9">{song.tokenId}</dd>
              <dt className="col-3">Type</dt>
              <dd className="col-9">{song.type}</dd>
              <dt className="col-3">Size</dt>
              <dd className="col-9">{song.size}</dd>
            </dl>
          </ListGroupItemText>
        </ListGroupItem>
      ))}
    </ListGroup>
  ) : (
    <Alert color="warning">
      <FontAwesome name="exclamation-triangle" className="mr-1" />
      There are no songs in the library yet.
    </Alert>
  );
}
