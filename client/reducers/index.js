import {
    errorHandling
  } from './errorHandlingReducer';
import {
    appSetup
  } from './appSetupReducer';
import {
    connectingToDoppler
  } from './connectToDopplerReducer';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    appSetup,
    errorHandling,
    connectingToDoppler
});

export default rootReducer;