import React, { createContext, useContext } from 'react';
import { useSubscription } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const PlaybackContext = createContext();

export function PlaybackProvider({ children }) {
  const { data } = useSubscription(gql`
    subscription Playback {
      playback {
        medium {
          id
          title
          artist
          duration
        }
        elapsedSeconds
        paused
      }
    }
  `);

  const context = data && data.playback ? { playback: data.playback } : { playback: null };

  return <PlaybackContext.Provider value={context}>{children}</PlaybackContext.Provider>;
}

export function usePlayback() {
  return useContext(PlaybackContext);
}
