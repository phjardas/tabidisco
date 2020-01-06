import gql from 'graphql-tag';
import React, { useContext } from 'react';
import { Mutation, Query, Subscription } from 'react-apollo';

const SettingsDetails = gql`
  fragment SettingsDetails on Settings {
    output {
      type
      groupId
    }
  }
`;

const SonosGroupDetails = gql`
  fragment SonosGroupDetails on SonosGroup {
    id
    name
  }
`;

const settingsQuery = gql`
  query Settings {
    settings {
      ...SettingsDetails
    }
    sonosGroups {
      ...SonosGroupDetails
    }
  }

  ${SettingsDetails}
  ${SonosGroupDetails}
`;

const setOutputMutation = gql`
  mutation SetOutput($type: ID!, $groupId: String) {
    setOutput(type: $type, groupId: $groupId) {
      success
      error
      settings {
        ...SettingsDetails
      }
    }
  }

  ${SettingsDetails}
`;

const settingsSubscription = gql`
  subscription Settings {
    settings {
      ...SettingsDetails
    }
  }

  ${SettingsDetails}
`;

const Context = React.createContext();

export function SettingsProvider({ children }) {
  return (
    <Query query={settingsQuery}>
      {({ data }) =>
        data && data.settings ? (
          <Subscription subscription={settingsSubscription}>
            {({ data: subData }) => (
              <Mutation mutation={setOutputMutation}>
                {setOutput => {
                  const context = {
                    settings: (subData || data).settings,
                    sonosGroups: data.sonosGroups,
                    setOutput,
                  };
                  return <Context.Provider value={context}>{children}</Context.Provider>;
                }}
              </Mutation>
            )}
          </Subscription>
        ) : null
      }
    </Query>
  );
}

export function useSettings() {
  return useContext(Context);
}
