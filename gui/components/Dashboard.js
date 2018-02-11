import { Container } from 'reactstrap';

import CurrentSong from './CurrentSong';
import Library from './Library';

export default function Dashboard({ songs, currentSong, play, deleteSong, uploadSong, stopSong }) {
  return (
    <Container className="mt-3">
      <CurrentSong currentSong={currentSong} stopSong={stopSong} />
      <Library songs={songs} currentSong={currentSong} play={play} deleteSong={deleteSong} uploadSong={uploadSong} stopSong={stopSong} />
    </Container>
  );
}
