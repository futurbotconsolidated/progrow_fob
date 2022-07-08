import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
  issuer: 'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_IlarGnsQV',
  loginUrl: `https://auth1.agrisaathi.com/oauth2/authorize`,
  redirectUri: 'https://fob.agrisaathi.com/home',
  clientId: '1806krf02bdr6a953e0mnk6l54',
  logoutUrl:
    'https://auth1.agrisaathi.com/logout?client_id=1806krf02bdr6a953e0mnk6l54&response_type=code&scope=openid+profile&redirect_uri=https://fob.agrisaathi.com/login',

  scope: 'openid profile email',
  strictDiscoveryDocumentValidation: false,
  responseType: 'code',
  requireHttps: false,
  showDebugInformation: false,
  oidc: true,
};
