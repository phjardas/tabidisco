import React from 'react';
import { Link as RRLink, NavLink as RRNavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Alert, Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import { Notifs } from 'redux-notifications';

import { pressButton, setPower, cancelShutdownTimer } from '../redux';
import FontAwesome from './FontAwesome';
import Buttons from './Buttons';
import ConnectionState from './ConnectionState';
import CurrentSong from './CurrentSong';
import Footer from './Footer';

const Layout = ({ info, connectionState, children, currentSong, token, power, dispatch }) => (
  <React.Fragment>
    <Navbar color="primary" dark>
      <Container className="d-flex">
        <NavbarBrand to="/" tag={RRLink}>
          <FontAwesome name="music" className="mr-2" />
          Tabidisco
        </NavbarBrand>
        <Nav navbar>
          <NavItem>
            <NavLink to="/events" tag={RRNavLink}>
              Events
            </NavLink>
          </NavItem>
        </Nav>
        <div className="ml-auto">
          <Buttons
            power={power}
            setPower={powered => dispatch(setPower(powered))}
            cancelShutdownTimer={() => dispatch(cancelShutdownTimer())}
            pressButton={button => dispatch(pressButton(button))}
          />
        </div>
      </Container>
    </Navbar>

    <ConnectionState state={connectionState} />

    {children}

    <Footer info={info} />

    <CurrentSong currentSong={currentSong} stopSong={() => dispatch(pressButton('stop'))} />
    <Notifs CustomComponent={({ kind, message }) => <Alert color={kind === 'error' ? 'danger' : kind}>{message}</Alert>} />
  </React.Fragment>
);

export default connect(state => ({
  info: state.info,
  connectionState: state.connection.state,
  currentSong: state.currentSong,
  power: state.power,
}))(Layout);
