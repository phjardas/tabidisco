import gql from 'graphql-tag';
import React from 'react';
import { Mutation } from 'react-apollo';
import { Link as RRLink, NavLink as RRNavLink } from 'react-router-dom';
import { Container, Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';
import { WithLibrary } from '../providers/Library';
import { WithPower } from '../providers/Power';
import FontAwesome from './FontAwesome';
import Footer from './Footer';

const Layout = ({ children, currentSong, power, setPower, cancelShutdownTimer, pressButton }) => (
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
      </Container>
    </Navbar>

    {children}

    <Footer
      power={power}
      setPower={setPower}
      cancelShutdownTimer={cancelShutdownTimer}
      pressButton={pressButton}
      currentSong={currentSong}
    />
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
    {({ currentSong }) => (
      <WithPower>
        {({ power, setPower, cancelShutdownTimer }) => (
          <Mutation mutation={pressButtonMutation}>
            {pressButton => (
              <Layout
                currentSong={currentSong}
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
