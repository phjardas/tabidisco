import { useQuery, useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import React, { createContext, useContext, useEffect, useCallback } from 'react';

const SonosContext = createContext();

const SonosGroupsFragment = gql`
  fragment SonosGroupsFragment on SonosGroups {
    id
    groups {
      id
      label
    }
    selectedGroup
  }
`;

const SonosGroupsQuery = gql`
  query SonosGroups {
    sonosGroups {
      ...SonosGroupsFragment
    }
  }
  ${SonosGroupsFragment}
`;

const SonosGroupsSubscription = gql`
  subscription SonosGroups {
    sonosGroups {
      ...SonosGroupsFragment
    }
  }
  ${SonosGroupsFragment}
`;

const SetSonosGroupMutation = gql`
  mutation SonosGroupMutation($id: ID!) {
    setSonosGroup(id: $id) {
      ...SonosGroupsFragment
    }
  }
  ${SonosGroupsFragment}
`;

export function SonosProvider({ children }) {
  const { loading, error, data, subscribeToMore } = useQuery(SonosGroupsQuery);

  useEffect(() => {
    if (subscribeToMore) {
      subscribeToMore({
        document: SonosGroupsSubscription,
        updateQuery(
          _,
          {
            subscriptionData: {
              data: { sonosGroups },
            },
          }
        ) {
          return { sonosGroups };
        },
      });
    }
  }, [subscribeToMore]);

  const [setSonosGroupMutation] = useMutation(SetSonosGroupMutation);

  const setSonosGroup = useCallback((id) => setSonosGroupMutation({ variables: { id } }), [setSonosGroupMutation]);

  return <SonosContext.Provider value={{ loading, error, data: data && data.sonosGroups, setSonosGroup }}>{children}</SonosContext.Provider>;
}

export function useSonos() {
  return useContext(SonosContext);
}
