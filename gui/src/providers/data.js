import gql from 'graphql-tag';

export const songDetails = gql`
  fragment SongDetails on Song {
    id
    artist
    album
    title
    description
    filename
    size
    plays
    lastPlayedAt
  }
`;
