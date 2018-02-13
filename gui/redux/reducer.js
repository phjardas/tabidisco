import { combineReducers } from 'redux';
import { reducer as notifs } from 'redux-notifications';

import { PLAY, STOP, SONGS_LOADED, SONG_ADDED, SONG_MODIFIED, SONG_DELETED } from './types';

function deleteProperty(obj, key) {
  const ret = { ...obj };
  delete ret[key];
  return ret;
}

const songs = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SONGS_LOADED:
      return payload.songs.reduce((a, b) => ({ ...a, [b.tokenId]: b }), {});

    case SONG_ADDED:
    case SONG_MODIFIED:
      return { ...state, [payload.song.tokenId]: payload.song };

    case SONG_DELETED:
      return deleteProperty(state, payload.song.tokenId);

    default:
      return state;
  }
};

const currentSong = (state = null, action) => {
  const { type, payload } = action;
  switch (type) {
    case PLAY:
      return payload.song;

    case STOP:
      return null;

    default:
      return state;
  }
};

export const reducer = combineReducers({ songs, currentSong, notifs });
