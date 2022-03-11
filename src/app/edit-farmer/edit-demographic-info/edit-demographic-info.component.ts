import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-demographic-info',
  templateUrl: './edit-demographic-info.component.html',
  styleUrls: ['./edit-demographic-info.component.css'],
})
export class EditDemographicInfoComponent implements OnInit {
  demographicDisp = {} as any;
  constructor() {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
    }
  }

  ngOnInit(): void {}
}
