import {
    errorHandling
  } from './errorHandlingReducer';
import {
    appSetup
  } from './appSetupReducer';
import {
    connectingToDoppler
  } from './connectToDopplerReducer';
import {
    setupDopplerList
} from './setupDopplerListReducer';
import { combineReducers } from 'redux';

const rootReducer = combineReducers({
    appSetup,
    errorHandling,
    connectingToDoppler,
    setupDopplerList
});

export default rootReducer;