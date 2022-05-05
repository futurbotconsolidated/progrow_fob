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

  /* ============================================START: API Base and Endpoints ============================================ */
  private baseUrl = environment.baseUrl;
  private endPoints = environment.endPoints;
  /* ============================================END: API Base and Endpoints ============================================ */

  constructor(private http: HttpClient, public oauthService: OAuthService) {
    this.token = this.oauthService.getIdToken();
    this.userInfo = this.oauthService.getIdentityClaims();
    this.masterData = data;
  }

  /* ============================================START: API Calls ============================================ */
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
    const input_obj = {
      pincode: data,
    };
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.pinCodeData,
      input_obj,
      {
        headers,
      }
    );
    // return this.http.get(
    //   `https://api.worldpostallocations.com/?postalcode=${data}&countrycode=IN`
    // );
    // return this.http.get(`https://api.postalpincode.in/pincode/${data}`);
  }
  getMasterData() {
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.get(this.baseUrl + this.endPoints.masterData, {
      headers,
    });
  }

  // ekyc api
  getKycData(inputObject: any) {
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.ekyc.getKycData,
      inputObject,
      {
        headers,
      }
    );
  }

  // aadhaar ekyc api - 1
  getAadhaarEkycVerification(inputObject: any) {
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.ekyc.getAadhaarEkycVerification,
      inputObject,
      {
        headers,
      }
    );
  }
  // aadhaar ekyc api - 2
  getAadhaarDetails(inputObject: any) {
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.ekyc.getAadhaarDetails,
      inputObject,
      {
        headers,
      }
    );
  }

  getDownloadCsv(filterValue: string) {
    const input_obj = {
      Bd_Id: String(this.userInfo['custom:access_type']),
      Filter_Type: filterValue,
    };
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.downloadCsv,
      input_obj,
      {
        headers,
      }
    );
  }
  /* ============================================END: API Calls ============================================ */

  /* ============================================START: Non-API Calls ====================================== */
  fetchFarmerDocument(fileFor: string) {
    const A = localStorage.getItem('farmer-files');
    if (A) {
      const B = JSON.parse(A);
      if (B.hasOwnProperty(fileFor)) {
        return B[fileFor];
      } else {
        return '';
      }
    }
  }
  /* ============================================END: Non-API Calls ====================================== */
}
