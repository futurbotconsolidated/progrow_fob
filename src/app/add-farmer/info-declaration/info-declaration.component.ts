import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddFarmerService } from '../add-farmer.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-info-declaration',
  templateUrl: './info-declaration.component.html',
  styleUrls: ['./info-declaration.component.css'],
})
export class InfoDeclarationComponent implements OnInit {
  declarationForm = new FormGroup({
    agreedTerms: new FormControl('', Validators.required),
  });
  canSubmit: boolean;
  userInfo: any;

  constructor(
    private addFarmerService: AddFarmerService,
    private toastr: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public oauthService: OAuthService
  ) {
    this.canSubmit = false;
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  ngOnInit(): void {}

  checkedData() {
    if (this.declarationForm.value.agreedTerms) {
      this.canSubmit = false;
    }
    if (!this.declarationForm.value.agreedTerms) {
      this.canSubmit = true;
    }
  }

  saveData() {
    this.spinner.show();

    let demoInfo: any = localStorage.getItem('demographic-info');
    let fieldInfo: any = localStorage.getItem('field-info');
    let cropInfo: any = localStorage.getItem('crop-market-planing');
    let finInfo: any = localStorage.getItem('financial-planing');
    let prodInfo: any = localStorage.getItem('produce-aggregator');
    let techAdoptionInfo: any = localStorage.getItem('technology-adoption');
    let coAppInfo: any = localStorage.getItem('co-applicant');

    let obj = {
      bd_id: this.userInfo['custom:access_type'],
      pan_number: JSON.parse(demoInfo).identityProof.panNumber,
      mobile: JSON.parse(demoInfo).address.mobileNumber,
      demographic_info: JSON.parse(demoInfo),
      field_info: JSON.parse(fieldInfo),
      crop_market_plan: JSON.parse(cropInfo),
      financial_planning: JSON.parse(finInfo),
      produce_aggregator: JSON.parse(prodInfo),
      technology_adoption: JSON.parse(techAdoptionInfo),
      co_applicant_details: JSON.parse(coAppInfo),
      is_required_yn: true,
    };

    console.log(obj);

    this.addFarmerService.registerFarmer(obj).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.message != 'Success' || !res.status) {
          this.toastr.error(`${res.message}!`);
          return;
        } else {
          console.log(res);
          this.toastr.success('Farmer Registration Success.');
          localStorage.clear();
          this.router.navigate(['/bd/dashboard']);
        }
      },
      (error: any) => {
        this.spinner.hide();
        this.toastr.error(
          'Failed to register farmer details, please try again...'
        );
      }
    );
  }
}
