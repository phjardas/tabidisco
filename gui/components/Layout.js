import { Navbar, NavbarBrand } from 'reactstrap';

import '../styles.scss';

export default ({ children }) => (
  <React.Fragment>
    <Navbar color="primary" dark>
      <div className="container">
        <NavbarBrand href="/">Tabi-Disco</NavbarBrand>
      </div>
    </Navbar>

    <div>{children}</div>
  </React.Fragment>
);
