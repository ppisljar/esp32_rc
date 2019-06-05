/* eslint consistent-return:0 */

// const CarImage = require('../../../lada.jpg');
// const CarImage2 = require('../../../tank1.jpg');
// const CarImage3 = require('../../../schoolbus.jpg');
// const CarImage4 = require('../../../truck1.jpg');
// const CarImage5 = require('../../../golf1.jpg');

const express = require('express');
const logger = require('./logger');

const argv = require('./argv');
const port = require('./port');
const setup = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';
const ngrok =
  (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
    ? require('ngrok')
    : false;
const { resolve } = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const dgram = require('dgram');
//const buffer = require('buffer');

const udpSocket = dgram.createSocket('udp4');

// If you need a backend, e.g. an API, add your custom backend-specific middleware here
// app.use('/api', myApi);

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

app.use(express.static('/public'));

let availableCars = [];

const register = (req, res) => {
  res.send('OK');
  const car = JSON.parse(req.query.car);
  const ip = req.connection.remoteAddress.replace('::ffff:', '');
  console.log('car registering:', car, ip);
  const existingCar = availableCars.find(c => c.id === car.id);
  if (existingCar) {
    existingCar.ip = ip;
    existingCar.refreshed = Date.now();
    return;
  }
  const newCar = car;
  newCar.refreshed = Date.now();
  newCar.ip = ip;
  availableCars.push(newCar);
  io.emit('availableCars', availableCars);
};

const checkForUnactive = () => {
  const now = Date.now();
  availableCars = availableCars.filter(c => c.refreshed + 30000 < now);
  io.emit('availableCars', availableCars);
};

setTimeout(checkForUnactive, 30000);

app.get('/register', register);

io.on('connection', client => {

client.emit('availableCars', availableCars.filter(car => !car.selected));

  client.on('selectCar', data => {
    if (!data.car) {
      return;
    }
    const car = availableCars.find(c => c.id == data.car);

    if (!car || (car.selected && car.selected !== data.user)) {
      console.log('taken by somebody else: ', availableCars[data.car]);
      client.emit('selectedCar', false);
      return;
    }
    car.selected = data.user;
    client.emit('selectedCar', true);
    console.log('reserving the car, broadcasting availableCars');
    io.emit('availableCars', availableCars.filter(c => !c.selected));
  });

  client.on('returnCar', data => {
    const car = availableCars.find(c => c.id === data.car);
    if (car && data.user === car.selected) {
      car.selected = false;
      console.log('car is returned, broadcasting availableCars');
      io.emit('availableCars', availableCars.filter(c => !c.selected));
    }
  });

  client.on('cmd', cmd => {
    const car = availableCars.find(c => c.id === cmd.car);
    if (!car) return;

    const buffer = Buffer.alloc(8);
    buffer[0] = 129;
    buffer[1] = 145;
    buffer[2] = cmd.motor1;
    buffer[3] = cmd.motor2;
    buffer[4] = cmd.servo1;
    buffer[5] = cmd.servo2;
    buffer[6] = 0;
    buffer[7] = 0;
    console.log(buffer, car.ip);
    udpSocket.send(buffer, 2222, car.ip, error => {
      if (error) {
        console.log('error sending data to ' + car.ip);
        console.log(error);
        //availableCars = availableCars.filter(c => c.id !== car.id);
        //io.emit('availableCars', availableCars);
      } else {
        console.log('.');
      }
    });
  });

  console.log('a user connected');
});

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
});

// Start your app.
http.listen(port, host, async err => {
  if (err) {
    return logger.error(err.message);
  }

  // Connect to ngrok in dev mode
  if (ngrok) {
    let url;
    try {
      url = await ngrok.connect(port);
    } catch (e) {
      return logger.error(e);
    }
    logger.appStarted(port, prettyHost, url);
  } else {
    logger.appStarted(port, prettyHost);
  }
});
