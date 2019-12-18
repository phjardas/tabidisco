import { makeExecutableSchema } from 'graphql-tools';
import gql from 'graphql-tag';
import * as library from './library';
import * as player from './player-dev';
import { PubSub } from 'graphql-subscriptions';

const typeDefs = gql`
  type Query {
    media: [Medium!]!
    playback: Playback
  }

  type Mutation {
    play(mediumId: ID!): PlayResult!
    stop: SimpleResult
  }

  type Subscription {
    playback: Playback
  }

  type Medium {
    id: ID!
    title: String!
    artist: String
    duration: Int
    image: String
  }

  type Playback {
    medium: Medium!
    elapsedSeconds: Int!
    paused: Boolean!
  }

  type SimpleResult {
    success: Boolean!
    message: String
  }

  type PlayResult {
    success: Boolean!
    message: String
    stack: String
    playback: Playback
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
  },
  Subscription: {
    playback: {
      subscribe: () => pubsub.asyncIterator(['playback']),
    },
  },
};

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});