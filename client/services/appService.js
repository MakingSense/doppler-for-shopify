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
}

export default AppService;