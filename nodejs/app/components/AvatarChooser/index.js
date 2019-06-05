/*
 * FeaturePage
 *
 * List all the features
 */
import React from 'react';
import leftButton from './left.png';
import rightButton from './right.png';

const availableAvatars = [
  require('./avatars/1.png'),
  require('./avatars/2.png'),
  require('./avatars/3.png'),
  require('./avatars/4.png'),
  require('./avatars/5.png'),
];

export default class AvatarChooser extends React.Component {
  constructor(props) {
    super(props);
    this.availableAvatars = availableAvatars;
  }
  render() {
    const containerStyle = {
      display: 'inline-block',
      width: '200px',
      position: 'relative',
      height: '200px',
    };

    const style = {
      display: 'flex',
      alignItems: 'center',
      height: '100%',
    };

    const imageStyle = {
      width: '48px',
      padding: '5px',
    };

    const leftControl = {
      position: 'absolute',
      cursor: 'pointer',
    };

    const rightControl = {
      position: 'absolute',
      right: '0',
      cursor: 'pointer',
    };

    const clickLeft = () => {
      this.props.onChange((this.props.selectedAvatar - 1)  % this.availableAvatars.length);
    };

    const clickRight = () => {
      this.props.onChange((this.props.selectedAvatar + 1)  % this.availableAvatars.length);
    };

    return (
      <div style={containerStyle}>
        <div style={style} className={this.props.className}>
          <div style={leftControl} onClick={clickLeft}><img src={leftButton} style={imageStyle} alt="left"/></div>
          {this.availableAvatars.map((avatar, i) => {
            const avatarStyle = {
              display: i === this.props.selectedAvatar ? 'block' : 'none',
              width: '100%',
            };

            return (
              <div style={avatarStyle}>
                <img src={avatar} alt={avatar} />
              </div>
            );
          })}
          <div style={rightControl} onClick={clickRight}><img src={rightButton} style={imageStyle} alt="right"/></div>
        </div>
      </div>
    );
  }
}
