import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
  issuer: 'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_rr31W9OkL',
  loginUrl: `https://auth.poc.progrow.adaptiwise.com/oauth2/authorize`,
  redirectUri: 'http://localhost:4200/home',
  clientId: '5bl9jg0r0dolhksblp49b8ifj2',
  logoutUrl:
    'https://auth.poc.progrow.adaptiwise.com/logout?client_id=5bl9jg0r0dolhksblp49b8ifj2&response_type=code&scope=openid+profile&redirect_uri=http://localhost:4200/login',

  scope: 'openid profile email',
  strictDiscoveryDocumentValidation: false,
  responseType: 'code',
  requireHttps: false,
  showDebugInformation: true,
  oidc: true,
};
