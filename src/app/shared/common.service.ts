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
  getExistingFarmers(filterValue: string) {
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Bd-id', String(this.userInfo['custom:access_type']));
    headers = headers.set('Filter-Type', filterValue);
    headers = headers.set('Authorization', this.token);
    return this.http.get(this.baseUrl + this.endPoints.getAllFarmers, {
      headers,
    });
  }

  getFarmerDetailsById(id: any) {
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.set('Farmer-Id', String(id));
    headers = headers.set('Authorization', this.token);
    return this.http.get(this.baseUrl + this.endPoints.getFarmer, {
      headers,
    });
  }

  getDocumentByFarmerId(inputObject: any) {
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.getDocument,
      inputObject,
      {
        headers,
      }
    );
  }

  getPinCodeData(data: any) {
    return this.http.get(
      `https://api.worldpostallocations.com/?postalcode=${data}&countrycode=IN`
    );
    // return this.http.get(`https://api.postalpincode.in/pincode/${data}`);
  }
  /* END: API Calls */

  /* START: Non-API Calls */
  fetchFarmerDocument(fileFor: string) {
    const A = localStorage.getItem('farmer-files');
    console.log(A);

    if (A) {
      const B = JSON.parse(A);
      if (B.hasOwnProperty(fileFor)) {
        return B[fileFor];
      } else {
        return '';
      }
    }
  }
  /* END: Non-API Calls */
}
