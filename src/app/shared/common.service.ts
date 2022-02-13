import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { OAuthService } from 'angular-oauth2-oidc';
import { data } from '../shared/fob_master_data';

let headers = new HttpHeaders();
headers = headers.set('Content-Type', 'application/json; charset=utf-8');

@Injectable({
  providedIn: 'root',
})
export class CommonService {
  userInfo: any;
  masterData: any = {};

  token: any;
  headers = new HttpHeaders();
  /* START API Base and Endpoints */
  private baseUrl = environment.baseUrl;
  private endPoints = environment.endPoints;
  /* END:: API Base and Endpoints */

  constructor(private http: HttpClient, public oauthService: OAuthService) {
    this.token = this.oauthService.getIdToken();
    this.userInfo = this.oauthService.getIdentityClaims();
    this.masterData = data;
  }

  /* START: API Calls */
  getExistingFarmers() {
    // headers = headers.set('Bd-id', '1');
    headers = headers.set('Bd-id', String(this.userInfo['custom:access_type']));
    headers = headers.set('Authorization', this.token || '');
    return this.http.get(this.baseUrl + this.endPoints.getAllFarmers, {
      headers,
    });
  }

  getFarmersPipeline() {
    headers = headers.set('Bd-id', String(this.userInfo['custom:access_type']));
    headers = headers.set('Authorization', this.token || '');
    return this.http.get(this.baseUrl + this.endPoints.getAllFarmers, {
      headers,
    });
  }

  getFarmerDetailsById(id: any) {
    headers = headers.set('Farmer-Id', String(id));
    headers = headers.set('Authorization', this.token || '');
    return this.http.get(this.baseUrl + this.endPoints.getFarmer, {
      headers,
    });
  }

  getPinCodeData(data: any) {
    return this.http.get(`https://api.postalpincode.in/pincode/${data}`);
  }
  /* END: API Calls */

  /* START: NON-API Calls */
  getDisplayName(pageProperty: string, dataProperty: string, id: any) {
    if (id === '' || id === null) return 'N/A';
    const A = this.masterData[pageProperty][dataProperty].filter(
      (x: any) => x.displayValue == id
    );
    if (Array.isArray(A) && A.length) {
      return A[0].displayName;
    } else {
      return 'N/A';
    }
  }
  /* END: NON-API Calls */
}
