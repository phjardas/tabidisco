import { IResolvers } from 'apollo-server-express';
import { pi } from '../lib';

type ReadTokenResult =
  | {
      success: true;
      token: string;
    }
  | {
      success: false;
      error: string;
    };

async function readToken(): Promise<ReadTokenResult> {
  try {
    const token = await pi.readToken();
    return { success: true, token };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const resolvers: IResolvers = {
  Query: {},
  Mutation: {
    readToken,
  },
};
