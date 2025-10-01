export const environment = {
  production: true,
  apiUrl: process.env['NG_APP_API_URL'] || 'https://gerador-times-back.up.railway.app/api',
  auth0: {
    domain: process.env['NG_APP_AUTH0_DOMAIN'] || 'seu-dominio.auth0.com',
    clientId: process.env['NG_APP_AUTH0_CLIENT_ID'] || 'seu-client-id',
    authorizationParams: {
      redirect_uri: process.env['NG_APP_AUTH0_REDIRECT_URI'] || 'https://gerador-times.netlify.app'
    }
  }
};