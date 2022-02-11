import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

let headers = new HttpHeaders();
headers = headers.set('Content-Type', 'application/json; charset=utf-8');
// headers = headers.set('Bd-id', '1');

@Injectable({
  providedIn: 'root',
})
export class AddFarmerService {
  userInfo: any;
  token: any;
  headers = new HttpHeaders();
  private baseUrl = environment.baseUrl;
  private endPoints = environment.endPoints;
  private subject = new Subject<any>();

  constructor(private http: HttpClient, public oauthService: OAuthService) {
    this.token = this.oauthService.getIdToken();
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  sendMessage(routeName: string) {
    const messageObj = {
      routeName,
    };
    this.subject.next(messageObj);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  // save(formValue: any) {
  //   console.log(formValue);
  //   return formValue;
  // }

  registerFarmer(data: any) {
    headers = headers.set('Bd-id', String(this.userInfo['custom:access_type']));
    headers = headers.set('Authorization', this.token || '');
    return this.http.post(this.baseUrl + this.endPoints.registerFarmer, data, {
      headers,
    });
  }
}
