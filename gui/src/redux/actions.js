import SocketIO from 'socket.io-client';
import { actions as notifActions } from 'redux-notifications';

import { SONG_STARTED, SONG_FINISHED, SONG_ADDED, SONG_MODIFIED, SONG_DELETED, EVENT } from './types';

// FIXME make API URL configurable
const apiUrl = window.location.origin.replace('3000', '3001');
let io = SocketIO(apiUrl);

function request(action) {
  return new Promise(resolve => {
    const requestId = Math.floor(1000000000 * Math.random()).toString();

    const listener = reply => {
      if (reply.requestId === requestId) {
        io.off('reply', listener);
        resolve(reply.reply);
      }
    };

    io.on('reply', listener);
    io.emit('request', { action, requestId });
  });
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
    const { song } = await request({ type: 'current_song' });
    dispatch(
      song
        ? {
            type: SONG_STARTED,
            payload: { song },
          }
        : { type: SONG_FINISHED }
    );
  };
}

export function synchronize() {
  return dispatch => {
    io.on('event', event => {
      dispatch({ type: EVENT, payload: event });

      if (event.type === 'action') {
        const { action } = event;
        if (action.type.endsWith('.error')) {
          dispatch(notifActions.notifSend({ kind: 'error', message: action.error.message, dismissAfter: 5000 }));
        }

        switch (action.type) {
          case 'song_started':
            return dispatch({ type: SONG_STARTED, payload: action.payload });
          case 'song_finished':
            return dispatch({ type: SONG_FINISHED, payload: action.payload });
          case 'song_added':
            return dispatch({ type: SONG_ADDED, payload: action.payload });
          case 'song_modified':
            return dispatch({ type: SONG_MODIFIED, payload: action.payload });
          case 'song_deleted':
            return dispatch({ type: SONG_DELETED, payload: action.payload });
          default:
        }
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
  return () => {
    const reader = new FileReader();
    const filename = file.name;

    reader.addEventListener('loadend', () => {
      const data = btoa(new Uint8Array(reader.result).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      request({ type: 'set_song', payload: { filename, data } });
    });

    reader.readAsArrayBuffer(file);
  };
}
