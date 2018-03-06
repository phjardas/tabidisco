import React from 'react';

export default class AnimatedModal extends React.Component {
  state = { particles: [] };

  render() {
    const { particle, children } = this.props;
    const { particles } = this.state;

    return (
      <div
        className="bg-primary"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          height: '100%',
          zIndex: 100,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-50%)',
            background: 'rgba(255,255,255,.8)',
            padding: '1rem 2rem',
            borderRadius: '.5rem',
            zIndex: 102,
          }}
        >
          {children}
        </div>
        {particles.map(p => (
          <span key={p.id} style={{ position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, zIndex: 101 }}>
            {particle({ style: { color: 'white', opacity: p.opacity, transform: `scale(${p.scale})` } })}
          </span>
        ))}
      </div>
    );
  }

  tick = () => {
    const now = Date.now();

    if (this.lastTick) {
      const elapsed = now - this.lastTick;
      const fraction = 1 / elapsed;
      this.setState(({ particles }) => ({
        particles: particles.map(p => {
          let x = p.x + p.vx * fraction;
          let y = p.y + p.vy * fraction;

          if (y < 0 || y > 100) {
            y = (y + 100) % 100;
            x = Math.random() * 100;
          }

          return { ...p, x, y };
        }),
      }));
    } else {
      this.initializeAnimation();
    }

    this.lastTick = now;
    this.frameRequest = window.requestAnimationFrame(this.tick);
  };

  initializeAnimation = () => {
    const { particleCount } = this.props;

    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      const depth = Math.random();

      particles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: Math.random() * depth * 4 - 2,
        vy: -(1 + depth) * 8,
        opacity: 0.2 + depth * 0.8,
        scale: 0.5 + depth,
      });
    }

    this.setState({ particles });
  };

  componentDidMount() {
    this.lastTick = undefined;
    this.frameRequest = window.requestAnimationFrame(this.tick);
  }

  componentWillUnmount() {
    if (this.frameRequest) window.cancelAnimationFrame(this.frameRequest);
    this.lastTick = undefined;
  }
}
