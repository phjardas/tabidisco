import SongList from './SongList';
import UploadSong from './UploadSong';

export default function Library({ songs, currentSong, play, deleteSong, uploadSong }) {
  return (
    <React.Fragment>
      <SongList songs={songs} currentSong={currentSong} play={play} deleteSong={deleteSong} />
      <UploadSong uploadSong={uploadSong} />
    </React.Fragment>
  );
}
