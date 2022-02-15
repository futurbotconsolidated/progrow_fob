import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-co-applicant',
  templateUrl: './edit-co-applicant.component.html',
  styleUrls: ['./edit-co-applicant.component.css'],
})
export class EditCoApplicantComponent implements OnInit {
  coApplicantDisp = {} as any;
  constructor() {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      this.coApplicantDisp = JSON.parse(A).co_applicant_details;
      console.log(this.coApplicantDisp);
    }
  }
  ngOnInit(): void {}
}
