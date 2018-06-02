const {
  dopplerAccountName,
  dopplerListId,
  dopplerListName,
  fieldsMapping,
  setupCompleted,
  synchronizationInProgress,
  lastSynchronizationDate,
} = window;

export default {
  connectingToDoppler: {
    connectingToDoppler: false,
    invalidDopplerCredentials: false,
  },
  setupDopplerList: {
    dopplerLists: [],
    retrievingDopplerLists: false,
    selectedListId: dopplerListId,
    settingDopplerList: false,
    requestingListCreation: false,
    creatingList: false,
    duplicatedListName: false,
  },
  fieldsMapping: {
    settingFieldsMapping: false,
    retrievingFields: false,
    requestingFieldMappingUpsert: false,
    requestingRemoveMappedField: false,
    mappedFieldToRemove: null,
    shopifyFields: [],
    dopplerFields: [],
    fieldsMapping: fieldsMapping
      ? fieldsMapping
      : [
          { shopify: 'first_name', doppler: 'FIRSTNAME' },
          { shopify: 'last_name', doppler: 'LASTNAME' },
        ],
  },
  errorHandling: {
    showErrorBanner: false,
    errorMessage: '',
  },
  appSetup: {
    appName: 'Doppler for Shopify',
    dopplerAccountName,
    dopplerListId,
    dopplerListName,
    setupCompleted,
    synchronizationInProgress,
    lastSynchronizationDate,
    requestingSynchronization: false,
  },
};
