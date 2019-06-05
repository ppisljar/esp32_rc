/*
 * FeaturePage
 *
 * List all the features
 */
import React from 'react';
import Manager from 'nipplejs';
import { withTheme } from 'styled-components';

export default class PlayPage extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  // Since state and props are static,
  // there's no need to re-render this component
  constructor(props) {
    super(props);

    this.lastsend = Date.now();
    this.lastX = 128;
    this.lastY = 128;
  }

  shouldComponentUpdate() {
    return false;
  }

  send(x, y) {
    if (Date.now() - 100 < this.lastsend) return;
    this.lastsend = Date.now();
    if (false) {
      // motor + servo
      window.socket.emit('cmd', {
        motor1: y,
        servo1: x,
        user: window.data.name,
        car: window.data.selectedCar,
      });
    } else {
      // two motors (tank)
      let m1 = y;
      let m2 = -y;
      if (y < 128) {
        if (x > 128) m1 += (x - 128);
        if (x < 128) m2 -= (128 - x);
      }
      else {
        if (x > 128) m1 -= (x - 128);
        if (x < 128) m2 += (128 - x);  
      }
      
      window.socket.emit('cmd', {
        motor1: m1,
        motor2: m2,
        user: window.data.name,
        car: window.data.selectedCar,
      });
    }
    
  }

  render() {
    const style = {
      height: '100vh',
    };

    const leftStyle = {
      display: 'inline-block',
      width: '50%',
      height: '100vh',
      backgroundColor: 'lightblue',
    };

    const rightStyle = {
      position: 'absolute',
      display: 'inline-block',
      width: '50%',
      height: '100vh',
      backgroundColor: 'lightpink',
    };

    const headerStyle = {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      height: '50px',
      margin: '0',
      padding: '0',
    };

    const userStyle = {
      position: 'relative',
      float: 'left',
    };

    const commandsStyle = {
      position: 'relative',
      float: 'right',
    };

    const commandStyle = {
      padding: '20px',
      border: '1px solid white',
    };

    return (
      <div style={style}>
        {/* <div style={headerStyle}>
          <div style={userStyle}>
            <img src="{window.data.avatar}" alt="avatar" />
            <span>{window.data.name}</span>
          </div>
          <div style={commandsStyle}>
            <div style={commandStyle}><a href='/'>RETURN</a></div>
          </div>
        </div> */}
        <div id="joy1" style={leftStyle} />
        <div id="joy2" style={rightStyle} />
      </div>
    );
  }

  componentDidMount() {
    this.joy1 = Manager.create({
      zone: document.getElementById('joy1'),
      color: 'blue',
      lockY: true,
      size: 255,
    });

    this.joy2 = Manager.create({
      zone: document.getElementById('joy2'),
      color: 'red',
      lockX: true,
      size: 255,
    });

    this.joy1.on('move', (event, data) => {
      const y = Math.round(Math.sin(data.angle.radian) * data.distance) + 127;
      this.lastY = y;
      this.send(this.lastX, y);
    });

    this.joy1.on('end', () => {
      this.lastY = 128;
      setTimeout(() => {
        this.send(128, 128);
      }, 100);
    });

    this.joy2.on('move', (event, data) => {
      const x = Math.round(Math.cos(data.angle.radian) * data.distance) + 127;
      this.lastX = x;
      this.send(x, this.lastY);
    });

    this.joy2.on('end', () => {
      this.lastX = 128;
      setTimeout(() => {
        this.send(128, 128);
      }, 100);
    });
  }

  componentWillUnmount() {
    if (this.joy1) this.joy1.destroy();
    if (this.joy2) this.joy2.destroy();
  }
}
