import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    songs: [Song!]!
    currentSong: Song
  }

  type Mutation {
    readToken: ReadTokenResult!
    playSong(tokenId: ID): PlaySongResult!
    stopSong: SimpleResult!
  }

  type Song {
    tokenId: ID!
    filename: String!
    type: String!
    size: Int!
    plays: Int
    lastPlayedAt: String
    artist: String
    title: String
    album: String
  }

  type SimpleResult {
    success: Boolean!
    error: String
  }

  type ReadTokenResult {
    success: Boolean!
    token: String
    error: String
  }

  type PlaySongResult {
    success: Boolean!
    song: Song
    error: String
  }
`;
