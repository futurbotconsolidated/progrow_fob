import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
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
export class CropMarketPlanComponent
  implements OnInit, AfterViewInit, OnDestroy {
  /* START: Variables ---------------------------------------------*/
  private observableSubscription: any;

  nextRoute: any;
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle =
    SaveStatus.Idle;

  cropMarketPlanForm = new FormGroup({});
  cropMarketPlanMaster = <any>{};
  commonMaster = <any>{};
  sellProduceArray = {
    thead: [
      'Local Mandi',
      'District Mandi',
      'Farm gate aggregator',
      'Arhatiya',
    ],
    tbody: [
      { formControlName: 'particular1', displayLabel: 'Particular-1' },
      { formControlName: 'particular2', displayLabel: 'Particular-2' },
      { formControlName: 'particular3', displayLabel: 'Particular-3' },
      { formControlName: 'particular4', displayLabel: 'Particular-4' },
    ],
  };

  farmerId = ''; // edit feature
  /* END: Variables --------------------------------------------- */

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.cropMarketPlanForm = this.formBuilder.group({
      seedProcure: [Array()],
      seedProcureOther: new FormControl(''),
      varietyComparison: new FormControl(''),

      year1: new FormControl(''),
      crop1: new FormControl(''),
      selfConsumption1: new FormControl(''),
      seedReplacement1: new FormControl(''),
      sellAtMarketPlace1: new FormControl(''),

      year2: new FormControl(''),
      crop2: new FormControl(''),
      selfConsumption2: new FormControl(''),
      seedReplacement2: new FormControl(''),
      sellAtMarketPlace2: new FormControl(''),

      fertilizerPurchase: [Array()],
      fertilizerPurchaseOther: new FormControl(''),

      pesticideQuality: new FormControl(''),
      fertilizerAdvise: [Array()],
      fertilizerAdviseOther: new FormControl(''),

      farmGateGrading: new FormControl(''),
      durationReceivingMoney: new FormControl(''),
      durationReceivingMoneyOther: new FormControl(''),
      warehouseProduce: new FormControl(''),

      sellProduceComment: new FormControl(''),
      particular1: new FormControl(''),
      particular2: new FormControl(''),
      particular3: new FormControl(''),
      particular4: new FormControl(''),
    });

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }

  /* START: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */
  ngOnInit(): void {
    this.cropMarketPlanMaster = data.cropMarket; // read master data
    this.commonMaster = data.commonData; // read master data
    // -----------------------start auto save --------------------
    // draft feature is not required in edit operation
    if (!this.farmerId) {
      this.cropMarketPlanForm.valueChanges
        .pipe(
          tap(() => {
            this.saveStatus = SaveStatus.Saving;
          })
        )
        .subscribe(async (form_values) => {
          let draft_farmer_new = {} as any;
          if (localStorage.getItem('draft_farmer_new')) {
            draft_farmer_new = JSON.parse(
              localStorage.getItem('draft_farmer_new') as any
            );
          }
          draft_farmer_new['crop_market_planing'] = form_values;
          localStorage.setItem(
            'draft_farmer_new',
            JSON.stringify(draft_farmer_new)
          );
          this.saveStatus = SaveStatus.Saved;
          if (this.saveStatus === SaveStatus.Saved) {
            this.saveStatus = SaveStatus.Idle;
          }
        });
    }
    // -----------------------End auto save --------------------

    // if case is for EDIT and else case is for NEW/DRAFT
    if (this.farmerId) {
      let editForm: any = localStorage.getItem('edit-crop-market-planing');
      if (editForm) {
        editForm = JSON.parse(editForm);
        this.cropMarketPlanForm.patchValue(editForm);
      } else {
        const A: any = localStorage.getItem('farmer-details');
        if (A) {
          const B = JSON.parse(A).crop_market_plan;
          this.cropMarketPlanForm.patchValue(B);
        }
      }
    } else {
      let cropPlan: any = localStorage.getItem('crop-market-planing');
      if (cropPlan) {
        cropPlan = JSON.parse(cropPlan);
        this.cropMarketPlanForm.patchValue(cropPlan);
      }
    }

    //--------------------------EDIT--------
    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }

  ngAfterViewInit(): void {
    /** subscribe to Observables, which are triggered from header selections*/
    this.observableSubscription = this.addFarmerService
      .getMessage()
      .subscribe((data) => {
        this.nextRoute = data.routeName;
        if (this.router.url?.includes('/add/crop-market-plan')) {
          this.saveData();
        }
      });
  }

  ngOnDestroy(): void {
    /** unsubscribe from Observables*/
    this.observableSubscription.unsubscribe();
  }
  /* END: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */

  /* START: NON-API Function Calls-------------------------------------------------------------- */
  validateNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  validateDecimalNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) ||
      (charCode == 46 && e.target.value.indexOf('.') !== -1)
    ) {
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
    if (this.farmerId) {
      localStorage.setItem(
        'edit-crop-market-planing',
        JSON.stringify(this.cropMarketPlanForm.value)
      );
    } else {
      localStorage.setItem(
        'crop-market-planing',
        JSON.stringify(this.cropMarketPlanForm.value)
      );
    }
    const url = `/add/${this.nextRoute}/${this.farmerId}`;
    this.router.navigate([url]);
  }
  /* END: NON-API Function Calls-------------------------------------------------------------- */
}
