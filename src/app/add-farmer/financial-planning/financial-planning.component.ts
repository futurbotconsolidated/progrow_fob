import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  cropLoanProduct,
  crops,
  availKCCLoan,
  houseLoan,
} from '../../shared/modal/global-field-values';
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
export class FinancialPlanningComponent implements OnInit {
  cropLoanProductList: any = [];
  loanReqPlaned!: FormArray;
  bankDetails!: FormArray;
  nextRoute: any;
  cropsList = <any>[];
  kccLoanList = <any>[];
  houseLoanList = <any>[];
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle = SaveStatus.Idle;

  financialForm = new FormGroup({});

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.financialForm = this.formBuilder.group({
      loanReqPlaned: new FormArray([]),
      ownerType: new FormControl([]),
      bankDetails: new FormArray([this.createBankDetails()]),
      availKccLoan: new FormControl('', [Validators.required]), //radio creditedAmount
      creditedAmount: new FormControl('', [Validators.required]),
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }

  ngOnInit(): void {
    this.cropLoanProductList = cropLoanProduct;
    this.cropsList = crops;
    this.kccLoanList = availKCCLoan;
    this.houseLoanList = houseLoan;

    // -----------------------start auto save --------------------
    this.financialForm.valueChanges
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
      draft_farmer_new['financial_planing'] = form_values;
      localStorage.setItem('draft_farmer_new', JSON.stringify(draft_farmer_new));
      this.saveStatus = SaveStatus.Saved;
      if (this.saveStatus === SaveStatus.Saved) {
        this.saveStatus = SaveStatus.Idle;
      }
    });
    // -----------------------End auto save --------------------
    let finPlan: any = localStorage.getItem('financial-planing');
    if (finPlan) {
      finPlan = JSON.parse(finPlan);
      this.financialForm.patchValue(finPlan);
      console.log(finPlan);
    }

    let fieldInfo: any = localStorage.getItem('field-info');
    if (fieldInfo) {
      fieldInfo = JSON.parse(fieldInfo);
      fieldInfo.forEach((element: any) => {
        this.addLoanReqPlaned();
      });
    }
  }

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

  ngAfterContentInit() {}

  createLoanReqPlaned(): FormGroup {
    return this.formBuilder.group({
      fieldId: new FormControl('', [Validators.required]),
      cropLoanProduct: new FormControl('', [Validators.required]),
      plannedCultivationArea: new FormControl('', [Validators.required]),
      hectares: new FormControl('', [Validators.required]),
      crop: new FormControl('', [Validators.required]),
    });
  }

  getLoanReqPlanedControls() {
    return (this.financialForm.get('loanReqPlaned') as FormArray).controls;
  }

  addLoanReqPlaned(): void {
    this.loanReqPlaned = this.financialForm.get('loanReqPlaned') as FormArray;
    this.loanReqPlaned.push(this.createLoanReqPlaned());
  }

  removeLoanReqPlaned(index: any) {
    this.loanReqPlaned.removeAt(index);
  }

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

  saveData() {
    let url = `/add/${this.nextRoute}`;
    console.log(url);
    localStorage.setItem(
      'financial-planing',
      JSON.stringify(this.financialForm.value)
    );
    this.router.navigate([url]);
  }
}
