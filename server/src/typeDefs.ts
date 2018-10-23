import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    songs: [Song!]!
    currentSong: Song
    power: PowerState!
  }

  type Mutation {
    readToken: ReadTokenResult!
    playSong(id: ID): PlaySongResult!
    stopSong: SimpleResult!
    addSong(file: Upload!, description: String): AddSongResult!
    deleteSong(id: ID!): SimpleResult!
    setPower(power: Boolean!): SimpleResult!
    cancelShutdownTimer: SimpleResult!
    simulateButtonPress(button: String!): SimpleResult!
  }

  type Subscription {
    currentSong: Song
    power: PowerState!
  }

  type Song {
    id: ID!
    filename: String!
    description: String
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
