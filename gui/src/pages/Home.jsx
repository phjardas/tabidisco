import React from 'react';
import { connect } from 'react-redux';

import { playSong, deleteSong, uploadSong, loadSongs, pressButton } from '../redux';
import Dashboard from '../components/Dashboard';
import Layout from '../components/Layout';

class Home extends React.Component {
  render() {
    const { songs, currentSong, dispatch } = this.props;

    return (
      <Layout>
        <Dashboard
          songs={songs}
          currentSong={currentSong}
          play={tokenId => dispatch(playSong(tokenId))}
          deleteSong={tokenId => dispatch(deleteSong(tokenId))}
          uploadSong={file => dispatch(uploadSong(file))}
          stopSong={() => dispatch(pressButton('stop'))}
        />
      </Layout>
    );
  }

  componentWillMount() {
    this.props.dispatch(loadSongs());
  }
}

export default connect(state => ({ songs: state.songs, currentSong: state.currentSong }))(Home);
