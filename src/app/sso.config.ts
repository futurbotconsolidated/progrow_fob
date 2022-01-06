import { AuthConfig } from 'angular-oauth2-oidc';

export const authConfig: AuthConfig = {
  issuer: 'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_rr31W9OkL',
  loginUrl: `https://auth.poc.progrow.adaptiwise.com/oauth2/authorize`,
  redirectUri: window.location.origin + `/home`,
  clientId: '5bl9jg0r0dolhksblp49b8ifj2',
  logoutUrl: `https://auth.poc.progrow.adaptiwise.com/oauth2/authorize/logout`,
  // `client_id=5bl9jg0r0dolhksblp49b8ifj2&` +
  // `logout_uri=` +
  // window.location.origin +
  // `/login`,
  // logoutUrl: window.location.origin + `/login`,
  scope: 'openid profile email',
  strictDiscoveryDocumentValidation: false,
  responseType: 'code',
  requireHttps: false,
  // Activate Session Checks:
  sessionChecksEnabled: true,
  showDebugInformation: true,
};
