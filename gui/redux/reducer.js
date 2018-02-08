import { PLAY, STOP, SONGS_LOADED } from './types';

const initialState = {
  songs: {},
  currentSong: null,
};

export const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case PLAY:
      return { ...state, currentSong: payload.song };

    case STOP:
      return { ...state, currentSong: null };

    case SONGS_LOADED:
      return { ...state, songs: payload.songs.reduce((a, b) => ({ ...a, [b.tokenId]: b }), {}) };

    default:
      return state;
  }
};
