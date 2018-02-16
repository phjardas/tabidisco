import React from 'react';
import { shallow } from 'enzyme';
import { Alert } from 'reactstrap';

import ConnectionState from '../ConnectionState';

describe('ConnectionState', () => {
  it('should render alert when disconnected', () => {
    const wrapper = shallow(<ConnectionState state="disconnected" />);
    const alerts = wrapper.find(Alert);
    expect(alerts).toHaveLength(1);
    const alert = alerts.first();

    const alertProps = alert.props();
    expect(alertProps).toHaveProperty('color', 'danger');
    expect(alertProps).toHaveProperty('style', { borderRadius: 0 });
    expect(alertProps).toHaveProperty('children', 'Disconnected!');
  });
});
