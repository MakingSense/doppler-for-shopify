import fetch from 'isomorphic-fetch';

const commonRequestHeaders = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

class AppService {
  static connectToDoppler({ dopplerApiKey, dopplerAccountName }) {
    const request = new Request('/connect-to-doppler', {
      ...commonRequestHeaders,
      method: 'POST',
      body: JSON.stringify({ dopplerApiKey, dopplerAccountName }),
    });

    return fetch(request).then(response => {
      if (response.status === 200) return true;
      else if (response.status === 401) return false;

      throw response.text();
    });
  }

  static getDopplerLists() {
    const request = new Request('/doppler-lists', {
      ...commonRequestHeaders,
      method: 'GET',
    });

    return fetch(request).then(response => {
      if (response.status === 200) return response.json();

      throw response.text();
    });
  }

  static createDopplerList(name) {
    const request = new Request('/create-doppler-list', {
      ...commonRequestHeaders,
      method: 'POST',
      body: JSON.stringify({ name }),
    });

    return fetch(request).then(response => {
      if (response.status === 201) return response.json();
      else if (response.status === 400) return null;

      throw response.text();
    });
  }

  static setDopplerList(dopplerListId, dopplerListName) {
    const request = new Request('/doppler-list', {
      ...commonRequestHeaders,
      method: 'POST',
      body: JSON.stringify({ dopplerListId, dopplerListName }),
    });

    return fetch(request).then(response => {
      if (response.status === 200) return;

      throw response.text();
    });
  }

  static getFields() {
    const request = new Request('/fields', {
      ...commonRequestHeaders,
      method: 'GET',
    });

    return fetch(request).then(response => {
      if (response.status === 200) return response.json();

      throw response.text();
    });
  }

  static setFieldsMapping(fieldsMapping) {
    const request = new Request('/fields-mapping', {
      ...commonRequestHeaders,
      method: 'POST',
      body: JSON.stringify({ fieldsMapping }),
    });

    return fetch(request).then(response => {
      if (response.status === 200) return;

      throw response.text();
    });
  }

  static synchronizeCustomers() {
    const request = new Request('/synchronize-customers', {
      ...commonRequestHeaders,
      method: 'POST',
    });

    return fetch(request).then(response => {
      if (response.status === 201) return;

      throw response.text();
    });
  }
}

export default AppService;
