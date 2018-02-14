import React from 'react';
import { connect } from 'react-redux';
import { Container } from 'reactstrap';

import FontAwesome from '../components/FontAwesome';
import Layout from '../components/Layout';

function EventDetails({ event }) {
  switch (event.type) {
    case 'log':
      return (
        <React.Fragment>
          <td style={{ whiteSpace: 'nowrap' }}>
            <span className={`text-${event.level === 'error' ? 'danger' : event.level} `}>
              <FontAwesome name="info" className="mr-1" />
              {event.level}
            </span>
            <br />
            {event.module}
          </td>
          <td>
            {event.message}
            <br />
            {event.args}
          </td>
        </React.Fragment>
      );
    case 'action':
      const error = event.action.type.endsWith('.error');
      const success = event.action.type.endsWith('.success');
      const className = error ? 'text-danger' : success ? 'text-success' : '';
      const icon = error ? 'exclamation-circle' : success ? 'check' : null;
      return (
        <React.Fragment>
          <td className={className} style={{ whiteSpace: 'nowrap' }}>
            {icon && <FontAwesome name={icon} className="mr-1" />}
            <strong>{event.action.type}</strong>
          </td>
          <td>{JSON.stringify(event.action.payload || event.action.error)}</td>
        </React.Fragment>
      );
    default:
      return (
        <React.Fragment>
          <td />
          <td>{JSON.stringify(event)}</td>
        </React.Fragment>
      );
  }
}

class Events extends React.Component {
  render() {
    const { events } = this.props;

    return (
      <Layout>
        <Container fluid>
          <table className="table">
            <tbody>
              {Object.keys(events)
                .map(id => events[id])
                .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
                .map(event => (
                  <tr key={event.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {new Date(event.timestamp).toLocaleDateString()}
                      <br />
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td>{event.type}</td>
                    <EventDetails event={event} />
                  </tr>
                ))}
            </tbody>
          </table>
        </Container>
      </Layout>
    );
  }
}

export default connect(state => ({ events: state.events }))(Events);
