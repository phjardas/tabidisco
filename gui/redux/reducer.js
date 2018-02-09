import { PLAY, STOP, SONGS_LOADED, SONG_ADDED, SONG_MODIFIED, SONG_DELETED } from './types';

const initialState = {
  songs: {},
  currentSong: null,
};

function deleteProperty(obj, key) {
  const ret = { ...obj };
  delete ret[key];
  return ret;
}

export const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case PLAY:
      return { ...state, currentSong: payload.song };

    case STOP:
      return { ...state, currentSong: null };

    case SONGS_LOADED:
      return { ...state, songs: payload.songs.reduce((a, b) => ({ ...a, [b.tokenId]: b }), {}) };

    case SONG_ADDED:
    case SONG_MODIFIED:
      return { ...state, songs: { ...state.songs, [payload.song.tokenId]: payload.song } };

    case SONG_DELETED:
      return { ...state, songs: deleteProperty(state.songs, payload.song.tokenId) };

    default:
      return state;
  }
};
