import SocketIO from 'socket.io-client';
import { actions as notifActions } from 'redux-notifications';

import {
  CONNECTED,
  DISCONNECTED,
  RECONNECTING,
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
  GET_INFO,
  GET_INFO_SUCCESS,
  GET_INFO_ERROR,
} from './types';

// FIXME make API URL configurable
const apiUrl = process.env.NODE_ENV === 'production' ? window.location.origin : window.location.origin.replace(/\d+$/, '3001');
let io = SocketIO(apiUrl);

function request(action) {
  return new Promise((resolve, reject) => {
    const requestId = Math.floor(1000000000 * Math.random()).toString();

    const listener = reply => {
      if (reply.requestId === requestId) {
        io.off('reply', listener);
        if (reply.reply && reply.reply.error) return reject(reply.reply.error);
        resolve(reply.reply);
      }
    };

    io.on('reply', listener);
    io.emit('request', { action, requestId });
  });
}

export function getInfo(button) {
  return dispatch => {
    dispatch({ type: GET_INFO });
    io.emit('action', { type: 'get_info' });
  };
}

export function readToken(button) {
  return () => io.emit('action', { type: 'read_token' });
}

export function pressButton(button) {
  return () => io.emit('action', { type: 'button', payload: { button } });
}

export function loadSongs() {
  return async dispatch => {
    const { songs } = await request({ type: 'list_songs' });
    songs.forEach(song => dispatch({ type: SONG_ADDED, payload: { song } }));
  };
}

export function getCurrentSong() {
  return async dispatch => {
    const current = await request({ type: 'current_song' });
    dispatch(
      current
        ? {
            type: SONG_STARTED,
            payload: current,
          }
        : { type: SONG_FINISHED }
    );
  };
}

export function synchronize() {
  return dispatch => {
    io.on('connect', () => dispatch({ type: CONNECTED, payload: { socketId: io.id } }));
    io.on('reconnecting', evt => dispatch({ type: RECONNECTING }));
    io.on('disconnect', evt => dispatch({ type: DISCONNECTED }));

    io.on('event', event => {
      dispatch({ type: EVENT, payload: event });

      if (event.type === 'action') {
        const { action } = event;
        console.log('Action %s:', action.type, action.payload);

        if (action.type.endsWith('.error')) {
          dispatch(notifActions.notifSend({ kind: 'error', message: action.error.message, dismissAfter: 5000 }));
        }

        switch (action.type) {
          case 'get_info.success':
            return dispatch({ type: GET_INFO_SUCCESS, payload: action.payload });
          case 'get_info.error':
            return dispatch({ type: GET_INFO_ERROR, payload: action.error });
          case 'read_token':
            return dispatch({ type: READ_TOKEN });
          case 'read_token.success':
            return dispatch({ type: READ_TOKEN_SUCCESS, payload: action.payload });
          case 'read_token.error':
            return dispatch({ type: READ_TOKEN_ERROR, payload: action.error });
          case 'song_added':
            return dispatch({ type: SONG_ADDED, payload: action.payload });
          case 'song_modified':
            return dispatch({ type: SONG_MODIFIED, payload: action.payload });
          case 'song_deleted':
            return dispatch({ type: SONG_DELETED, payload: action.payload });
          case 'set_shutdown_timer.success':
            return dispatch({ type: SHUTDOWN_TIMER_STARTED, payload: action.payload });
          case 'cancel_shutdown_timer.success':
            return dispatch({ type: SHUTDOWN_TIMER_CANCELED });
          case 'power_on':
            return dispatch({ type: POWER_ON_START });
          case 'power_on.success':
            return dispatch({ type: POWER_ON_SUCCESS });
          case 'power_off':
            return dispatch({ type: POWER_OFF_START });
          case 'power_off.success':
            return dispatch({ type: POWER_OFF_SUCCESS });
          default:
        }
      } else if (event.type === 'song_started') {
        return dispatch({ type: SONG_STARTED, payload: event.song });
      } else if (event.type === 'song_finished') {
        return dispatch({ type: SONG_FINISHED, payload: event.song });
      }
    });
  };
}

export function playSong(token) {
  return () => io.emit('action', { type: 'play_song', payload: { token } });
}

export function deleteSong(token) {
  return () => io.emit('action', { type: 'delete_song', payload: { token } });
}

export function uploadSong(file) {
  console.log('uploadSong:', file);
  return async dispatch => {
    dispatch({ type: UPLOAD_SONG, payload: { name: file.name } });

    try {
      const { token } = await request({ type: 'read_token' });

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${apiUrl}/files/${token}`, {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');
      dispatch({ type: UPLOAD_SONG_SUCCESS });
      dispatch(notifActions.notifSend({ kind: 'success', message: 'The song was successfully uploaded.', dismissAfter: 5000 }));
    } catch (error) {
      dispatch({ type: UPLOAD_SONG_ERROR, error });
    }
  };
}

export function getPowerState() {
  return async dispatch => {
    const { powered } = await request({ type: 'get_power' });
    dispatch({ type: `power.${powered ? 'on' : 'off'}.success` });
  };
}

export function setPower(powered) {
  return () => io.emit('action', { type: `power_${powered ? 'on' : 'off'}` });
}

export function cancelShutdownTimer(powered) {
  return () => io.emit('action', { type: 'cancel_shutdown_timer' });
}
