import gql from 'graphql-tag';
import React from 'react';
import { Mutation } from 'react-apollo';
import { WithLibrary } from '../providers/Library';
import { WithPower } from '../providers/Power';
import Footer from './Footer';
import Menu from './Menu';

const Layout = ({ children, currentSong, power, setPower, cancelShutdownTimer, pressButton }) => (
  <>
    <Menu />

    <div style={{ marginBottom: 54 }}>{children}</div>

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
