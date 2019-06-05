/**
 *
 * Img.js
 *
 * Renders an image, enforcing the usage of the alt="" tag
 */

import React from 'react';
import PropTypes from 'prop-types';
import ProgressBar from '../ProgressBar';

function CarStats(props) {

  const style = {
    display: 'inline-block',
    width: '300px',
    background: 'rgba(50, 50, 50, 0.6)',
    padding: '20px',
  };

  const rowStyle = {
    height: '30px',
  };

  return (
    <div style={style} className={props.className}>
      {props.name}
      <div style={rowStyle}>SPEED: <ProgressBar value={props.values.speed} /></div>
      <div style={rowStyle}>HANDLING: <ProgressBar value={props.values.handling} /></div>
      <div style={rowStyle}>CLIMB: <ProgressBar value={props.values.climb} /></div>
      <div style={rowStyle}>OFFROAD: <ProgressBar value={props.values.offroad} /></div>
      <div style={rowStyle}>BATTERY: <ProgressBar value={props.values.battery} /></div>
    </div>
  );
}

// We require the use of src and alt, only enforced by react in dev mode
CarStats.propTypes = {
  values: PropTypes.object,
  className: PropTypes.string,
  name: PropTypes.string,
};

export default CarStats;
