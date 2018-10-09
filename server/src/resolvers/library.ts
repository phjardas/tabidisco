import { IResolvers } from 'apollo-server-express';
import { library } from '../lib';

export const resolvers: IResolvers = {
  Query: {
    songs: () => library.songs,
  },
  Mutation: {},
};
