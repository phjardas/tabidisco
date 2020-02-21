import { PubSub } from 'graphql-subscriptions';
import gql from 'graphql-tag';
import { makeExecutableSchema } from 'graphql-tools';
import * as library from './library';
import * as sonos from './sonos';

const typeDefs = gql`
  scalar Upload

  type Query {
    media: [Medium!]!
    playback: Playback
    sonosGroups: SonosGroups!
  }

  type Mutation {
    play(mediumId: ID!): PlaybackResult!
    stop: SimpleResult!
    pause: PlaybackResult!
    resume: PlaybackResult!
    createMedium(title: String!, artist: String, file: Upload!, image: Upload!): MediumResult!
    deleteMedium(id: ID!): MediumResult!
    setSonosGroup(id: ID!): SonosGroups!
  }

  type Subscription {
    playback: Playback
    media: MediumEvent!
    sonosGroups: SonosGroups!
  }

  type Medium {
    id: ID!
    artist: String
    title: String!
    duration: Int
    playCount: Int
  }

  type Playback {
    medium: Medium!
    paused: Boolean!
  }

  type SimpleResult {
    success: Boolean!
    message: String
    stack: String
  }

  type PlaybackResult {
    success: Boolean!
    message: String
    stack: String
    playback: Playback
  }

  type MediumResult {
    success: Boolean!
    message: String
    stack: String
    medium: Medium
  }

  type MediumEvent {
    type: String!
    medium: Medium!
  }

  type SonosGroups {
    id: ID!
    groups: [SonosGroup!]!
    selectedGroup: ID
  }

  type SonosGroup {
    id: ID!
    label: String!
  }
`;

const pubsub = new PubSub();
pubsub.publish('playback', { playback: null });

sonos.on('playback', (playback) => pubsub.publish('playback', { playback }));
sonos.on('groups', (sonosGroups) => pubsub.publish('sonosGroups', { sonosGroups }));
library.registerListener((event) => pubsub.publish('media', { media: event }));

const resolvers = {
  Query: {
    media: () => library.getMedia(),
    playback: () => sonos.getPlayback(),
    sonosGroups: () => sonos.getGroups(),
  },
  Mutation: {
    play: async (_, { mediumId }) => {
      try {
        const medium = await library.findMedium(mediumId);
        if (!medium) throw new Error(`Medium nicht gefunden: ${mediumId}`);
        const playback = await sonos.play(medium);
        return { success: true, playback };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    stop: async () => {
      try {
        await sonos.stop();
        return { success: true };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    pause: async () => {
      try {
        const playback = await sonos.pause();
        return { success: true, playback };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    resume: async () => {
      try {
        const playback = await sonos.resume();
        return { success: true, playback };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    createMedium: async (_, args) => {
      try {
        const medium = await library.createMedium(args);
        return { success: true, medium };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    deleteMedium: async (_, { id }) => {
      try {
        const medium = await library.deleteMedium(id);
        return { success: true, medium };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    setSonosGroup: (_, { id }) => sonos.setSonosGroup(id),
  },
  Subscription: {
    playback: {
      subscribe: () => pubsub.asyncIterator(['playback']),
    },
    media: {
      subscribe: () => pubsub.asyncIterator(['media']),
    },
    sonosGroups: {
      subscribe: () => pubsub.asyncIterator(['sonosGroups']),
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
