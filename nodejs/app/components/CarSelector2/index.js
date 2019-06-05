/*
 * FeaturePage
 *
 * List all the features
 */
import React from 'react';
import CarView from '../CarView';
import leftButton from './left.png';
import rightButton from './right.png';
import bottomRightButton from './button.png';

export default class CarSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentCar: 0,
      availableCars: [],
    };

    window.socket.on('availableCars', cars => {
      console.log('cars updated');
      this.setState({ availableCars: cars });
    });
  }

  render() {
    const style = {
      display: 'flex',
      height: '100vh',
      alignItems: 'center',
    };

    if (!this.state.availableCars.length) {
      style.justifyContent = 'center';
      return (
        <div style={style} className={this.props.className}>
          <h1>No available cars, please turn on all your vehicles.</h1>;
        </div>
      );
    }

    const imageStyle = {
      width: '96px',
      padding: '10px',
    };

    const leftControl = {
      float: 'left',
      cursor: 'pointer',
    };

    const rightControl = {
      float: 'right',
      cursor: 'pointer',
    };

    const playButtonStyle = {
      position: 'fixed',
      right: '0',
      bottom: '0',
      width: '200px',
      height: '70px',
      padding: '25px 80px',
      background: `url(${bottomRightButton})`,
      backgroundSize: 'contain',
      cursor: 'pointer',
    };

    const clickLeft = () => {
      if (!this.state.availableCars.length) return;
      const newIndex = (this.state.currentCar - 1) % this.state.availableCars.length;
      this.setState({
        currentCar: newIndex < 0 ? this.state.availableCars.length + newIndex : newIndex,
      });
    };

    const clickRight = () => {
      if (!this.state.availableCars.length) return;
      this.setState({ currentCar: (this.state.currentCar + 1) % this.state.availableCars.length });
    };

    const clickPlay = () => {
      const selectedCarId = this.state.availableCars[this.state.currentCar].id;
      const carSelectedFn = success => {
        window.socket.off('selectedCar', carSelectedFn);
        if (success) {
          // we need to store (persistently) what car we selected (localStorage?)
          // however on every refresh we would need to re-request the car to see if its available ?
          // if its not we need to go back to the join screen
          // this should be handled at app level
          // if localStorageCar, check if Available, if not, redirect to home/join, else drive
          window.data.selectedCar = selectedCarId;
          localStorage.setItem('selectedCar', selectedCarId);
          window.location.href = '/play';
        } else {
          console.log('car is no longer available');
        }
      };
      window.socket.on('selectedCar', carSelectedFn);
      window.socket.emit('selectCar', {
        car: selectedCarId,
        user: window.data.name,
      });
    };

    if (!this.state.availableCars) return null;
    let i = 0;
    return (
      <div>
        <div style={style} className={this.props.className}>
          <div style={leftControl} onClick={clickLeft}><img src={leftButton} style={imageStyle} alt="left"/></div>
          {this.state.availableCars.map(car => {
            const carStyle = {
              display: i++ === this.state.currentCar ? 'block' : 'none',
              width: '100%',
            };

            return (
              <div style={carStyle}>
                <CarView values={car.values} image={car.image} name={car.name} />
              </div>
            );
          })}
          <div style={rightControl} onClick={clickRight}><img src={rightButton} style={imageStyle} alt="right"/></div>
        </div>
        <div style={playButtonStyle} onClick={clickPlay}>PLAY</div>
      </div>
    );
  }
}
