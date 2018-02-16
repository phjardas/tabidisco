import React from 'react';
import { Button, Container, Navbar } from 'reactstrap';
import FontAwesome from './FontAwesome';

export default function CurrentSong({ currentSong, stopSong }) {
  return (
    currentSong && (
      <Navbar color="primary" dark fixed="bottom">
        <Container>
          <span className="navbar-text">
            <FontAwesome name="play" className="mr-2" />
            {currentSong.title || currentSong.filename}
          </span>
          <Button color="light" outline onClick={stopSong}>
            <FontAwesome name="stop" />
          </Button>
        </Container>
      </Navbar>
    )
  );
}
