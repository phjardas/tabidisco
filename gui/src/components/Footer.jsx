import React from 'react';
import { Container, Navbar } from 'reactstrap';
import Buttons from './Buttons';
import CurrentSong from './CurrentSong';

export default function Footer({ power, setPower, cancelShutdownTimer, pressButton, currentSong }) {
  return (
    <Navbar color="primary" dark fixed="bottom">
      <Container>
        {currentSong && <CurrentSong currentSong={currentSong} />}
        <div className="ml-auto">
          <Buttons power={power} setPower={setPower} cancelShutdownTimer={cancelShutdownTimer} pressButton={pressButton} />
        </div>
      </Container>
    </Navbar>
  );
}
