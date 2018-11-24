import * as types from './actionTypes';
import { push } from 'react-router-redux';
import appService from '../services/appService';
import { showErrorBanner } from './errorBannerActions';

let refreshSyncStatusInterval = null;

export function requestingSynchronization(requestingSynchronization = true) {
  return {
    type: types.REQUESTING_SYNCHRONIZATION,
    requestingSynchronization,
  };
}

export function synchronizationInProgress(synchronizationInProgress = true) {
  return {
    type: types.SYNCHRONIZATION_IN_PROGRESS,
    synchronizationInProgress,
  };
}

export function gotoFieldsMapping() {
  return (dispatch, getState) => {
    dispatch(push('/app/fields-mapping'));
  };
}

export function gotoSetupDopplerList() {
  return (dispatch, getState) => {
    dispatch(push('/app/setup-doppler-list'));
  };
}

export function gotoAppSetup() {
  return (dispatch, getState) => {
    dispatch(push('/app/setup'));
  };
}

export function updateSynchronizationStatus(dispatch) {
  return appService.getSyncrhonizationStatus()
  .then(response => {
    if (!response.synchronizationInProgress) {
      dispatch(synchronizationInProgress(false));
      clearInterval(refreshSyncStatusInterval);
    }
  }).catch(() => {
      clearInterval(refreshSyncStatusInterval);
      dispatch(showErrorBanner(true, "Error retrieving the synchronization status. Try reloading the page"));
  });
}

export function synchronizeCustomers() {
  return (dispatch, getState) => {
    dispatch(synchronizationInProgress(true));
    dispatch(requestingSynchronization(false));
    return appService
      .synchronizeCustomers()
      .then(() => {
        dispatch(push('/app/setup'));
        refreshSyncStatusInterval = setInterval(() => updateSynchronizationStatus(dispatch), 1000);
      })
      .catch(errorPromise => {
        errorPromise
          .then(msg => dispatch(showErrorBanner(true, msg)))
          .catch(err => dispatch(showErrorBanner()));
      });
  };
}
