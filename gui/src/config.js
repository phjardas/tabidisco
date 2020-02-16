export const graphqlEndpoint = process.env.REACT_APP_GRAPHQL_ENDPOINT || 'http://localhost:3001/graphql';
export const serverBaseUrl = graphqlEndpoint.replace(/\/graphql$/, '');
