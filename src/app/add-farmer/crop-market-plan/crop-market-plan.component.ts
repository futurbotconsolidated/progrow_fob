import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
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
@Component({
  selector: 'app-crop-market-plan',
  templateUrl: './crop-market-plan.component.html',
  styleUrls: ['./crop-market-plan.component.css'],
})
export class CropMarketPlanComponent implements OnInit {
  cropMarketPlanForm = new FormGroup({});

  seedProcureList = <any>[];
  varietyComparisonList = <any>[];
  fertilizerPurchaseList = <any>[];
  pesticideQualityList = <any>[];
  fertilizerAdviseList = <any>[];
  farmGateGradingList = <any>[];
  durationReceivingMoneyList = <any>[];
  warehouseProduceList = <any>[];

  constructor(private formBuilder: FormBuilder) {
    this.cropMarketPlanForm = this.formBuilder.group({
      seedProcure: [Array()], //checkbox
      varietyComparison: new FormControl('high_yield', [Validators.required]), //radio
      fertilizerPurchase: [Array()], //checkbox
      pesticideQuality: new FormControl('very_satisfied', [
        Validators.required,
      ]), //radio
      fertilizerAdvise: [Array()], //checkbox
      farmGateGrading: new FormControl('yes', [Validators.required]),
      durationReceivingMoney: new FormControl('on_spot', [Validators.required]),
      warehouseProduce: new FormControl('yes', [Validators.required]),
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
}
