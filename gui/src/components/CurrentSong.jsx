import React from 'react';
import { Button, Container, Navbar } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function CurrentSong({ currentSong, stopSong }) {
  return (
    <Navbar color="primary" dark fixed="bottom">
      <Container>
        <span className="navbar-text">
          <FontAwesome icon="play" className="mr-2" />
          {currentSong.title || currentSong.filename}
        </span>
        <Button color="light" outline onClick={stopSong}>
          <FontAwesome icon="stop" />
        </Button>
      </Container>
    </Navbar>
  );
}
