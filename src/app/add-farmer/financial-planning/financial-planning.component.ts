import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { cropLoanProduct } from '../../shared/modal/global-field-values';
import { AddFarmerService } from '../add-farmer.service';
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

  financialForm = new FormGroup({});

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.financialForm = this.formBuilder.group({
      loanReqPlaned: new FormArray([]),
      bankDetails: new FormArray([this.createBankDetails()]),
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }

  ngOnInit(): void {
    this.cropLoanProductList = cropLoanProduct;
  }

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
