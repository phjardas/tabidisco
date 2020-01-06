import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Query {
    songs: [Song!]!
    currentSong: Song
    power: PowerState!
    logs: [LogEvent!]!
    settings: Settings!
    sonosGroups: [SonosGroup!]!
  }

  type Mutation {
    readToken: ReadTokenResult!
    playSong(id: ID): PlaySongResult!
    stopSong: SimpleResult!
    addSong(id: ID, file: Upload!, description: String): AddSongResult!
    deleteSong(id: ID!): SimpleResult!
    setPower(power: Boolean!): SimpleResult!
    cancelShutdownTimer: SimpleResult!
    simulateButtonPress(button: String!): SimpleResult!
    setOutput(type: ID!, groupId: String): SettingsResult!
  }

  type Subscription {
    currentSong: Song
    power: PowerState!
    log: LogEvent!
    settings: Settings!
    sonosGroups: [SonosGroup!]!
  }

  type Song {
    id: ID!
    filename: String!
    description: String
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

  type LogEvent {
    time: String!
    msg: String!
    module: String!
    level: Int!
  }

  type Settings {
    output: OutputChannel!
  }

  type SettingsResult {
    success: Boolean!
    error: String
    settings: Settings!
  }

  type OutputChannel {
    type: ID!
    groupId: String
  }

  type SonosGroup {
    id: ID!
    name: String!
  }
`;
