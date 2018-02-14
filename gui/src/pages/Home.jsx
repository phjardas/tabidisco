import React from 'react';
import { connect } from 'react-redux';

import { playSong, deleteSong, uploadSong, loadSongs, pressButton, readToken } from '../redux';
import Dashboard from '../components/Dashboard';
import Layout from '../components/Layout';

class Home extends React.Component {
  render() {
    const { songs, currentSong, token, dispatch } = this.props;

    return (
      <Layout>
        <Dashboard
          songs={songs}
          currentSong={currentSong}
          token={token}
          play={tokenId => dispatch(playSong(tokenId))}
          deleteSong={tokenId => dispatch(deleteSong(tokenId))}
          uploadSong={file => dispatch(uploadSong(file))}
          stopSong={() => dispatch(pressButton('stop'))}
          readToken={() => dispatch(readToken())}
        />
      </Layout>
    );
  }

  componentWillMount() {
    this.props.dispatch(loadSongs());
  }
}

export default connect(state => ({ songs: state.songs, currentSong: state.currentSong, token: state.token }))(Home);
