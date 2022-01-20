import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AddFarmerService } from '../add-farmer.service';
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

  constructor(private addFarmerService: AddFarmerService) {
    this.canSubmit = false;
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
    let demoInfo: any = localStorage.getItem('demographic-info');
    let fieldInfo: any = localStorage.getItem('field-info');
    let cropInfo: any = localStorage.getItem('crop-market-planing');
    let finInfo: any = localStorage.getItem('financial-planing');
    let prodInfo: any = localStorage.getItem('produce-aggregator');
    let techAdoptionInfo: any = localStorage.getItem('technology-adoption');
    let coAppInfo: any = localStorage.getItem('co-applicant');

    let obj = {
      bd_id: 1,
      pan_number: JSON.parse(demoInfo).PANnumber,
      mobile: JSON.parse(demoInfo).phoneNumber,
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

    this.addFarmerService.registerFarmer(obj).subscribe((res: any) => {
      console.log(res);
      localStorage.clear();
    });
  }
}
