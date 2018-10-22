import gql from 'graphql-tag';
import React from 'react';
import { Mutation } from 'react-apollo';
import { Link as RRLink, NavLink as RRNavLink } from 'react-router-dom';
import { Container, Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';
import { WithLibrary } from '../providers/Library';
import { WithPower } from '../providers/Power';
import Buttons from './Buttons';
import CurrentSong from './CurrentSong';
import FontAwesome from './FontAwesome';

const Layout = ({ children, currentSong, stopSong, power, setPower, cancelShutdownTimer, pressButton }) => (
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
          <Buttons power={power} setPower={setPower} cancelShutdownTimer={cancelShutdownTimer} pressButton={pressButton} />
        </div>
      </Container>
    </Navbar>

    {children}

    {currentSong && <CurrentSong currentSong={currentSong} stopSong={stopSong} />}
  </>
);

const pressButtonMutation = gql`
  mutation PressButton($button: String!) {
    simulateButtonPress(button: $button) {
      success
      error
    }
  }
`;

export default ({ children }) => (
  <WithLibrary>
    {({ currentSong, stopSong }) => (
      <WithPower>
        {({ power, setPower, cancelShutdownTimer }) => (
          <Mutation mutation={pressButtonMutation}>
            {pressButton => (
              <Layout
                currentSong={currentSong}
                stopSong={stopSong}
                power={power}
                setPower={setPower}
                cancelShutdownTimer={cancelShutdownTimer}
                pressButton={button => pressButton({ variables: { button } })}
              >
                {children}
              </Layout>
            )}
          </Mutation>
        )}
      </WithPower>
    )}
  </WithLibrary>
);
