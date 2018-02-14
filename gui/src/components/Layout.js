import React from 'react';
import { Link as RRLink, NavLink as RRNavLink } from 'react-router-dom';
import { connect } from 'react-redux';
import { Container, Alert, Button, Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';
import { Notifs } from 'redux-notifications';

import { pressButton } from '../redux';
import FontAwesome from './FontAwesome';
import CurrentSong from './CurrentSong';

const Layout = ({ children, currentSong, token, dispatch }) => (
  <React.Fragment>
    <Navbar color="primary" dark>
      <Container className="d-flex">
        <NavbarBrand to="/" tag={RRLink}>
          <FontAwesome name="music" className="mr-2" />
          Tabi-Disco
        </NavbarBrand>
        <Nav navbar>
          <NavItem>
            <NavLink to="/events" tag={RRNavLink}>
              Events
            </NavLink>
          </NavItem>
        </Nav>
        <div className="ml-auto">
          <Button color="success" style={{ borderRadius: '50%' }} onClick={() => dispatch(pressButton('play'))}>
            <FontAwesome name="play" />
          </Button>
          <Button color="danger" style={{ borderRadius: '50%', marginLeft: '.5rem' }} onClick={() => dispatch(pressButton('stop'))}>
            <FontAwesome name="stop" />
          </Button>
        </div>
      </Container>
    </Navbar>

    {children}

    <CurrentSong currentSong={currentSong} stopSong={() => dispatch(pressButton('stop'))} />
    <Notifs CustomComponent={({ kind, message }) => <Alert color={kind === 'error' ? 'danger' : kind}>{message}</Alert>} />
  </React.Fragment>
);

export default connect(state => ({ currentSong: state.currentSong }))(Layout);
