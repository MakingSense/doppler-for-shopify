import * as types from '../actions/actionTypes';
import initialState from './initialState';

export const connectingToDoppler = (
  state = initialState.connectingToDoppler,
  action
) => {
  switch (action.type) {
    case types.CONNECTING_TO_DOPPLER:
      return {
        ...state,
        connectingToDoppler: action.connectingToDoppler,
        invalidDopplerCredentials: false,
      };

    case types.CHANGE_DOPPLER_CREDENTIALS_STATUS:
      return {
        ...state,
        connectingToDoppler: false,
        invalidDopplerCredentials: action.invalidDopplerCredentials,
      };

    default:
      return state;
  }
};
