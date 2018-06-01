import * as types from '../actions/actionTypes';
import initialState from './initialState';

export const appSetup = (state = initialState.appSetup, action) => {
    switch (action.type) {
        case types.SETUP_COMPLETED:
        return {
          ...state,
          setupCompleted: action.setupCompleted
        };

        default:
            return state;
    }
}