import gql from 'graphql-tag';
import React from 'react';
import { Mutation, Query } from 'react-apollo';
import { Alert, Container } from 'reactstrap';
import { WithCurrentSong } from '../providers/CurrentSong';
import { songDetails } from '../providers/data';
import SongList from './SongList';
import Upload from './Upload';

export const getSongsQuery = gql`
  query GetSongs {
    songs {
      ...SongDetails
    }
  }

  ${songDetails}
`;

const playSongMutation = gql`
  mutation PlaySong($tokenId: ID!) {
    playSong(tokenId: $tokenId) {
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
  mutation DeleteSong($tokenId: ID!) {
    deleteSong(tokenId: $tokenId) {
      success
      error
    }
  }
`;

function Library({ songs, currentSong, play, stopSong, deleteSong }) {
  return (
    <Container className="mt-3">
      <Upload />
      <SongList songs={songs} currentSong={currentSong} play={play} stopSong={stopSong} deleteSong={deleteSong} />
    </Container>
  );
}

export default () => (
  <WithCurrentSong>
    {({ currentSong, stopSong }) => (
      <Query query={getSongsQuery}>
        {({ loading, error, data }) => {
          if (loading) return <Alert color="info">Loading&hellip;</Alert>;
          if (error) return <Alert color="danger">Error: {error.message}</Alert>;
          return (
            <Mutation mutation={playSongMutation}>
              {playSong => (
                <Mutation mutation={deleteSongMutation}>
                  {deleteSong => (
                    <Library
                      songs={data.songs}
                      currentSong={currentSong}
                      play={tokenId => playSong({ variables: { tokenId } })}
                      stopSong={stopSong}
                      deleteSong={tokenId =>
                        deleteSong({
                          variables: { tokenId },
                          update: cache => {
                            const { songs } = cache.readQuery({ query: getSongsQuery });
                            cache.writeQuery({
                              query: getSongsQuery,
                              data: { songs: songs.filter(s => s.tokenId !== tokenId) },
                            });
                          },
                        })
                      }
                    />
                  )}
                </Mutation>
              )}
            </Mutation>
          );
        }}
      </Query>
    )}
  </WithCurrentSong>
);
