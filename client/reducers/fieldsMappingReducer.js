import * as types from '../actions/actionTypes';
import initialState from './initialState';

export const fieldsMapping = (state = initialState.fieldsMapping, action) => {
  switch (action.type) {
      case types.REQUESTING_FIELD_MAPPING_UPSERT:
      return {
        ...state,
        requestingFieldMappingUpsert: action.requestingFieldMappingUpsert
      };

      case types.REQUESTING_REMOVE_MAPPED_FIELD:
      return {
        ...state,
        requestingRemoveMappedField: action.requestingRemoveMappedField,
        mappedFieldToRemove: action.requestingRemoveMappedField ? action.mappedFieldToRemove : null
      };

      case types.MAPPED_FIELD_REMOVED:
      return Object.assign({}, state, {
        fieldsMapping: [
          ...state.fieldsMapping.filter(m => m.shopify !== action.shopifyField)
        ]
      });

      case types.RETRIEVING_FIELDS:
      return {
        ...state,
        retrievingFields: action.retrievingFields
      };

      case types.FIELDS_RETRIEVED:
      return {
        ...state,
        shopifyFields: action.shopifyFields,
        dopplerFields: action.dopplerFields
      };

      case types.NEW_MAPPED_FIELD_ADDED:
      return Object.assign({}, state, {
        fieldsMapping: [
          ...state.fieldsMapping,
          Object.assign({}, action.mapping)
        ]});
 
      case types.SETTING_FIELDS_MAPPING:
      return {
        ...state,
        settingFieldsMapping: action.settingFieldsMapping
      };

    default:
      return state;
  }
};