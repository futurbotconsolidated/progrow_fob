import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { data } from '../../shared/fob_master_data';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css'],
})
export class SummaryComponent implements OnInit {
  /* START: Variables */
  userInfo: any;
  summary: any;
  masterData = <any>{};
  /* END: Variables */

  constructor(
    public router: Router,
    public oauthService: OAuthService
  ) {    
    this.userInfo = this.oauthService.getIdentityClaims();
    this.masterData = data; // read master data
    const farmer_details: any = localStorage.getItem('farmer-details');
    if (farmer_details) {
      this.summary = JSON.parse(farmer_details);

      this.summary.cultivation_expenditure = (parseFloat(this.summary?.financial_planning?.cultivationCost?.farmElectricityPlanned1) + parseFloat(this.summary?.financial_planning?.cultivationCost?.labourPlanned1) + parseFloat(this.summary?.financial_planning?.cultivationCost?.machineryPlanned1) + parseFloat(this.summary?.financial_planning?.cultivationCost?.seedPlanned1)).toFixed();

      this.summary.household_expenditure = (parseFloat(this.summary?.financial_planning?.educationExpense) + parseFloat(this.summary?.financial_planning?.electricityExpense) + parseFloat(this.summary?.financial_planning?.familyLoanAmount) + parseFloat(this.summary?.financial_planning?.groceryExpense) + parseFloat(this.summary?.financial_planning?.interestExpense)).toFixed();

      console.log('summary : ', this.summary);
    }
  }

  ngOnInit(): void { }
}
