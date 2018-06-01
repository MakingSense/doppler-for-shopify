import * as types from './actionTypes';
import { push } from 'react-router-redux';
import appService from '../services/appService';
import { showErrorBanner } from './errorBannerActions';

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