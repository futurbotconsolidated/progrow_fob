import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  seedProcure,
  varietyComparison,
  fertilizerPurchase,
  fertilizerAdvise,
  farmGateGrading,
  durationReceivingMoney,
  warehouseProduce,
  pesticideQuality,
} from '../../shared/modal/global-field-values';
import { AddFarmerService } from '../add-farmer.service';
@Component({
  selector: 'app-crop-market-plan',
  templateUrl: './crop-market-plan.component.html',
  styleUrls: ['./crop-market-plan.component.css'],
})
export class CropMarketPlanComponent implements OnInit {
  cropMarketPlanForm = new FormGroup({});
  nextRoute: any;

  seedProcureList = <any>[];
  varietyComparisonList = <any>[];
  fertilizerPurchaseList = <any>[];
  pesticideQualityList = <any>[];
  fertilizerAdviseList = <any>[];
  farmGateGradingList = <any>[];
  durationReceivingMoneyList = <any>[];
  warehouseProduceList = <any>[];

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.cropMarketPlanForm = this.formBuilder.group({
      seedProcure: [Array()],
      varietyComparison: new FormControl('high_yield', [Validators.required]),
      fertilizerPurchase: [Array()],
      pesticideQuality: new FormControl('very_satisfied', [
        Validators.required,
      ]),
      fertilizerAdvise: [Array()],
      farmGateGrading: new FormControl('yes', [Validators.required]),
      durationReceivingMoney: new FormControl('on_spot', [Validators.required]),
      warehouseProduce: new FormControl('yes', [Validators.required]),
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }

  ngOnInit(): void {
    this.seedProcureList = seedProcure;
    this.varietyComparisonList = varietyComparison;
    this.fertilizerPurchaseList = fertilizerPurchase;
    this.pesticideQualityList = pesticideQuality;
    this.fertilizerAdviseList = fertilizerAdvise;
    this.farmGateGradingList = farmGateGrading;
    this.durationReceivingMoneyList = durationReceivingMoney;
    this.warehouseProduceList = warehouseProduce;

    console.log(this.fertilizerAdviseList, '----fertilizerAdviseList');

    let cropPlan: any = localStorage.getItem('crop-market-planing');
    if (cropPlan) {
      cropPlan = JSON.parse(cropPlan);
      this.cropMarketPlanForm.patchValue(cropPlan);
      console.log(cropPlan);
    }
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
