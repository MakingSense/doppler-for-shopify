import { errorHandling } from './errorHandlingReducer';
import { appSetup } from './appSetupReducer';
import { connectingToDoppler } from './connectToDopplerReducer';
import { setupDopplerList } from './setupDopplerListReducer';
import { fieldsMapping } from './fieldsMappingReducer';

import { combineReducers } from 'redux';

const rootReducer = combineReducers({
  appSetup,
  errorHandling,
  connectingToDoppler,
  setupDopplerList,
  fieldsMapping,
});

export default rootReducer;
