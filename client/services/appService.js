import fetch from 'isomorphic-fetch';

class AppService {
    static connectToDoppler({ dopplerApiKey, dopplerAccountName }) {
        const request = new Request('/connect-to-doppler', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ dopplerApiKey, dopplerAccountName })
        });
    
        return fetch(request)
        .then(response =>  {
            if (response.status === 200)  
                return true;
            else if (response.status === 401)
                return false;
            
            throw response.text();
        });
    }

    static getDopplerLists() {
        const request = new Request('/doppler-lists', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include'
        });
    
        return fetch(request)
        .then(response =>  {
            if (response.status === 200)  
                return response.json();
            else if (response.status === 401)
                return false;
            
            throw response.text();
        });
    }

    static createDopplerList(name) {
        const request = new Request('/create-doppler-list', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ name })
        });
    
        return fetch(request)
        .then(response =>  {
            if (response.status === 201)
                return response.json();
            else if (response.status === 400)
                return null;
            
            throw response.text();
        });
    }


    static setDopplerList(dopplerListId) {
        const request = new Request('/doppler-list', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ dopplerListId })
        });
    
        return fetch(request)
        .then(response =>  {
            if (response.status === 200)
                return 1;
            
            throw response.text();
        });
    }
}

export default AppService;