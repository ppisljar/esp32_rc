import React from 'react';
import PropTypes from 'prop-types';
import InactiveImage from './inactive.png';
import ActiveImage from './active.png';

function ProgressBar(props) {
  const style = {
    width: '166px',
    height: '26px',
    float: 'right',
  };

  const inactiveStyle = {
    position: 'absolute',
    backgroundImage: `url(${InactiveImage})`,
    width: '166px',
    height: '26px',
  };
  const activeStyle = {
    position: 'absolute',
    backgroundImage: `url(${ActiveImage})`,
    width: `${1.66 * props.value}px`,
    height: '26px',
  };

  return (
    <div style={style} className={props.className}>
      <div style={inactiveStyle} />
      <div style={activeStyle} />
    </div>
  );
}

ProgressBar.propTypes = {
  value: PropTypes.number,
  className: PropTypes.string,
};

export default ProgressBar;
