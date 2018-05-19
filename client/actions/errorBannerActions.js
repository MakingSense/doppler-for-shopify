import * as types from './actionTypes';

export function showErrorBanner(showErrorBanner = true, errorMessage = '') {
    return {
      type: types.SHOW_ERROR_BANNER,
      showErrorBanner,
      errorMessage
    };
}