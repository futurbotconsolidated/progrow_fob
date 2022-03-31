import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddFarmerService } from '../add-farmer.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { OAuthService } from 'angular-oauth2-oidc';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-info-declaration',
  templateUrl: './info-declaration.component.html',
  styleUrls: ['./info-declaration.component.css'],
})
export class InfoDeclarationComponent implements OnInit {
  /* START: Variables */
  declarationForm = new FormGroup({
    agreedTerms: new FormControl('', Validators.required),
  });
  canSubmit: boolean;
  userInfo: any;

  indexedDBName = 'registerFarmer'; // indexed db related
  farmerId = ''; // edit feature
  /* END: Variables */

  constructor(
    private addFarmerService: AddFarmerService,
    private toastr: ToastrService,
    private router: Router,
    private spinner: NgxSpinnerService,
    public oauthService: OAuthService,
    private dbService: NgxIndexedDBService,
    private activatedRoute: ActivatedRoute
  ) {
    this.canSubmit = false;
    this.userInfo = this.oauthService.getIdentityClaims();
    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
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
    let demoInfo: any;
    var fieldInfo: any;
    let cropInfo: any;
    let finInfo: any;
    let prodInfo: any;
    let techAdoptionInfo: any;
    let coAppInfo: any;

    if (this.farmerId) {
      demoInfo = localStorage.getItem('edit-demographic-info');
      fieldInfo = localStorage.getItem('edit-field-info');
      var edit_fieldInfo = JSON.parse(fieldInfo);
      if(!edit_fieldInfo.length){
        var farmer_detail: any = localStorage.getItem('farmer-details');
        if (farmer_detail) {
          var edit_field_info = JSON.parse(farmer_detail).fieldInfo;
          fieldInfo = JSON.stringify(edit_field_info);
        }
      }
      finInfo = localStorage.getItem('edit-financial-planing');
      cropInfo = localStorage.getItem('edit-crop-market-planing');
      prodInfo = localStorage.getItem('edit-produce-aggregator');
      techAdoptionInfo = localStorage.getItem('edit-technology-adoption');
      coAppInfo = localStorage.getItem('edit-co-applicant');
    } else {
      demoInfo = localStorage.getItem('demographic-info');
      fieldInfo = localStorage.getItem('field-info');
      finInfo = localStorage.getItem('financial-planing');
      cropInfo = localStorage.getItem('crop-market-planing');
      prodInfo = localStorage.getItem('produce-aggregator');
      techAdoptionInfo = localStorage.getItem('technology-adoption');
      coAppInfo = localStorage.getItem('co-applicant');
    }
    const INPUT_OBJ = {
      farmer_id: this.farmerId,
      bd_id: this.userInfo['custom:access_type'],
      mobile: JSON.parse(demoInfo).address.mobileNumber,
      pan_number: JSON.parse(demoInfo).identityProof.panNumber,
      demographic_info: JSON.parse(demoInfo),
      field_info: JSON.parse(fieldInfo),
      crop_market_plan: JSON.parse(cropInfo),
      financial_planning: JSON.parse(finInfo),
      produce_aggregator: JSON.parse(prodInfo),
      technology_adoption: JSON.parse(techAdoptionInfo),
      co_applicant_details: JSON.parse(coAppInfo),
      is_required_yn: true,
    };

    console.log(INPUT_OBJ);

    // update farmer
    if (this.farmerId) {
      this.addFarmerService.updateFarmer(INPUT_OBJ).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.message != 'Success' || !res.status) {
            this.toastr.error(`${res.message}!`);
            return;
          } else {
            // check count of indexed-db files data
            this.dbService.count(this.indexedDBName).subscribe((filesCount) => {
              if (filesCount) {
                this.dbService
                  .getAll(this.indexedDBName)
                  .subscribe((files: any) => {
                    const requestData = {
                      farmerId: res.farmerId,
                      fileData: {} as any,
                    };
                    // const form = new FormData();
                    // form.append('farmerId', res.farmerId);
                    files.forEach((x: any) => {
                      requestData.fileData[x.fileFor] = x.file;
                    });
                    // call file upload api
                    // $.ajax({
                    //   url: 'https://api.dev.progrow.adaptiwise.com/v1/farmeronboarding/document_upload',
                    //   method: 'POST',
                    //   timeout: 0,
                    //   processData: false,
                    //   mimeType: 'multipart/form-data',
                    //   contentType: false,
                    //   data: form,
                    // }).done(function (response: any) {
                    //   console.log(response);
                    // });
                    this.addFarmerService.documentUpload(requestData).subscribe(
                      (res: any) => {
                        if (res.message != 'Success' || !res.status) {
                          this.toastr.error(`${res.message}!`);
                          return;
                        } else {
                          this.clearRoute();
                        }
                      },
                      (error: any) => {
                        this.spinner.hide();
                        this.toastr.error(
                          'Failed to upload a document details, please try again...'
                        );
                      }
                    );
                  });
              } else {
                this.clearRoute();
              }
            });
          }
        },
        (error: any) => {
          this.spinner.hide();
          this.toastr.error(
            'Failed to update farmer details, please try again...'
          );
        }
      );
    } else {
      this.addFarmerService.registerFarmer(INPUT_OBJ).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res.message != 'Success' || !res.status) {
            this.toastr.error(`${res.message}!`);
            return;
          } else {
            // check count of indexed-db files data
            this.dbService.count(this.indexedDBName).subscribe((filesCount) => {
              if (filesCount) {
                this.dbService
                  .getAll(this.indexedDBName)
                  .subscribe((files: any) => {
                    const requestData = {
                      farmerId: res.farmerId,
                      fileData: {} as any,
                    };
                    // const form = new FormData();
                    // form.append('farmerId', res.farmerId);
                    files.forEach((x: any) => {
                      requestData.fileData[x.fileFor] = x.file;
                    });
                    // call file upload api
                    // $.ajax({
                    //   url: 'https://api.dev.progrow.adaptiwise.com/v1/farmeronboarding/document_upload',
                    //   method: 'POST',
                    //   timeout: 0,
                    //   processData: false,
                    //   mimeType: 'multipart/form-data',
                    //   contentType: false,
                    //   data: form,
                    // }).done(function (response: any) {
                    //   console.log(response);
                    //   if (response.message != 'Success' || !response.status) {
                    //     alert(response.message);
                    //     //this.toastr.error(`${response.message}!`);
                    //     return;
                    //   } else {
                    //     //this.clearRoute();
                    //   }
                    // });
                    this.addFarmerService.documentUpload(requestData).subscribe(
                      (res: any) => {
                        if (res.message != 'Success' || !res.status) {
                          this.toastr.error(`${res.message}!`);
                          return;
                        } else {
                          this.clearRoute();
                        }
                      },
                      (error: any) => {
                        this.spinner.hide();
                        this.toastr.error(
                          'Failed to upload a document details, please try again...'
                        );
                      }
                    );
                  });
              } else {
                this.clearRoute();
              }
            });
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
  clearRoute() {
    if (this.farmerId) {
      this.toastr.success('Farmer Update Success.');
      localStorage.removeItem('edit-demographic-info');
      localStorage.removeItem('edit-demographic-info-form');
      localStorage.removeItem('edit-field-info');
      localStorage.removeItem('edit-field-info-form');
      localStorage.removeItem('edit-crop-market-planing');
      localStorage.removeItem('edit-financial-planing');
      localStorage.removeItem('edit-produce-aggregator');
      localStorage.removeItem('edit-technology-adoption');
      localStorage.removeItem('edit-co-applicant');
      localStorage.removeItem('edit-co-applicant-form');
      localStorage.removeItem('draft_farmer_new');
    } else {
      this.toastr.success('Farmer Registration Success.');
      localStorage.removeItem('demographic-info');
      localStorage.removeItem('demographic-info-form');
      localStorage.removeItem('field-info');
      localStorage.removeItem('field-info-form');
      localStorage.removeItem('crop-market-planing');
      localStorage.removeItem('financial-planing');
      localStorage.removeItem('produce-aggregator');
      localStorage.removeItem('technology-adoption');
      localStorage.removeItem('co-applicant');
      localStorage.removeItem('co-applicant-form');
      localStorage.removeItem('draft_farmer_new');
    }

    // clear indexed db data
    this.dbService.clear('registerFarmer').subscribe((successDeleted) => {
      console.log('success? ', successDeleted);
    });

    this.router.navigate(['/bd/dashboard']);
  }
}
