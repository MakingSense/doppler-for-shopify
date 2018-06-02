import * as types from '../actions/actionTypes';
import initialState from './initialState';

export const setupDopplerList = (
  state = initialState.setupDopplerList,
  action
) => {
  switch (action.type) {
    case types.RETRIEVING_DOPPLER_LISTS:
      return {
        ...state,
        retrievingDopplerLists: action.retrievingDopplerLists,
      };

    case types.DOPPLER_LISTS_RETRIEVED:
      return {
        ...state,
        dopplerLists: action.dopplerLists,
        selectedListId:
          state.selectedListId == null && action.dopplerLists.length > 0
            ? action.dopplerLists[0].value
            : state.selectedListId,
      };

    case types.REQUEST_LIST_CREATION:
      return {
        ...state,
        requestingListCreation: action.requestingListCreation,
      };

    case types.CREATING_DOPPLER_LIST:
      return {
        ...state,
        creatingDopplerList: action.creatingDopplerList,
        duplicatedListName: false,
      };

    case types.DOPPLER_LIST_CREATED:
      return Object.assign({}, state, {
        dopplerLists: [
          ...state.dopplerLists,
          Object.assign({}, action.createdDopplerList),
        ],
      });

    case types.CURRENT_SELECTED_LIST_CHANGED:
      return {
        ...state,
        selectedListId: action.selectedListId,
      };

    case types.DUPLICATED_LIST_NAME:
      return {
        ...state,
        duplicatedListName: action.duplicatedListName,
      };

    case types.SETTING_DOPPLER_LIST:
      return {
        ...state,
        settingDopplerList: action.settingDopplerList,
      };

    default:
      return state;
  }
};
