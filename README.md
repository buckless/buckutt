# Buckless Client

[![dependencies Status](https://david-dm.org/buckless-team/client/status.png)](https://david-dm.org/buckless-team/client)
[![Build Status](https://travis-ci.org/buckless-team/client.svg?branch=master)](https://travis-ci.org/buckless-team/client)

## Prerequisites
- Python 2.7
- npm >= 5.6
- node >= 8.9.1
- node-gyp >= 3.6.2
- Android requirements (https://cordova.apache.org/docs/fr/latest/guide/platforms/android/)


## Install
### Set Python npm version
`node-gyp` will fail if the default Python version is Python 3.x. Workaround :

`$ npm config set python [PATH_TO_PYTHON2.7]`

### Dependencies
`$ git clone git@lab.buckless.com:core/client.git`
`$ cd client && yarn`

### Electron dependencies
`yarn` installs native bindings for the OS's `node` version. As electron's `node` version is behind, native bindings needs to be recompiled. Be sure to do the following command before building or developing with electron:

`$ yarn buildnative`

## Build docker image
`$ docker-build -t buckless/client .`

## Development
### Browser
`$ yarn dev:browser`

### Electron
`$ yarn dev:electron`

### Android
`$ yarn dev:android`


## Build for production
### Browser
`$ yarn build:browser`

### Electron
`$ yarn build:electron`

### Android
`$ yarn build:android`


## Run last build
### Browser
`$ yarn browser`

### Electron
`$ yarn electron`

### Android
#### On emulator
`$ yarn android`

#### On device
`$ yarn android:device`
