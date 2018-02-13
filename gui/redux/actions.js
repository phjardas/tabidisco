import axios from 'axios';
import SocketIO from 'socket.io-client';
import { actions as notifActions } from 'redux-notifications';

import { PLAY, STOP, SONGS_LOADED, SONG_ADDED, SONG_MODIFIED, SONG_DELETED, EVENT, EVENTS_LOADED } from './types';

// FIXME make API URL configurable
const apiUrl = typeof window !== 'undefined' ? location.origin.replace(3000, 3001) : 'http://localhost:3001';
const wsUrl = apiUrl.replace(/^http/, 'ws');

const api = axios.create({
  baseURL: apiUrl,
});

let io;

if (typeof window !== 'undefined') {
  io = SocketIO(wsUrl);
}

export function pressButton(button) {
  return async dispatch => {
    try {
      const { data } = await api.post(`/button/${button}`);
      dispatch(notifActions.notifSend({ message: 'Button press succeeded.', kind: 'info', dismissAfter: 2000 }));
    } catch (err) {
      const { data } = err.response;
      dispatch(notifActions.notifSend({ message: `Error pressing ${button} button: ${data.message}`, kind: 'error', dismissAfter: 5000 }));
    }
  };
}

export function loadSongs() {
  return async dispatch => {
    const { data } = await api.get('/songs');
    dispatch({
      type: SONGS_LOADED,
      payload: data,
    });
  };
}

export function getCurrentSong() {
  return async dispatch => {
    const { data } = await api.get('/current');
    const { song } = data;
    dispatch(
      song
        ? {
            type: PLAY,
            payload: data,
          }
        : { type: STOP }
    );
  };
}

export function synchronize() {
  return dispatch => {
    if (io) {
      io.on('event', event => {
        dispatch({ type: EVENT, payload: event });
        switch (event.type) {
          case 'play':
            return dispatch({ type: PLAY, payload: event });
          case 'stop':
            return dispatch({ type: STOP, payload: event });
          case 'song_added':
            return dispatch({ type: SONG_ADDED, payload: event });
          case 'song_modified':
            return dispatch({ type: SONG_MODIFIED, payload: event });
          case 'song_deleted':
            return dispatch({ type: SONG_DELETED, payload: event });
        }
      });
    }
  };
}

export function playSong(tokenId) {
  return async dispatch => api.post('/play', { tokenId });
}

export function stopSong() {
  return async dispatch => api.post('/stop');
}

export function deleteSong(tokenId) {
  return async dispatch => {
    await api.delete(`/songs/${tokenId}`);
  };
}

export function uploadSong(file) {
  return async dispatch => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post(`/songs`, formData, {
        headers: { 'content-type': 'multipart/form-data' },
      });
      dispatch(notifActions.notifSend({ message: 'Song uploaded.', kind: 'info', dismissAfter: 2000 }));
    } catch (err) {
      const { data } = err.response;
      dispatch(notifActions.notifSend({ message: `Song upload failed: ${data.message}`, kind: 'error', dismissAfter: 5000 }));
    }
  };
}

export function loadEvents() {
  return async dispatch => {
    console.log('loading events');
    const { data } = await api.get('/events');
    dispatch({ type: EVENTS_LOADED, payload: data });
  };
}
