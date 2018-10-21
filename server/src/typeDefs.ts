import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    songs: [Song!]!
    currentSong: Song
    power: PowerState!
  }

  type Mutation {
    readToken: ReadTokenResult!
    playSong(tokenId: ID): PlaySongResult!
    stopSong: SimpleResult!
    addSong(tokenId: ID, file: Upload!): AddSongResult!
    deleteSong(tokenId: ID!): SimpleResult!
    setPower(power: Boolean!): SimpleResult!
    cancelShutdownTimer: SimpleResult!
    simulateButtonPress(button: String!): SimpleResult!
  }

  type Subscription {
    currentSong: Song
    power: PowerState!
  }

  type Song {
    tokenId: ID!
    filename: String!
    type: String!
    size: Int!
    plays: Int!
    lastPlayedAt: String
    artist: String
    title: String
    album: String
  }

  type PowerState {
    powered: Boolean!
    state: String!
    shutdownTimer: Boolean
  }

  type SimpleResult {
    success: Boolean!
    error: String
  }

  type ReadTokenResult {
    success: Boolean!
    error: String
    token: String
  }

  type PlaySongResult {
    success: Boolean!
    error: String
    song: Song
  }

  type AddSongResult {
    success: Boolean!
    error: String
    song: Song
  }
`;
