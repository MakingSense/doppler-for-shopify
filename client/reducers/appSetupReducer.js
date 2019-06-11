import * as types from '../actions/actionTypes';
import initialState from './initialState';

export const appSetup = (state = initialState.appSetup, action) => {
  switch (action.type) {
    case types.SETUP_COMPLETED:
      return {
        ...state,
        setupCompleted: action.setupCompleted
      };

    case types.SYNCHRONIZATION_IN_PROGRESS:
      return {
        ...state,
        synchronizationInProgress: action.synchronizationInProgress,
        lastSynchronizationDate: action.synchronizationInProgress
          ? new Date().toISOString()
          : state.lastSynchronizationDate
      };

    case types.REQUESTING_SYNCHRONIZATION:
      return {
        ...state,
        requestingSynchronization: action.requestingSynchronization
      };

    case types.LIST_SET:
      return {
        ...state,
        dopplerListId: action.dopplerListId,
        dopplerListName: action.dopplerListName
      };

      case types.USER_LOGGED_IN:
        return {
          ...state,
          dopplerAccountName: action.dopplerAccountName
        };

    default:
      return state;
  }
};
