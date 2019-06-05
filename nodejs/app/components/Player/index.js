/**
 *
 * Img.js
 *
 * Renders an image, enforcing the usage of the alt="" tag
 */

import React from 'react';
import PropTypes from 'prop-types';
import AvatarChooser from '../AvatarChooser';

class Player extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: localStorage.getItem('name') || 'unnamed',
      avatar: localStorage.getItem('avatar') ? parseInt(localStorage.getItem('avatar')) : 1,
    };
  }

  render() {
    const style = {
      display: this.props.show ? 'flex': 'none',
      position: 'absolute',
      top: '0',
      bottom: '0',
      left: '0',
      right: '0',
      backgroundColor: 'rgba(50, 50, 50, 0.7)',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '1000',
      //pointerEvents: 'none',
    };

    const containerStyle = {
      width: '450px',
      height: '200px',
      backgroundColor: 'white',
      color: 'black',
      border: '1px solid green',
    };

    const optionsStyle = {
      fontSize: '16px',
      display: 'inline-block',
    };

    const avatarChanged = avatar => {
      localStorage.setItem('avatar', avatar);
      this.setState({ avatar });
    };

    const setName = event => {
      localStorage.setItem('name', event.currentTarget.value);
      this.setState({ name: event.currentTarget.value });
    };

    return (
      <div style={style} className={this.props.className}>
        <div style={containerStyle}>
          <AvatarChooser selectedAvatar={this.state.avatar} onChange={avatarChanged} />
          <div style={optionsStyle}>
            name: <input name="name" onChange={setName} value={this.state.name}/>
          </div>
          <div onClick={this.props.close}>Close</div>
        </div>
      </div>
    );
  }
}

export default Player;
