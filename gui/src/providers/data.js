import gql from 'graphql-tag';

export const songDetails = gql`
  fragment SongDetails on Song {
    tokenId
    artist
    album
    title
    filename
    size
    plays
    lastPlayedAt
  }
`;
