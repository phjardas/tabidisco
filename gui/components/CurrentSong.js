import { Alert, Button } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function CurrentSong({ currentSong, stopSong }) {
  return (
    currentSong && (
      <Alert color="info" className="d-flex justify-content-between align-items-center">
        <div>
          <h4 className="alert-heading">
            <FontAwesome name="play" className="mr-2" />
            {currentSong.filename}
          </h4>
          <span suppressHydrationWarning>since {new Date(currentSong.playingSince).toLocaleTimeString()}</span>
        </div>
        <div>
          <Button color="primary" onClick={stopSong()}>
            <FontAwesome name="stop" />
          </Button>
        </div>
      </Alert>
    )
  );
}
