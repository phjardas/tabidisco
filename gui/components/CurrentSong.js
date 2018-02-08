import { Alert } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function CurrentSong({ currentSong }) {
  return (
    currentSong && (
      <Alert color="info">
        <h4 className="alert-heading">
          <FontAwesome name="play" className="mr-2" />
          {currentSong.filename}
        </h4>
        <p className="mb-0">since {new Date(currentSong.playingSince).toLocaleTimeString()}</p>
      </Alert>
    )
  );
}
