import { combineReducers } from 'redux';
import { reducer as notifs } from 'redux-notifications';

import {
  CONNECTED,
  RECONNECTING,
  DISCONNECTED,
  SONG_STARTED,
  SONG_FINISHED,
  SONG_ADDED,
  SONG_MODIFIED,
  SONG_DELETED,
  EVENT,
  READ_TOKEN,
  READ_TOKEN_SUCCESS,
  READ_TOKEN_ERROR,
  SHUTDOWN_TIMER_STARTED,
  SHUTDOWN_TIMER_CANCELED,
  POWER_ON_START,
  POWER_ON_SUCCESS,
  POWER_OFF_START,
  POWER_OFF_SUCCESS,
  UPLOAD_SONG,
  UPLOAD_SONG_SUCCESS,
  UPLOAD_SONG_ERROR,
} from './types';

function deleteProperty(obj, key) {
  const ret = { ...obj };
  delete ret[key];
  return ret;
}

const connection = (state = { state: 'connecting' }, action) => {
  const { type, payload } = action;
  switch (type) {
    case CONNECTED:
      return { ...payload, state: 'connected' };
    case RECONNECTING:
      return { state: 'reconnecting' };
    case DISCONNECTED:
      return { state: 'disconnected' };
    default:
      return state;
  }
};

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
      return payload;

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

const token = (state = {}, action) => {
  const { type, payload } = action;
  switch (type) {
    case READ_TOKEN:
      return { pending: true };
    case READ_TOKEN_SUCCESS:
      return payload;
    case READ_TOKEN_ERROR:
      return { error: payload };
    default:
      return state;
  }
};

const power = (state = { shutdownTimer: null, state: 'off' }, action) => {
  const { type, payload } = action;
  switch (type) {
    case SHUTDOWN_TIMER_STARTED:
      return { ...state, shutdownTimer: payload };
    case SHUTDOWN_TIMER_CANCELED:
      return { ...state, shutdownTimer: null };
    case POWER_ON_START:
      return { ...state, state: 'powering_up' };
    case POWER_ON_SUCCESS:
      return { ...state, state: 'on' };
    case POWER_OFF_START:
      return { ...state, state: 'powering_down', shutdownTimer: null };
    case POWER_OFF_SUCCESS:
      return { ...state, state: 'off', shutdownTimer: null };

    default:
      return state;
  }
};

const songUpload = (state = null, action) => {
  const { type, payload } = action;
  switch (type) {
    case UPLOAD_SONG:
      return { ...payload, pending: true };
    case UPLOAD_SONG_SUCCESS:
      return { ...state, pending: false };
    case UPLOAD_SONG_ERROR:
      return { ...state, pending: false, error: action.error };
    default:
      return state;
  }
};

export const reducer = combineReducers({ connection, songs, currentSong, events, notifs, token, power, songUpload });
