import { ApolloProvider as ApolloProviderImpl } from '@apollo/react-hooks';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { onError } from 'apollo-link-error';
import { WebSocketLink } from 'apollo-link-ws';
import { createUploadLink } from 'apollo-upload-client';
import { getMainDefinition } from 'apollo-utilities';
import React from 'react';
import { graphqlEndpoint } from '../config';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) => console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`));
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const endpoint = graphqlEndpoint;
const wsEndpoint = endpoint.startsWith('http') ? endpoint.replace(/^http/, 'ws') : `ws://${window.location.host}/graphql`;

console.info('GraphQL REST endpoint: %s', endpoint);
console.info('GraphQL WebSocket endpoint: %s', wsEndpoint);

const httpLink = createUploadLink({
  uri: endpoint,
  credentials: 'same-origin',
});

const wsLink = new WebSocketLink({
  uri: wsEndpoint,
  options: {
    reconnect: true,
  },
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink
);

export const apollo = new ApolloClient({
  link: ApolloLink.from([errorLink, link]),
  cache: new InMemoryCache(),
});

export function ApolloProvider({ children }) {
  return <ApolloProviderImpl client={apollo}>{children}</ApolloProviderImpl>;
}
