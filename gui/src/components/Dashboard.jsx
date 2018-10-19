import gql from 'graphql-tag';
import React from 'react';
import { Mutation, Query } from 'react-apollo';
import { Alert, Container } from 'reactstrap';
import { WithCurrentSong } from '../providers/CurrentSong';
import { songDetails } from '../providers/data';
import SongList from './SongList';

const getSongsQuery = gql`
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

function Dashboard({ songs, currentSong, play, stopSong }) {
  return (
    <Container className="mt-3">
      <SongList songs={songs} currentSong={currentSong} play={play} stopSong={stopSong} />
    </Container>
  );
}

export default () => (
  <WithCurrentSong>
    {({ currentSong, stopSong }) => (
      <Query query={getSongsQuery}>
        {({ loading, error, data: { songs } }) => {
          if (loading) return <Alert color="info">Loading&hellip;</Alert>;
          if (error) return <Alert color="danger">Error: {error.message}</Alert>;
          return (
            <Mutation mutation={playSongMutation}>
              {playSong => (
                <Dashboard
                  songs={songs}
                  currentSong={currentSong}
                  play={tokenId => playSong({ variables: { tokenId } })}
                  stopSong={stopSong}
                />
              )}
            </Mutation>
          );
        }}
      </Query>
    )}
  </WithCurrentSong>
);
