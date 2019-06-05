import { injectGlobal } from 'styled-components';

/* eslint no-unused-expressions: 0 */
injectGlobal`
  html,
  body {
    height: 100%;
    width: 100%;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    background-color: #fafafa;
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  }

  .navbar {
    margin-bottom: 0;
    position: absolute;
    z-index: 99999;
    background-color: rgba(0, 0, 0, 0.47);
    border: none;
    border-bottom: 1px solid #BBB;
    border-radius: 0;
    width: 100%;
    padding: 10px 0;
    min-height: 50px;
  }

  .container-fluid {
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
  }

  .navbar-brand {
    float: left;
    height: 36px;
    padding: 15px 15px;
    font-size: 36px;
    line-height: 20px;
    margin-left: -15px;
    color: #C0C6C6;
    font-family: 'Racing Sans One', cursive;
    text-decoration: none;
  }

  .nav {
    padding-left: 0;
    margin: 0;
    margin-right: -15px;
    list-style: none;
    float: right!important;
  }

  .hover-effect {
    position: relative;
    display: block;
    padding: 5px 15px;
    float: left;
  }

  .hover-effect a {
    color: #BBB;
    padding-top: 15px;
    padding-bottom: 15px;
    line-height: 20px;
    text-decoration: none;
    transition: color 0.3s;
    font-family: 'Raleway', sans-serif;
  }

  .hover-effect:hover a {
    color: #FFF;
  }

  .hover-effect a::before {
    top: 0;
    transform: translateY(-10px);
  }

  .hover-effect a::after {
    bottom: 0;
    transform: translateY(10px);
  }

  .hover-effect a::before, .hover-effect a::after {
    position: absolute;
    left: 0;
    width: 100%;
    height: 2px;
    background: #fff;
    content: '';
    opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
  }


  .hover-effect a:hover::before, .hover-effect a:focus::before, .hover-effect a:hover::after, .hover-effect a:focus::after {
    opacity: 1;
    transform: translateY(0px);
  }

`;
