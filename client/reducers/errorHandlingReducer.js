import * as types from '../actions/actionTypes';
import initialState from './initialState';

export const errorHandling = (state = initialState.errorHandling, action) => {
    switch (action.type) {
        case types.SHOW_ERROR_BANNER:
          return {
            ...state,
            showErrorBanner: action.showErrorBanner,
            errorMessage: action.errorMessage
          };
        
        default:
          return state;
    }
};