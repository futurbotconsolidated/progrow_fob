// let clientId = '5bl9jg0r0dolhksblp49b8ifj2';
// let secret = 'q5907a06p6f57altooqljpg22cnckeoeudi458o0u9bd9k29v9e';
// let issuer =
//   'https://cognito-idp.ap-south-1.amazonaws.com/ap-south-1_rr31W9OkL';
// // let logoutUrl =
// //   `https://auth.poc.progrow.adaptiwise.com/oauth2/authorize/logout?` +
// //   `response_type=code&client_id=5bl9jg0r0dolhksblp49b8ifj2&` +
// //   `logout_uri=` +
// //   window.location.origin +
// //   `/login`;

// // let logoutUrl =

// export const environment = {
//   production: false,
//   idp: {
//     issuer: issuer,
//     redirectUri: window.location.origin + `/home`,
//     clientId: clientId,
//     scope: 'openid profile email',
//     responseType: 'code',
//     showDebugInformation: true,
//     dummyClientSecret: secret,
//     logoutUrl:
//       'https://auth.poc.progrow.adaptiwise.com/logout?' +
//       'response_type=code&client_id=5bl9jg0r0dolhksblp49b8ifj2&state=T1V1dkE1RlpUajR0LXEtZXJfS1dYb1BHQUhsaDJuUnp3Y21HZFR-clpzRHF3&redirect_uri=http%3A%2F%2Flocalhost%3A4200%2Flogin&scope=openid%20profile%20email&code_challenge=yKiZ0My0-SLdvRVl8pQVRv15d_IATmxZZTBXDLgCjkQ&code_challenge_method=S256&nonce=T1V1dkE1RlpUajR0LXEtZXJfS1dYb1BHQUhsaDJuUnp3Y21HZFR-clpzRHF3',
//     skipIssuerCheck: true,
//     strictDiscoveryDocumentValidation: false,
//   },
// };

import { baseUrl, endPoints } from './api-endpoints';
export const environment = {
  production: false,
  baseUrl: baseUrl,
  endPoints: endPoints,
};
