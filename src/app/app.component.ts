import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { OAuthService } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import { authCodeFlowConfig } from './shared/authCodeFlowConfig';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'FRCM-angular';

  onActivate(event: any) {
    window.scroll(0, 0);
  }

  constructor(public oauthService: OAuthService, private router: Router) {
    this.oauthService.configure(authCodeFlowConfig);
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService
      .loadDiscoveryDocumentAndLogin({
        customHashFragment: window.location.search,
      })
      .then((res: any) => {
        if (
          !this.oauthService.hasValidIdToken() ||
          !this.oauthService.hasValidAccessToken() ||
          !this.oauthService.getIdentityClaims()
        ) {
          localStorage.removeItem('filter-value');
          localStorage.removeItem('master-data');
          localStorage.removeItem('saveroute');
          sessionStorage.clear();
          this.oauthService.initCodeFlow();
        } else {
          if (localStorage.getItem('saveroute') == '/bd/display-map') {
            this.router.navigate(['/bd/display-map']);
          } else {
            this.router.navigate(['/bd/dashboard']);
          }
        }
      });
  }
  ngOnInit(): void { }

  get token() {
    let claims: any = this.oauthService.getIdentityClaims();
    return claims ? claims : null;
  }
}
