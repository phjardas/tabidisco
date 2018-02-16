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

  it('should render info when connecting', () => {
    const wrapper = shallow(<ConnectionState state="connecting" />);
    const alerts = wrapper.find(Alert);
    expect(alerts).toHaveLength(1);
    const alert = alerts.first();

    const alertProps = alert.props();
    expect(alertProps).toHaveProperty('color', 'info');
    expect(alertProps).toHaveProperty('style', { borderRadius: 0 });
    expect(alertProps).toHaveProperty('children', 'Connecting...');
  });

  it('should render warning when reconnecting', () => {
    const wrapper = shallow(<ConnectionState state="reconnecting" />);
    const alerts = wrapper.find(Alert);
    expect(alerts).toHaveLength(1);
    const alert = alerts.first();

    const alertProps = alert.props();
    expect(alertProps).toHaveProperty('color', 'warning');
    expect(alertProps).toHaveProperty('style', { borderRadius: 0 });
    expect(alertProps).toHaveProperty('children', 'Reconnecting...');
  });

  it('should render nothing when connected', () => {
    const wrapper = shallow(<ConnectionState state="connected" />);
    expect(wrapper.children()).toHaveLength(0);
  });
});
