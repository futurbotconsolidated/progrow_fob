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

  /* START: Variables */
  formScoreArray = [
    {
      id: 1,
      displayName: '< 40',
      from: '',
      to: 40,
      type: 'LEES_THAN',
      backgroundColor: 'red',
      color: '#FFFFFF',
    },
    {
      id: 2,
      displayName: '40 - 60',
      from: 40,
      to: 60,
      type: 'BETWEEN',
      backgroundColor: 'yellow',
      color: '#FFFFFF',
    },
    {
      id: 3,
      displayName: '60 - 80',
      from: 60,
      to: 80,
      type: 'BETWEEN',
      backgroundColor: 'blue',
      color: '#FFFFFF',
    },
    {
      id: 4,
      displayName: '> 80',
      from: 80,
      to: '',
      type: 'GREATER_THAN',
      backgroundColor: 'skyblue',
      color: '#FFFFFF',
    },
  ];

  formSizeArray = [
    {
      id: 1,
      displayName: '< 1 Ha',
      from: '',
      to: 1,
      type: 'LEES_THAN',
      backgroundColor: 'red',
      color: '#FFFFFF',
    },
    {
      id: 2,
      displayName: '1 - 2 Ha',
      from: 1,
      to: 2,
      type: 'BETWEEN',
      backgroundColor: 'skyblue',
      color: '#FFFFFF',
    },
    {
      id: 3,
      displayName: '2 - 4 Ha',
      from: 2,
      to: 4,
      type: 'BETWEEN',
      backgroundColor: 'blue',
      color: '#FFFFFF',
    },
    {
      id: 4,
      displayName: '4 - 8 Ha',
      from: 4,
      to: 8,
      type: 'BETWEEN',
      backgroundColor: 'yellow',
      color: '#FFFFFF',
    },
    {
      id: 5,
      displayName: '> 8 Ha',
      from: 8,
      to: '',
      type: 'GREATER_THAN',
      backgroundColor: 'orange',
      color: '#FFFFFF',
    },
  ];

  // crops colors to display on map for filter
  cropColors = {
    cumin: {
      backgroundColor: 'red',
      color: '#FFFFFF',
      pricePerKg: 100,
    },
    gram: {
      backgroundColor: 'skyblue',
      color: '#FFFFFF',
      pricePerKg: 50,
    },
    isabgol: {
      backgroundColor: 'blue',
      color: '#FFFFFF',
      pricePerKg: 80,
    },
    mustard: {
      backgroundColor: 'orange',
      color: '#FFFFFF',
      pricePerKg: 55,
    },
    others: {
      backgroundColor: '#1e16b7',
      color: '#FFFFFF',
      pricePerKg: 100,
    },
    wheat: {
      backgroundColor: '#e4c317',
      color: '#FFFFFF',
      pricePerKg: 35,
    },
    ground_nut: {
      backgroundColor: '#BD5949',
      color: '#FFFFFF',
      pricePerKg: 35,
    },
    green_gram: {
      backgroundColor: '#93A64F',
      color: '#FFFFFF',
      pricePerKg: 35,
    },
    cluster_bean: {
      backgroundColor: '#45C425',
      color: '#FFFFFF',
      pricePerKg: 35,
    },
    pearl_millet: {
      backgroundColor: '#FFC800',
      color: '#FFFFFF',
      pricePerKg: 35,
    },
  };

  token: any;
  headers = new HttpHeaders();

  /* ============================================START: API Base and Endpoints ============================================ */
  private baseUrl = environment.baseUrl;
  private leadUrl = environment.leadUrl;
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

  checkMobileNo(data: any) {
    const input_obj = {
      mobile: data,
    };
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.checkMobile,
      input_obj,
      {
        headers,
      }
    );
  }

  checkPAN(data: any) {
    const input_obj = {
      pan_number: data,
    };
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.checkPAN,
      input_obj,
      {
        headers,
      }
    );
  }

  getAudit(data: any) {
    const input_obj = {
      farmer_id: data,
    };
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.getAudit,
      input_obj,
      {
        headers,
      }
    );
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

  sendToMifin(farmer_id: any) {
    const input_obj = {
      farmer_id: farmer_id,
      bd_id: String(this.userInfo['custom:access_type']),
    };
    headers = headers.delete('Bd-id');
    headers = headers.delete('Filter-Type');
    headers = headers.delete('Farmer-Id');
    headers = headers.set('Authorization', this.token);
    return this.http.post(
      this.baseUrl + this.endPoints.sendToMifin,
      input_obj,
      {
        headers,
      }
    );
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

  postAreaOfInterest(param: any) {
    return this.http.post(this.leadUrl + this.endPoints.postAreaOfInterest,
      param,
      { headers: { Authorization: this.token || '' }, }
    );
  }

  getFieldData(url: string) {
    return this.http.get(url);
  }

  postFarmerData(param:any) {
    param.bd_id = String(this.userInfo['custom:access_type']);
    return this.http.post(
      this.baseUrl + this.endPoints.registerFarmer,
      param,
      {
        headers: { Authorization: this.token || '' },
      }
    );
  }

  getFilterMeta() {
    return this.http.get(this.leadUrl + this.endPoints.getFilterMeta, {
      headers: { Authorization: this.token || '' },
    });
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
  
  getLocalBaseData() {
    return {
      formScoreArray: this.formScoreArray,
      formSizeArray: this.formSizeArray,
      cropColors: this.cropColors,
    };
  }
  /* ============================================END: Non-API Calls ====================================== */
}
