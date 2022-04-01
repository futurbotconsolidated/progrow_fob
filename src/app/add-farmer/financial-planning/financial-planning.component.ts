import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { data } from '../../shared/fob_master_data';
import { AddFarmerService } from '../add-farmer.service';
enum SaveStatus {
  Saving = 'Saving...',
  Saved = 'Saved.',
  Idle = '',
}

@Component({
  selector: 'app-financial-planning',
  templateUrl: './financial-planning.component.html',
  styleUrls: ['./financial-planning.component.css'],
})
export class FinancialPlanningComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  /* START: Variables ---------------------------------------------*/
  private observableSubscription: any;

  loanReqPlaned!: FormArray;
  bankDetails!: FormArray;
  insuranceDetails!: FormArray;
  nextRoute: any;

  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle =
    SaveStatus.Idle;

  financialForm = new FormGroup({});
  financialMaster = <any>{};
  commonMaster = <any>{};
  interestedFRCMLoanProductsArray = {
    thead: ['Yes', 'No', 'May Be'],
    tbody: [
      { formControlName: 'housingLoan', displayLabel: 'Housing Loan' },
      {
        formControlName: 'tractorFinanceLoan',
        displayLabel: 'Tractor Finance Loan',
      },
      {
        formControlName: 'FRCMCropInsurance',
        displayLabel: 'FRCM Crop Insurance',
      },
      { formControlName: 'personalLoan', displayLabel: 'Personal Loan' },
    ],
  };

  preferredCreditSourceRankOrderArray = [
    'Commission Agent/ Arhatiya',
    'Family/Friends',
    'Input Supplier',
    'Local Sahookar',
    'Gold Loan',
  ];

  farmerId = ''; // edit feature
  /* END: Variables ---------------------------------------------*/

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.financialForm = this.formBuilder.group({
      loanReqPlaned: new FormArray([]),

      interestedFRCMLoanProductsComment: new FormControl(''),
      housingLoan: new FormControl(''),
      tractorFinanceLoan: new FormControl(''),
      FRCMCropInsurance: new FormControl(''),
      personalLoan: new FormControl(''),

      cultivationCost: new FormGroup({
        seedPlanned1: new FormControl(''),
        seedPlanned2: new FormControl(''),
        seedHistorical: new FormControl(''),

        labourPlanned1: new FormControl(''),
        labourPlanned2: new FormControl(''),
        labourHistorical: new FormControl(''),

        farmElectricityPlanned1: new FormControl(''),
        farmElectricityPlanned2: new FormControl(''),
        farmElectricityHistorical: new FormControl(''),

        machineryPlanned1: new FormControl(''),
        machineryPlanned2: new FormControl(''),
        machineryHistorical: new FormControl(''),
      }),

      groceryExpense: new FormControl(''),
      medicalExpense: new FormControl(''),
      educationExpense: new FormControl(''),
      rentalExpense: new FormControl(''),
      electricityExpense: new FormControl(''),
      interestExpense: new FormControl(''),
      otherExpense: new FormControl(''),

      KCCLoanBank: new FormControl(''),
      KCCLoanBankOther: new FormControl(''),
      KCCLoanCreditedAmount: new FormControl(''),
      KCCLoanDisbursementDate: new FormControl(''),
      KCCLoanRepaymentAmount: new FormControl(''),
      KCCLoanRepaymentDate: new FormControl(''),
      loanLandSize: new FormControl(''),

      takenOtherLoan: new FormControl(''),
      otherLoanBank: new FormControl(''),
      otherLoanCreditedAmount: new FormControl(''),
      otherLoanDisbursementDate: new FormControl(''),
      otherLoanRepaymentAmount: new FormControl(''),
      otherLoanRepaymentDate: new FormControl(''),

      PMFBYAmountPaid: new FormControl(''),
      PMFBYPaymentDate: new FormControl(''),

      insuranceDetails: new FormArray([this.createInsuranceDetails()]),

      preferredCreditSourceRankOrder: new FormControl([]),
      commissionAgentROICharge: new FormControl(''),
      familyROICharge: new FormControl(''),
      inputSupplierROICharge: new FormControl(''),
      localSahookarROICharge: new FormControl(''),
      goldLoanROICharge: new FormControl(''),
      commissionAgentLoanAmount: new FormControl(''),
      familyLoanAmount: new FormControl(''),
      inputSupplierLoanAmount: new FormControl(''),
      localSahookarLoanAmount: new FormControl(''),
      goldLoanLoanAmount: new FormControl(''),

      reasonAgent: new FormControl([]),
      pledgedCollateral: new FormControl([]),
      pledgedCollateralOther: new FormControl(''),
      availedFarmLoanWaiver: new FormControl(''),
      availedFarmLoanWaiverOther: new FormControl(''),
      ownTractor: new FormControl(''),
      farmMachinery: new FormControl([]),
      bankDetails: new FormArray([this.createBankDetails()]),
    });

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }

  /* START: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */
  ngOnInit(): void {
    this.financialMaster = data.financialPlan; // read master data
    this.commonMaster = data.commonData; // read master data

    // -----------------------start auto save --------------------
    // draft feature is not required in edit operation
    if (!this.farmerId) {
      this.financialForm.valueChanges
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
          draft_farmer_new['financial_planing'] = form_values;
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
      var financial_planning = {} as any;
      let editForm: any = localStorage.getItem('edit-financial-planing');
      if (editForm) {
        financial_planning = JSON.parse(editForm);
        this.financialForm.patchValue(financial_planning);
        this.editDynamicBindFormArray(financial_planning.bankDetails);
      } else {
        const farmer_details: any = localStorage.getItem('farmer-details');
        if (farmer_details) {
          financial_planning = JSON.parse(farmer_details).financial_planning;
          this.financialForm.patchValue(financial_planning);
          this.editDynamicBindFormArray(financial_planning.bankDetails);
        }
      }      
      let fieldInfo: any = localStorage.getItem('edit-field-info');
      if (fieldInfo) {
        fieldInfo = JSON.parse(fieldInfo);
        fieldInfo.forEach((field_el: any, findex: number) => {
          var field_data = {} as any;
          field_data.fieldId = field_el.field_ui_id;
          field_data.cropLoanProduct = '';
          field_data.plannedCultivationArea = '';
          field_data.hectares = ''; 
          field_data.crop = '';
          if(financial_planning.loanReqPlaned.length){
            financial_planning.loanReqPlaned.forEach((fp_load_el: any, fpl_index: number) => {
              if(field_el.field_ui_id == fp_load_el.fieldId ){
                field_data.cropLoanProduct = fp_load_el.cropLoanProduct;
                field_data.plannedCultivationArea = fp_load_el.plannedCultivationArea;
                field_data.hectares = fp_load_el.hectares;
                field_data.crop = fp_load_el.crop;
              }
            });
            if(field_data.cropLoanProduct == '' &&
            field_data.plannedCultivationArea == '' &&
            field_data.hectares == '' &&
            field_data.crop == '' && financial_planning.loanReqPlaned[findex]){
              field_data.cropLoanProduct = financial_planning.loanReqPlaned[findex].cropLoanProduct;
              field_data.plannedCultivationArea = financial_planning.loanReqPlaned[findex].plannedCultivationArea;
              field_data.hectares = financial_planning.loanReqPlaned[findex].hectares;
              field_data.crop = financial_planning.loanReqPlaned[findex].crop;
            }
          }
          this.addLoanReqPlaned(field_data);
        });
      }      
    } else {
      let finPlan: any = localStorage.getItem('financial-planing');
      if (finPlan) {
        finPlan = JSON.parse(finPlan);
        this.financialForm.patchValue(finPlan);
      }

      let fieldInfo: any = localStorage.getItem('field-info');
      if (fieldInfo) {
        fieldInfo = JSON.parse(fieldInfo);
        fieldInfo.forEach((field_el: any) => {
          var field_data = {} as any;
          field_data.fieldId = field_el.field_ui_id;  
          field_data.cropLoanProduct = '';     
          field_data.plannedCultivationArea = '';     
          field_data.hectares = '';     
          field_data.crop = '';   
          this.addLoanReqPlaned(field_data);
        });
      }
    }
  }

  ngAfterViewInit(): void {
    /** subscribe to Observables, which are triggered from header selections*/
    this.observableSubscription = this.addFarmerService
      .getMessage()
      .subscribe((data) => {
        this.nextRoute = data.routeName;
        if (this.router.url?.includes('/add/financial-planning')) {
          this.saveData();
          console.log(data.routeName);
        }
      });
  }

  ngOnDestroy(): void {
    /** unsubscribe from Observables*/
    this.observableSubscription.unsubscribe();
  }
  /* END: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */
  /* START: NON-API Function Calls-------------------------------------------------------------- */

  numbersOnlyValidator(event: any) {
    const pattern = /^[0-9\-]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9\-]/g, '');
    }
  }

  validateNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /* START: Add Dynamic crop loan requirement  :FormArray */
  createLoanReqPlaned(field_data: any): FormGroup {
    return this.formBuilder.group({
      fieldId: new FormControl(field_data.fieldId, [Validators.required]),
      cropLoanProduct: new FormControl(field_data.cropLoanProduct, [Validators.required]),
      plannedCultivationArea: new FormControl(field_data.plannedCultivationArea, [Validators.required]),
      hectares: new FormControl(field_data.hectares, [Validators.required]),
      crop: new FormControl(field_data.crop, [Validators.required]),
    });
  }

  getLoanReqPlanedControls() {
    return (this.financialForm.get('loanReqPlaned') as FormArray).controls;
  }

  addLoanReqPlaned(field_data: any): void {
    this.loanReqPlaned = this.financialForm.get('loanReqPlaned') as FormArray;
    this.loanReqPlaned.push(this.createLoanReqPlaned(field_data));
  }

  removeLoanReqPlaned(index: any) {
    this.loanReqPlaned.removeAt(index);
  }
  /* END: Add Dynamic crop loan requirement  :FormArray */

  /* START: Add Dynamic Bank Details: FormArray */
  createBankDetails(): FormGroup {
    return this.formBuilder.group({
      bankName: new FormControl('', [Validators.required]),
      accountNum: new FormControl('', [Validators.required]),
      IFSCode: new FormControl('', [Validators.required]),
      customerID: new FormControl('', [Validators.required]),
    });
  }

  getBankDetailsControls() {
    return (this.financialForm.get('bankDetails') as FormArray).controls;
  }

  addBankDetails(): void {
    this.bankDetails = this.financialForm.get('bankDetails') as FormArray;
    this.bankDetails.push(this.createBankDetails());
  }

  removeBankDetails(index: any) {
    this.bankDetails.removeAt(index);
  }

  editDynamicBindFormArray(dataArray: any) {
    this.bankDetails = this.financialForm.get('bankDetails') as FormArray;

    if (Array.isArray(dataArray) && dataArray.length) {
      dataArray.forEach((x: any) => {
        this.bankDetails.push(
          this.formBuilder.group({
            bankName: new FormControl(x.bankName),
            accountNum: new FormControl(x.accountNum),
            IFSCode: new FormControl(x.IFSCode),
            customerID: new FormControl(x.customerID),
          })
        );
      });
    }
  }
  /* END: Add Dynamic Bank Details: FormArray */

  /* START: Add Dynamic Insurance Details: FormArray */
  createInsuranceDetails(): FormGroup {
    return this.formBuilder.group({
      insuranceType: new FormControl(''),
      monthYearTaken: new FormControl(''),
      premiumPaid: new FormControl(''),
      isSettlementAmountCredited: new FormControl(''),
      isDisbursementSatisfied: new FormControl(''),
    });
  }

  getInsuranceDetailsControls() {
    return (this.financialForm.get('insuranceDetails') as FormArray).controls;
  }

  addInsuranceDetails(): void {
    this.insuranceDetails = this.financialForm.get(
      'insuranceDetails'
    ) as FormArray;
    this.insuranceDetails.push(this.createInsuranceDetails());
  }

  removeInsuranceDetails(index: any) {
    this.insuranceDetails.removeAt(index);
  }
  /* END: Add Dynamic Insurance Details: FormArray */

  selectCheckboxArray(event: any, formCtlName: any, formVal: any) {
    formVal = String(formVal);
    let aryValCurr = this.financialForm.controls[formCtlName].value;
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
    this.financialForm.get(formCtlName).setValue(aryValNew);
    if (this.financialForm.controls[formCtlName].pristine) {
      // @ts-ignore: Object is possibly 'null'.
      this.financialForm.get(formCtlName).markAsDirty();
    }
  }

  saveData() {
    if (this.farmerId) {
      localStorage.setItem(
        'edit-financial-planing',
        JSON.stringify(this.financialForm.value)
      );
    } else {
      localStorage.setItem(
        'financial-planing',
        JSON.stringify(this.financialForm.value)
      );
    }
    const url = `/add/${this.nextRoute}/${this.farmerId}`;
    this.router.navigate([url]);
  }
  /* END: NON-API Function Calls-------------------------------------------------------------- */
}
