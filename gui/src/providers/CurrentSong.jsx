import gql from 'graphql-tag';
import React from 'react';
import { Mutation, Query } from 'react-apollo';
import { songDetails } from './data';

const currentSongQuery = gql`
  query CurrentSong {
    currentSong {
      ...SongDetails
    }
  }

  ${songDetails}
`;

const currentSongSubscription = gql`
  subscription CurrentSong {
    currentSong {
      ...SongDetails
    }
  }

  ${songDetails}
`;

const stopSongMutation = gql`
  mutation StopSong {
    stopSong {
      success
      error
    }
  }
`;

const Context = React.createContext();

class CurrentSong extends React.Component {
  render() {
    const { currentSong, stopSong, children } = this.props;
    return <Context.Provider value={{ currentSong, stopSong }}>{children}</Context.Provider>;
  }

  componentDidMount() {
    const { subscribeToMore } = this.props;
    subscribeToMore();
  }
}

export function CurrentSongProvider({ children }) {
  return (
    <Query query={currentSongQuery}>
      {({ data, subscribeToMore }) => (
        <Mutation mutation={stopSongMutation}>
          {stopSong => (
            <CurrentSong
              currentSong={data && data.currentSong}
              stopSong={stopSong}
              subscribeToMore={subscribeToMore({
                document: currentSongSubscription,
                updateQuery: (prev, { subscriptionData }) => {
                  if (!subscriptionData.data) return prev;
                  return subscriptionData.data || prev;
                },
              })}
            >
              {children}
            </CurrentSong>
          )}
        </Mutation>
      )}
    </Query>
  );
}

export const WithCurrentSong = Context.Consumer;
