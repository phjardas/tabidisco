import { combineReducers } from 'redux';
import { reducer as notifs } from 'redux-notifications';

import { SONG_STARTED, SONG_FINISHED, SONG_ADDED, SONG_MODIFIED, SONG_DELETED, EVENT } from './types';

function deleteProperty(obj, key) {
  const ret = { ...obj };
  delete ret[key];
  return ret;
}

const songs = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case SONG_ADDED:
    case SONG_MODIFIED:
      return { ...state, [payload.song.tokenId]: payload.song };

    case SONG_DELETED:
      return deleteProperty(state, payload.oldSong.tokenId);

    default:
      return state;
  }
};

const currentSong = (state = null, action) => {
  const { type, payload } = action;
  switch (type) {
    case SONG_STARTED:
      return payload.song;

    case SONG_FINISHED:
      return null;

    default:
      return state;
  }
};

const events = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case EVENT:
      return { ...state, [payload.id]: payload };

    default:
      return state;
  }
};

export const reducer = combineReducers({ songs, currentSong, events, notifs });
