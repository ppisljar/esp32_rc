/*
 * FeaturePage
 *
 * List all the features
 */
import React from 'react';

import splashImage from './intro.jpg';

export default class FeaturePage extends React.Component {
  // eslint-disable-line react/prefer-stateless-function
  // Since state and props are static,
  // there's no need to re-render this component
  shouldComponentUpdate() {
    return false;
  }

  render() {
    const style = {
      height: '100vh',
      backgroundImage: `url(${splashImage})`,
      backgroundSize: 'cover',
    };

    const buttonStyle = {
      position: 'absolute',
      top: '30%',
      left: '50%',
      zIndex: '10000',
      width: '300px',
      textAlign: 'center',
      marginLeft: '-120px',
      fontSize: '40px',
      color: 'white',
      cursor: 'pointer',
    };

    return (
      <div style={style}>
        <div style={buttonStyle}>
          <a href="/join">PLAY NOW</a>
        </div>
      </div>
    );
  }
}
