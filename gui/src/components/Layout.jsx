import React from 'react';
import { Link as RRLink, NavLink as RRNavLink } from 'react-router-dom';
import { Container, Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';
import { WithCurrentSong } from '../providers/CurrentSong';
import CurrentSong from './CurrentSong';
import FontAwesome from './FontAwesome';
import Buttons from './Buttons';
import { WithPower } from '../providers/Power';

const Layout = ({ children, currentSong, stopSong, power, setPower, cancelShutdownTimer }) => (
  <>
    <Navbar color="primary" dark className="navbar-expand">
      <Container className="d-flex">
        <NavbarBrand to="/" tag={RRLink}>
          <FontAwesome icon="music" className="mr-2" />
          Tabidisco
        </NavbarBrand>
        <div className="collapse navbar-collapse">
          <Nav navbar>
            <NavItem>
              <NavLink to="/library" tag={RRNavLink}>
                Library
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink to="/upload" tag={RRNavLink}>
                Upload
              </NavLink>
            </NavItem>
          </Nav>
        </div>
        <div className="ml-auto">
          <Buttons power={power} setPower={setPower} cancelShutdownTimer={cancelShutdownTimer} />
        </div>
      </Container>
    </Navbar>

    {children}

    {currentSong && <CurrentSong currentSong={currentSong} stopSong={stopSong} />}
  </>
);

export default ({ children }) => (
  <WithCurrentSong>
    {({ currentSong, stopSong }) => (
      <WithPower>
        {({ power, setPower, cancelShutdownTimer }) => (
          <Layout currentSong={currentSong} stopSong={stopSong} power={power} setPower={setPower} cancelShutdownTimer={cancelShutdownTimer}>
            {children}
          </Layout>
        )}
      </WithPower>
    )}
  </WithCurrentSong>
);
