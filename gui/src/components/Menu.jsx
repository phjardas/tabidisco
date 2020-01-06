import React from 'react';
import { Link as RRLink, NavLink as RRNavLink } from 'react-router-dom';
import { Container, Nav, Navbar, NavbarBrand, NavItem, NavLink } from 'reactstrap';
import FontAwesome from './FontAwesome';
import OutputSelector from './OutputSelector';

export default function Menu() {
  return (
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
            <NavItem>
              <NavLink to="/events" tag={RRNavLink}>
                Events
              </NavLink>
            </NavItem>
          </Nav>
          <Nav navbar className="ml-auto">
            <OutputSelector nav inNavbar />
          </Nav>
        </div>
      </Container>
    </Navbar>
  );
}
