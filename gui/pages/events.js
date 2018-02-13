import React from 'react';
import { Container } from 'reactstrap';

import { withRedux, loadEvents } from '../redux';
import Layout from '../components/Layout';

function EventDetails({ event }) {
  switch (event.type) {
    case 'log':
      return (
        <React.Fragment>
          <td>{event.level}</td>
          <td>
            {event.message}
            <br />
            {event.args}
          </td>
        </React.Fragment>
      );
    case 'play':
    case 'stop':
      return (
        <React.Fragment>
          <td />
          <td>
            {event.song.tokenId}
            <br />
            {event.song.filename}
          </td>
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
  static async getInitialProps({ store }) {
    await store.dispatch(loadEvents());
    return {};
  }

  render() {
    const { events } = this.props;

    return (
      <Layout>
        <table className="table">
          <tbody>
            {Object.keys(events)
              .map(id => events[id])
              .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
              .map(event => (
                <tr key={event.id}>
                  <td>
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
      </Layout>
    );
  }
}

export default withRedux(state => ({ events: state.events }))(Events);
