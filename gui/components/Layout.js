import Head from 'next/head';
import { Container, Navbar, NavbarBrand } from 'reactstrap';

import FontAwesome from './FontAwesome';
import '../styles.scss';

export default function Layout({ children }) {
  return (
    <React.Fragment>
      <Head>
        <script src="https://use.fontawesome.com/releases/v5.0.6/js/solid.js" crossOrigin="anonymous" />
        <script src="https://use.fontawesome.com/releases/v5.0.6/js/fontawesome.js" crossOrigin="anonymous" />
      </Head>

      <Navbar color="primary" dark>
        <Container>
          <NavbarBrand href="/">
            <FontAwesome name="music" className="mr-2" />
            Tabi-Disco
          </NavbarBrand>
        </Container>
      </Navbar>

      {children}
    </React.Fragment>
  );
}
