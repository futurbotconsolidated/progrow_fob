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

      this.summary.harvest_produce = [];
      this.summary.planned_crops = [];
      this.summary?.fieldInfo.forEach((x: any) => {
        if (x.planned_season_detail?.plannedFieldDetails?.crop && x.planned_season_detail?.plannedFieldDetails?.expectedProduce) {
          let exppro = {
            crop: x.planned_season_detail?.plannedFieldDetails?.crop,
            expectedProduce: x.planned_season_detail?.plannedFieldDetails?.expectedProduce,
          }
          this.summary.harvest_produce.push(exppro);
        }
        if (x.planned_season_detail?.plannedCrops) {
          this.summary.planned_crops.push(x.planned_season_detail?.plannedCrops);
        }
      });
      this.summary.dependency = 'No';
      this.summary?.demographic_info?.familyMembers.forEach((x: any) => {
        if (x?.dependency?.toString().toLowerCase() == 'yes') {
          this.summary.dependency = 'Yes';
          return;
        }
      });
    }
  }
  
  ngOnInit(): void { }
}
