import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { data } from '../../shared/fob_master_data';
import { AddFarmerService } from '../add-farmer.service';
enum SaveStatus {
  Saving = 'Saving...',
  Saved = 'Saved.',
  Idle = '',
}
@Component({
  selector: 'app-crop-market-plan',
  templateUrl: './crop-market-plan.component.html',
  styleUrls: ['./crop-market-plan.component.css'],
})
export class CropMarketPlanComponent implements OnInit {
  /* START: Variable */
  cropMarketPlanForm = new FormGroup({});
  cropMarketPlanMaster = <any>{};
  nextRoute: any;
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle = SaveStatus.Idle;
  /* END: Variable */

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.cropMarketPlanForm = this.formBuilder.group({
      seedProcure: [Array()],
      varietyComparison: new FormControl('', [Validators.required]),
      fertilizerPurchase: [Array()],
      pesticideQuality: new FormControl('', [Validators.required]),
      fertilizerAdvise: [Array()],
      farmGateGrading: new FormControl('', [Validators.required]),
      durationReceivingMoney: new FormControl('', [Validators.required]),
      warehouseProduce: new FormControl('', [Validators.required]),
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }

  ngOnInit(): void {
    this.cropMarketPlanMaster = data.cropMarket; // read master data
    // -----------------------start auto save --------------------
    this.cropMarketPlanForm.valueChanges
    .pipe(
      tap(() => {
        this.saveStatus = SaveStatus.Saving;
      })
    )
    .subscribe(async (form_values) => {
      let draft_farmer_new = {} as any;
      if(localStorage.getItem('draft_farmer_new')){
        draft_farmer_new = JSON.parse(localStorage.getItem('draft_farmer_new') as any);    
      }
      draft_farmer_new['crop_market_planing'] = form_values;
      localStorage.setItem('draft_farmer_new', JSON.stringify(draft_farmer_new));
      this.saveStatus = SaveStatus.Saved;
      if (this.saveStatus === SaveStatus.Saved) {
        this.saveStatus = SaveStatus.Idle;
      }
    });
    // -----------------------End auto save --------------------
    let cropPlan: any = localStorage.getItem('crop-market-planing');
    if (cropPlan) {
      cropPlan = JSON.parse(cropPlan);
      this.cropMarketPlanForm.patchValue(cropPlan);
      console.log(cropPlan);
    }
  }

  validateNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  selectCultivationAdvice(event: any, formCtlName: any, formVal: any) {
    formVal = String(formVal);
    let aryValCurr = this.cropMarketPlanForm.controls[formCtlName].value;
    let aryValNew: any = [];
    if (Array.isArray(aryValCurr)) {
      aryValNew = [...aryValCurr];
    } else if (aryValCurr) {
      aryValNew = String(aryValCurr).split(',');
    }
    if (aryValNew.includes(formVal) && !event.target.checked) {
      aryValNew.splice(aryValNew.indexOf(formVal), 1);
    } else {
      aryValNew.push(formVal);
    }
    // update the form value
    // @ts-ignore: Object is possibly 'null'.
    this.cropMarketPlanForm.get(formCtlName).setValue(aryValNew);
    if (this.cropMarketPlanForm.controls[formCtlName].pristine) {
      // @ts-ignore: Object is possibly 'null'.
      this.cropMarketPlanForm.get(formCtlName).markAsDirty();
    }
  }

  saveData() {
    let url = `/add/${this.nextRoute}`;
    console.log(url);
    localStorage.setItem(
      'crop-market-planing',
      JSON.stringify(this.cropMarketPlanForm.value)
    );
    this.router.navigate([url]);
  }
}
