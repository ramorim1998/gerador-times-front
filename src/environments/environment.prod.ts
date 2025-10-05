export const environment = {
  production: true,
  apiUrl: 'https://gerador-times-back.up.railway.app',
  auth0: {
      domain: 'dev-q8pvey4a13mwd3rg.us.auth0.com', // ← do dashboard Auth0
      clientId: 'mCUJj3plVjDWB65dH11bKRFOwo8FYvtj', // ← do dashboard Auth0  
      authorizationParams: {
        redirect_uri: 'http://localhost:8100' // ← URL local do Ionic
      }
    }
};
