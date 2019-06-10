import gql from 'graphql-tag';
import React, { useEffect } from 'react';
import { Query } from 'react-apollo';
import { Badge, Container, Table } from 'reactstrap';

const eventsQuery = gql`
  query EventsQuery {
    logs {
      time
      level
      module
      msg
    }
  }
`;

const eventsSubscription = gql`
  subscription EventsSubscription {
    log {
      time
      level
      module
      msg
    }
  }
`;

function LogLevel({ level }) {
  const colors = {
    10: 'secondary',
    20: 'secondary',
    30: 'info',
    40: 'warning',
    50: 'danger',
  };

  const labels = {
    10: 'trace',
    20: 'debug',
    30: 'info',
    40: 'warning',
    50: 'error',
  };

  return <Badge color={colors[level]}>{labels[level]}</Badge>;
}

function EventsList({ events, subscribeToMore }) {
  useEffect(() => {
    subscribeToMore({
      document: eventsSubscription,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return { ...prev, logs: [...prev.logs, subscriptionData.data.log] };
      },
    });
  }, []);

  return (
    <Table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Level</th>
          <th>Module</th>
          <th>Message</th>
        </tr>
      </thead>
      <tbody>
        {events.sort((a, b) => -a.time.localeCompare(b.time)).map(event => (
          <tr key={event.time + event.module + event.msg}>
            <td className="text-nowrap">
              {new Date(event.time).toLocaleTimeString()}
              <br />
              <small>{new Date(event.time).toLocaleDateString()}</small>
            </td>
            <td>
              <LogLevel level={event.level} />
            </td>
            <td>{event.module}</td>
            <td>{event.msg}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}

export default () => {
  return (
    <Container className="mb-3">
      <Query query={eventsQuery}>
        {({ loading, data, error, subscribeToMore }) => {
          if (loading) return 'loading';
          if (error) return error.message;
          return <EventsList events={data.logs} subscribeToMore={subscribeToMore} />;
        }}
      </Query>
    </Container>
  );
};
