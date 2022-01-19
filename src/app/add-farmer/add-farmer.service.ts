import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AddFarmerService {
  private subject = new Subject<any>();

  constructor() {}
  sendMessage(routeName: string) {
    const messageObj = {
      routeName,
    };
    this.subject.next(messageObj);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  save(formValue: any) {
    console.log(formValue);
    return formValue;
  }
}
