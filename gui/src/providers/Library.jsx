import gql from 'graphql-tag';
import React from 'react';
import { Mutation, Query } from 'react-apollo';
import { songDetails } from './data';

const initialQuery = gql`
  query SongData {
    songs {
      ...SongDetails
    }
    currentSong {
      ...SongDetails
    }
  }

  ${songDetails}
`;

const currentSongSubscription = gql`
  subscription Library {
    currentSong {
      ...SongDetails
    }
  }

  ${songDetails}
`;

const addSongMutation = gql`
  mutation AddSong($id: ID, $file: Upload!, $description: String) {
    addSong(id: $id, file: $file, description: $description) {
      success
      error
      song {
        ...SongDetails
      }
    }
  }

  ${songDetails}
`;

const deleteSongMutation = gql`
  mutation DeleteSong($id: ID!) {
    deleteSong(id: $id) {
      success
      error
    }
  }
`;

const playSongMutation = gql`
  mutation PlaySong($id: ID!) {
    playSong(id: $id) {
      success
      error
      song {
        ...SongDetails
      }
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

const readTokenMutation = gql`
  mutation ReadToken {
    readToken {
      success
      error
      token
    }
  }
`;

const Context = React.createContext();

class Library extends React.Component {
  render() {
    const { children, ...value } = this.props;
    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  componentDidMount() {
    const { subscribeToMore } = this.props;
    subscribeToMore();
  }
}

export function LibraryProvider({ children }) {
  return (
    <Query query={initialQuery}>
      {({ loading, error, data, subscribeToMore }) => (
        <Mutation mutation={playSongMutation}>
          {(playSong, playSongResult) => (
            <Mutation mutation={stopSongMutation}>
              {(stopSong, stopSongResult) => (
                <Mutation mutation={addSongMutation}>
                  {(addSong, addSongResult) => (
                    <Mutation mutation={deleteSongMutation}>
                      {(deleteSong, deleteSongResult) => (
                        <Mutation mutation={readTokenMutation}>
                          {(readToken, readTokenResult) => (
                            <Library
                              loading={loading}
                              error={error}
                              songs={data && data.songs}
                              currentSong={data && data.currentSong}
                              readToken={readToken}
                              readTokenResult={readTokenResult}
                              addSong={({ id, file, description }) =>
                                addSong({
                                  variables: { id, file, description },
                                  update: (cache, { data }) => {
                                    if (data && data.addSong && data.addSong.success) {
                                      const cached = cache.readQuery({ query: initialQuery });
                                      cache.writeQuery({
                                        query: initialQuery,
                                        data: {
                                          ...cached,
                                          songs: [...cached.songs, data.addSong.song],
                                        },
                                      });
                                    }
                                  },
                                })
                              }
                              addSongResult={addSongResult}
                              deleteSong={id =>
                                deleteSong({
                                  variables: { id },
                                  update: cache => {
                                    const cached = cache.readQuery({ query: initialQuery });
                                    cache.writeQuery({
                                      query: initialQuery,
                                      data: {
                                        ...cached,
                                        songs: cached.songs.filter(s => s.id !== id),
                                      },
                                    });
                                  },
                                })
                              }
                              deleteSongResult={deleteSongResult}
                              playSong={id => playSong({ variables: { id } })}
                              playSongResult={playSongResult}
                              stopSong={stopSong}
                              stopSongResult={stopSongResult}
                              subscribeToMore={subscribeToMore({
                                document: currentSongSubscription,
                                updateQuery: (prev, { subscriptionData }) => {
                                  if (!subscriptionData.data) return prev;
                                  return { ...prev, ...subscriptionData.data };
                                },
                              })}
                            >
                              {children}
                            </Library>
                          )}
                        </Mutation>
                      )}
                    </Mutation>
                  )}
                </Mutation>
              )}
            </Mutation>
          )}
        </Mutation>
      )}
    </Query>
  );
}

export const WithLibrary = Context.Consumer;
