/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 */

import React from 'react';
import CarSelector from 'components/CarSelector2';

/* eslint-disable react/prefer-stateless-function */
export class HomePage extends React.Component {
  render() {

    return <CarSelector />;
  }
}
