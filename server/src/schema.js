import { makeExecutableSchema } from 'graphql-tools';
import gql from 'graphql-tag';
import * as library from './library';
import * as player from './player-dev';
import { PubSub } from 'graphql-subscriptions';

const typeDefs = gql`
  scalar Upload

  type Query {
    media: [Medium!]!
    playback: Playback
  }

  type Mutation {
    play(mediumId: ID!): PlaybackResult!
    stop: SimpleResult!
    pause: PlaybackResult!
    resume: PlaybackResult!
    createMedium(title: String!, file: Upload!, image: Upload!): MediumResult!
  }

  type Subscription {
    playback: Playback
  }

  type Medium {
    id: ID!
    title: String!
    duration: Int
    image: String!
  }

  type Playback {
    medium: Medium!
    elapsedSeconds: Int!
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
`;

const pubsub = new PubSub();
pubsub.publish('playback', { playback: null });

player.registerListener((playback) => pubsub.publish('playback', { playback }));

const resolvers = {
  Query: {
    media: () => library.getMedia(),
    playback: () => player.getPlayback(),
  },
  Mutation: {
    play: async (_, { mediumId }) => {
      try {
        const medium = await library.findMedium(mediumId);
        if (!medium) throw new Error(`Medium nicht gefunden: ${mediumId}`);
        const playback = await player.play(medium);
        return { success: true, playback };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    stop: async () => {
      try {
        await player.stop();
        return { success: true };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    pause: async () => {
      try {
        const playback = await player.pause();
        return { success: true, playback };
      } catch (error) {
        return { success: false, message: error.message, stack: error.stack };
      }
    },
    resume: async () => {
      try {
        const playback = await player.resume();
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
  },
  Subscription: {
    playback: {
      subscribe: () => pubsub.asyncIterator(['playback']),
    },
  },
  Medium: {
    image: (medium) => library.getImage(medium),
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
