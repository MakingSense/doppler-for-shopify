import * as types from './actionTypes';
import { push } from 'react-router-redux';
import appService from '../services/appService';
import { showErrorBanner } from './errorBannerActions';

export function retrievingDopplerLists(status = true) {
    return {
      type: types.RETRIEVING_DOPPLER_LISTS,
      retrievingDopplerLists: status
    };
}

export function dopplerListsRetrieved(dopplerLists) {
    return {
      type: types.DOPPLER_LISTS_RETRIEVED,
      dopplerLists
    };
}

export function creatingDopplerList(status = true) {
  return {
    type: types.CREATING_DOPPLER_LIST,
    creatingDopplerList: status
  };
}

export function dopplerListCreated(createdDopplerListId, createdDopplerListName) {
  return {
    type: types.DOPPLER_LIST_CREATED,
    createdDopplerList: {value: parseInt(createdDopplerListId), label: createdDopplerListName}
  };
}

export function duplicatedListName(duplicatedListName = true) {
  return {
    type: types.DUPLICATED_LIST_NAME,
    duplicatedListName
  };
}

export function requestListCreation(requestingListCreation = true) {
  return {
    type: types.REQUEST_LIST_CREATION,
    requestingListCreation
  }
}

export function changeCurrentSelectedList(selectedListId = null) {
  return {
    type: types.CURRENT_SELECTED_LIST_CHANGED,
    selectedListId: selectedListId != null ? parseInt(selectedListId) : selectedListId
  }
}

export function settingDopplerList(settingDopplerList = true) {
  return {
    type: types.SETTING_DOPPLER_LIST,
    settingDopplerList
  }
}

export function getDopplerLists() {
    return (dispatch, getState) => {
      dispatch(retrievingDopplerLists(true));
      return appService.getDopplerLists()
        .then(response => {
          dispatch(retrievingDopplerLists(false));
          dispatch(dopplerListsRetrieved(response.items.map(list => { return {value: list.listId, label: list.name}; })));
        })
        .catch(errorPromise => {
          dispatch(retrievingDopplerLists(false));
          errorPromise
            .then(msg => dispatch(showErrorBanner(true, msg)))
            .catch(err => dispatch(showErrorBanner()));
        });
    };
}

export function createDopplerList(name) {
  return (dispatch, getState) => {
    dispatch(creatingDopplerList(true));
    return appService.createDopplerList(name)
      .then(response => {
        dispatch(creatingDopplerList(false));
        if (response && response.listId) {
          dispatch(dopplerListCreated(response.listId, name))
          dispatch(requestListCreation(false));
          dispatch(changeCurrentSelectedList(response.listId));
        }
        else
          dispatch(duplicatedListName())
      })
      .catch(errorPromise => {
        dispatch(creatingDopplerList(false));
        dispatch(requestListCreation(false));
        errorPromise
          .then(msg => dispatch(showErrorBanner(true, msg)))
          .catch(err => dispatch(showErrorBanner()));
      });
  };
}

export function setDopplerList(selectedListId) {
  return (dispatch, getState) => {
    dispatch(settingDopplerList(true));
    return appService.setDopplerList(selectedListId)
      .then(response => {
        dispatch(settingDopplerList(false));
        dispatch(push('/app/fields-mapping'));
      })
      .catch(errorPromise => {
        dispatch(settingDopplerList(false));
        errorPromise
          .then(msg => dispatch(showErrorBanner(true, msg)))
          .catch(err => dispatch(showErrorBanner()));
      });
  };
}