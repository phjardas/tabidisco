import { ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function Library({ songs, currentSong, play }) {
  return (
    <ListGroup>
      {Object.keys(songs)
        .map(id => songs[id])
        .sort((a, b) => a.filename.localeCompare(b.filename))
        .map(song => (
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
            <ListGroupItemText className="mb-0">{song.tokenId}</ListGroupItemText>
          </ListGroupItem>
        ))}
    </ListGroup>
  );
}
