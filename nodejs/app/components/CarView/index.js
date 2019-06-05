/**
 *
 * Img.js
 *
 * Renders an image, enforcing the usage of the alt="" tag
 */

import React from 'react';
import PropTypes from 'prop-types';
import CarStats from '../CarStats';

function CarView(props) {

  const style = {
    display: 'flex',
    height: '100vh',
    alignItems: 'center',
  };

  const imageStyle = {
    width: '80%',
    margin: '0 auto',
  };

  const statsStyle = {
    position: 'absolute',
  }

  return (
    <div style={style} className={props.className}>
      <div style={statsStyle}><CarStats values={props.values} name={props.name} /></div>
      <img src={props.image} style={imageStyle} alt="car" />
    </div>
  );
}

// We require the use of src and alt, only enforced by react in dev mode
CarView.propTypes = {
  values: PropTypes.object,
  image: PropTypes.image,
  className: PropTypes.string,
  name: PropTypes.string,
};

export default CarView;
