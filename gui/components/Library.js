import SongList from './SongList';
import UploadSong from './UploadSong';

export default function Library({ songs, currentSong, play, uploadSong }) {
  return (
    <React.Fragment>
      <SongList songs={songs} currentSong={currentSong} play={play} />
      <UploadSong uploadSong={uploadSong} />
    </React.Fragment>
  );
}
