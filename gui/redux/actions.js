import axios from 'axios';
import SocketIO from 'socket.io-client';

import { PLAY, STOP, SONGS_LOADED } from './types';

// FIXME make API URL configurable
const apiUrl = 'http://localhost:3001';
const wsUrl = apiUrl.replace(/^http/, 'ws');

const api = axios.create({
  baseURL: apiUrl,
});

let io;

if (typeof window !== 'undefined') {
  io = SocketIO(wsUrl);
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
      io.on('play', event => dispatch({ type: PLAY, payload: event }));
      io.on('stop', event => dispatch({ type: STOP, payload: event }));
    }
  };
}

export function playSong(tokenId) {
  return async dispatch => io.emit('play', tokenId);
}
