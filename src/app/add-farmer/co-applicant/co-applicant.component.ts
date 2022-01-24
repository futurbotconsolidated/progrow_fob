import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AddFarmerService } from '../add-farmer.service';
import {
  gender,
  addressProofType,
  religion,
  caste,
  ownerShipType,
  particular,
} from '../../shared/modal/global-field-values';
@Component({
  selector: 'app-co-applicant',
  templateUrl: './co-applicant.component.html',
  styleUrls: ['./co-applicant.component.css'],
})
export class CoApplicantComponent implements OnInit {
  nextRoute: any;
  addressProofList: any = [];
  genderList: any = [];
  religionList: any = [];
  casteList: any = [];
  ownershipTypeList: any = [];
  particularList: any = [];

  propertyOwnership!: FormArray;

  coApplicantForm = this.formBuilder.group({
    PANnumber: new FormControl('', [Validators.required]),
    addressProof: new FormControl('voter_id', [Validators.required]),
    passport: new FormControl('', [Validators.required]),
    nrega: new FormControl('', [Validators.required]),
    salutation: new FormControl('', [Validators.required]),
    fname: new FormControl('', [Validators.required]),
    mname: new FormControl('', [Validators.required]),
    lname: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
    gender: new FormControl('male', [Validators.required]),
    religion: new FormControl('hindu', [Validators.required]),
    address1: new FormControl('', [Validators.required]),
    address2: new FormControl('', [Validators.required]),
    taluk: new FormControl('', [Validators.required]),
    city: new FormControl('', [Validators.required]),
    pinCode: new FormControl('', [Validators.required]),
    state: new FormControl('', [Validators.required]),
    landmark: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
    mobile1: new FormControl('', [Validators.required]),
    mobile2: new FormControl('', [Validators.required]),
    yrsInAddress: new FormControl('', [Validators.required]),
    yrsInCity: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    propertyOwnership: new FormArray([this.createPropertyOwnership()]),
    educationQualification: new FormControl('', [Validators.required]),
    occupation: new FormControl('', [Validators.required]),
    annualIncome: new FormControl('', [Validators.required]),
    caste: new FormControl('sc', [Validators.required]),
  });

  constructor(
    private addFarmerService: AddFarmerService,
    private formBuilder: FormBuilder,
    public router: Router
  ) {
    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }

  ngOnInit(): void {
    this.addressProofList = addressProofType;
    this.genderList = gender;
    this.religionList = religion;
    this.casteList = caste;
    this.ownershipTypeList = ownerShipType;
    this.particularList = particular;

    let coApp: any = localStorage.getItem('co-applicant');
    if (coApp) {
      coApp = JSON.parse(coApp);
      this.coApplicantForm.patchValue(coApp);
      console.log(coApp);
    }
  }

  createPropertyOwnership(): FormGroup {
    return this.formBuilder.group({
      propertyType: new FormControl('', [Validators.required]),
      propertyPic: new FormControl('', [Validators.required]),
      ownershipType: new FormControl('', [Validators.required]),
      particular: new FormControl('', [Validators.required]),
      cumulativeValue: new FormControl('', [Validators.required]),
    });
  }

  getPropertyOwnershipControls() {
    return (this.coApplicantForm.get('propertyOwnership') as FormArray)
      .controls;
  }

  addPropertyOwnership(): void {
    this.propertyOwnership = this.coApplicantForm.get(
      'propertyOwnership'
    ) as FormArray;
    this.propertyOwnership.push(this.createPropertyOwnership());
  }

  removePropertyOwnership(index: any) {
    this.propertyOwnership.removeAt(index);
  }

  saveData() {
    let url = `/add/${this.nextRoute}`;
    console.log(url);
    localStorage.setItem(
      'co-applicant',
      JSON.stringify(this.coApplicantForm.value)
    );
    this.router.navigate([url]);
  }
}
