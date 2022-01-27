import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';

let headers = new HttpHeaders();
headers = headers.set('Content-Type', 'application/json; charset=utf-8');

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  token: any;
  headers = new HttpHeaders();

  /* START API Base and Endpoints */
  private baseUrl = environment.baseUrl;
  private endPoints = environment.endPoints;
  /* END:: API Base and Endpoints */

  constructor(private http: HttpClient, public oauthService: OAuthService) {
    this.token = this.oauthService.getIdToken();
  }

  /* START: API Calls */
  getExistingFarmers() {
    headers = headers.set('Bd-id', '1');
    headers = headers.set('Authorization', this.token || '');
    return this.http.get(this.baseUrl + this.endPoints.getAllFarmers, {
      headers,
    });
  }

  getFarmersPipeline() {
    headers = headers.set('Bd-id', '1');
    headers = headers.set('Authorization', this.token || '');
    return this.http.get(this.baseUrl + this.endPoints.getAllFarmers, {
      headers,
    });
  }

  getPinCodeData(data: any) {
    return this.http.get(`https://api.postalpincode.in/pincode/${data}`);
  }
  /* END: API Calls */
}
