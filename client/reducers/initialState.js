const { dopplerAccountName } = window;

export default {
    connectingToDoppler: {
        connectingToDoppler: false,
        invalidDopplerCredentials: false
    },
    setupDopplerList: {
        dopplerLists: [],
        retrievingDopplerLists: false,
        selectedListId: null,
        settingDopplerList: false,
        requestingListCreation: false,
        creatingList: false,
        duplicatedListName: false,
    },
    errorHandling: {
        showErrorBanner: false,
        errorMessage: ''
    },
    appSetup: {
        appName: 'Doppler for Shopify',
        dopplerAccountName
    }
}
  
  