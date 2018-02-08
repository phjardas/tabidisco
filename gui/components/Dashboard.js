import { Container } from 'reactstrap';

import CurrentSong from './CurrentSong';
import Library from './Library';

export default function Dashboard({ songs, currentSong, play, uploadSong }) {
  return (
    <Container className="mt-3">
      <CurrentSong currentSong={currentSong} />
      <Library songs={songs} currentSong={currentSong} play={play} uploadSong={uploadSong} />
    </Container>
  );
}
