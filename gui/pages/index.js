import React from 'react';
import { Alert, Button, Container, ListGroup, ListGroupItem, ListGroupItemHeading, ListGroupItemText } from 'reactstrap';

import { withRedux, loadSongs, getCurrentSong, synchronize, playSong } from '../redux';
import Layout from '../components/Layout';

class Home extends React.Component {
  static async getInitialProps({ store }) {
    await Promise.all([store.dispatch(loadSongs()), store.dispatch(getCurrentSong())]);
    return {};
  }

  render() {
    const { songs, currentSong } = this.props;

    return (
      <Layout>
        <Container className="mt-3">
          {currentSong && (
            <Alert color="info">
              <h4 className="alert-heading">{currentSong.filename}</h4>
              <p className="mb-0">since {new Date(currentSong.playingSince).toLocaleTimeString()}</p>
            </Alert>
          )}

          <ListGroup>
            {Object.keys(songs)
              .map(id => songs[id])
              .map(song => (
                <ListGroupItem
                  key={song.tokenId}
                  tag="a"
                  href=""
                  action
                  active={currentSong && currentSong.tokenId === song.tokenId}
                  onClick={this.play.bind(this, song)}
                >
                  <ListGroupItemHeading>{song.filename}</ListGroupItemHeading>
                  <ListGroupItemText className="mb-0">{song.tokenId}</ListGroupItemText>
                </ListGroupItem>
              ))}
          </ListGroup>
        </Container>
      </Layout>
    );
  }

  componentWillMount() {
    this.props.dispatch(synchronize());
  }

  play(song, event) {
    event.preventDefault();
    this.props.dispatch(playSong(song.tokenId));
  }
}

export default withRedux(state => ({ songs: state.songs, currentSong: state.currentSong }))(Home);
