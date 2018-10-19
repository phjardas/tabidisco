import gql from 'graphql-tag';
import React from 'react';
import { Mutation, Query } from 'react-apollo';

const powerDetails = gql`
  fragment PowerDetails on PowerState {
    powered
    state
    shutdownTimer
  }
`;

const powerQuery = gql`
  query Power {
    power {
      ...PowerDetails
    }
  }

  ${powerDetails}
`;

const powerSubscription = gql`
  subscription Power {
    power {
      ...PowerDetails
    }
  }

  ${powerDetails}
`;

const setPowerMutation = gql`
  mutation SetPower($power: Boolean!) {
    setPower(power: $power) {
      success
      error
    }
  }
`;

const cancelShutdownMutation = gql`
  mutation CancelShutdown {
    cancelShutdownTimer {
      success
      error
    }
  }
`;

const Context = React.createContext();

class Power extends React.Component {
  render() {
    const { power, setPower, cancelShutdownTimer, children } = this.props;
    return <Context.Provider value={{ power, setPower, cancelShutdownTimer }}>{children}</Context.Provider>;
  }

  componentDidMount() {
    const { subscribeToMore } = this.props;
    subscribeToMore();
  }
}

export function PowerProvider({ children }) {
  return (
    <Query query={powerQuery}>
      {({ data, subscribeToMore }) => (
        <Mutation mutation={setPowerMutation}>
          {setPower => (
            <Mutation mutation={cancelShutdownMutation}>
              {cancelShutdownTimer => (
                <Power
                  power={data && data.power}
                  setPower={power => setPower({ variables: { power } })}
                  cancelShutdownTimer={cancelShutdownTimer}
                  subscribeToMore={subscribeToMore({
                    document: powerSubscription,
                    updateQuery: (prev, { subscriptionData }) => {
                      if (!subscriptionData.data) return prev;
                      return subscriptionData.data || prev;
                    },
                  })}
                >
                  {children}
                </Power>
              )}
            </Mutation>
          )}
        </Mutation>
      )}
    </Query>
  );
}

export const WithPower = Context.Consumer;
