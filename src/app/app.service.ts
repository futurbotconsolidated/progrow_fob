import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  token: any;
  private baseUrl = environment.baseUrl;
  private endPoints = environment.endPoints;
  constructor(private http: HttpClient, public oauthService: OAuthService) {
    this.token = this.oauthService.getIdToken();
  }

  getAllFarmersData() {
    return this.http.get(this.baseUrl + this.endPoints.getAllFarmers, {
      headers: { Authorization: this.token || '' },
    });
  }
}
