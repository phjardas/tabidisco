import { IResolvers } from 'apollo-server-express';
import { resolvers as library } from './library';
import { resolvers as pi } from './pi';
import { resolvers as player } from './player';

const empty: IResolvers<any, any> = {
  Query: {},
  Mutation: {},
};

function merge(a: IResolvers<any, any>, b: IResolvers<any, any>): IResolvers<any, any> {
  return {
    Query: { ...a.Query, ...b.Query },
    Mutation: { ...a.Mutation, ...b.Mutation },
  };
}

export const resolvers = [library, pi, player].reduce(merge, empty);
