import React from 'react';
import { FormattedMessage } from 'react-intl';
import Player from '../Player';

/* eslint-disable react/prefer-stateless-function */
class Header extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      show: false,
    };
  }

  render() {
    const showSettings = () => {
      this.setState({ show: true });
    };

    const hideSettings = () => {
      this.setState({ show: false });
    };

    return (
      <div>
        <Player show={this.state.show} close={hideSettings} />
        <nav className="navbar">
          <div className="container-fluid">

            <div className="navbar-header">
              <a className="navbar-brand" href="#">MICRO RC MACHINES</a>
            </div>

            <div id="navbar" className="navbar-collapse">
              <ul className="nav">
                <li className="hover-effect"><a href="/">HOME</a></li>
                {!window.location.href.endsWith('/play') && (
                  <li className="hover-effect"><a href="/join">JOIN GAME</a></li>
                )}
                {!window.location.href.endsWith('/play') && (
                  <li className="hover-effect"><a onClick={showSettings}>SETTINGS</a></li>                  
                )}
              </ul>
            </div>
          </div>
        </nav>
      </div>
    );
  }
}

export default Header;
