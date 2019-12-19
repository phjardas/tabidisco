import React, { createContext, useContext, useMemo } from 'react';
import { useSubscription, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';

const PlaybackContext = createContext();

export function PlaybackProvider({ children }) {
  const { data } = useSubscription(subscription);
  const [play] = useMutation(playMutation);
  const [stop] = useMutation(stopMutation);
  const [pause] = useMutation(pauseMutation);
  const [resume] = useMutation(resumeMutation);

  const context = useMemo(
    () =>
      data && data.playback
        ? {
            playback: data.playback,
            stop,
            pause,
            resume,
          }
        : {
            playback: null,
            play: (mediumId) => play({ variables: { mediumId } }),
          },
    [data, play, stop, pause, resume]
  );

  return <PlaybackContext.Provider value={context}>{children}</PlaybackContext.Provider>;
}

export function usePlayback() {
  return useContext(PlaybackContext);
}

const playbackFragment = gql`
  fragment PlaybackData on Playback {
    medium {
      id
      title
      duration
    }
    elapsedSeconds
    paused
  }
`;

const subscription = gql`
  subscription Playback {
    playback {
      ...PlaybackData
    }
  }

  ${playbackFragment}
`;

const playMutation = gql`
  mutation Play($mediumId: ID!) {
    play(mediumId: $mediumId) {
      success
      message
      stack
      playback {
        ...PlaybackData
      }
    }
  }
  ${playbackFragment}
`;

const stopMutation = gql`
  mutation Stop {
    stop {
      success
      message
      stack
    }
  }
`;

const pauseMutation = gql`
  mutation Pause {
    pause {
      success
      message
      stack
      playback {
        ...PlaybackData
      }
    }
  }
  ${playbackFragment}
`;

const resumeMutation = gql`
  mutation Resume {
    resume {
      success
      message
      stack
      playback {
        ...PlaybackData
      }
    }
  }
  ${playbackFragment}
`;
