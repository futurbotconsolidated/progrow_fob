import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import {
  religion,
  gender,
  caste,
  propertyStatus,
  commOrPerAddress,
  relation,
  education,
  occupation,
  dependency,
  ownerShipType,
  particular,
  phoneType,
  phoneOperating,
  agriculturalInterest,
  cultivationAdvice,
  adviceMedium,
  sourceOfIncome,
  innovativeWaysFarming,
} from '../../shared/modal/global-field-values';
import { AddFarmerService } from '../add-farmer.service';

@Component({
  selector: 'app-demographic-info',
  templateUrl: './demographic-info.component.html',
  styleUrls: ['./demographic-info.component.css'],
})
export class DemographicInfoComponent implements OnInit {
  religionList = <any>[];
  genderList = <any>[];
  casteList = <any>[];
  propertyStatusList = <any>[];
  addressStatusList = <any>[];
  relationList = <any>[];
  educationList = <any>[];
  occupationList = <any>[];
  dependencyList = <any>[];
  ownershipTypeList = <any>[];
  particularList = <any>[];
  phoneTypeList = <any>[];
  phoneOperatingList = <any>[];
  agriculturalInterestList = <any>[];
  cultivationAdviceList = <any>[];
  adviceMediumList = <any>[];
  sourceOfIncomeList = <any>[];
  innovativeWaysFarmingList = <any>[];

  familyMembers!: FormArray;
  propertyOwnership!: FormArray;
  demographicInfoForm: FormGroup;

  nextRoute: any;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService
  ) {
    this.demographicInfoForm = this.formBuilder.group({
      firstName: new FormControl('', [Validators.required]),
      PANnumber: new FormControl('', [Validators.required]),
      middleName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      dob: new FormControl('', [Validators.required]),
      gender: new FormControl('male', [Validators.required]),
      religion: new FormControl('hindu', [Validators.required]),
      caste: new FormControl('sc', [Validators.required]),
      educationQualification: new FormControl('', [Validators.required]),
      occupation: new FormControl('', [Validators.required]),
      annualIncome: new FormControl('', [Validators.required]),
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
      propertyStatus: new FormControl('own', [Validators.required]),
      monthlyRent: new FormControl('', [Validators.required]),
      commOrPerAddress: new FormControl('same_above', [Validators.required]),
      familyMembers: new FormArray([this.createFamilyMembers()]),
      propertyOwnership: new FormArray([this.createPropertyOwnership()]),
      phoneType: new FormControl('feature_phone', [Validators.required]),
      phoneOperating: new FormControl('i_check_mostly', [Validators.required]),
      cultivationAdvice: [Array()],
      adviceMedium: [Array()],
      sourceOfIncome: [Array()],
      agriculturalInterest: new FormControl('very_much_interested', [
        Validators.required,
      ]),
      innovativeWaysFarming: [Array()],
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.validateAndNext();
      console.log(this.nextRoute);
    });
  }

  ngOnInit(): void {
    this.religionList = religion;
    this.genderList = gender;
    this.casteList = caste;
    this.propertyStatusList = propertyStatus;
    this.addressStatusList = commOrPerAddress;
    this.relationList = relation;
    this.occupationList = occupation;
    this.educationList = education;
    this.dependencyList = dependency;
    this.ownershipTypeList = ownerShipType;
    this.particularList = particular;
    this.phoneTypeList = phoneType;
    this.phoneOperatingList = phoneOperating;
    this.cultivationAdviceList = cultivationAdvice;
    this.adviceMediumList = adviceMedium;
    this.sourceOfIncomeList = sourceOfIncome;
    this.agriculturalInterestList = agriculturalInterest;
    this.innovativeWaysFarmingList = innovativeWaysFarming;
  }
  createPropertyOwnership(): FormGroup {
    return this.formBuilder.group({
      propertyType: new FormControl('', [Validators.required]),
      propertyPic: new FormControl('Relation', [Validators.required]),
      ownershipType: new FormControl('Education', [Validators.required]),
      particular: new FormControl('Occupation', [Validators.required]),
      cumulativeValue: new FormControl('Dependency', [Validators.required]),
    });
  }

  getPropertyOwnershipControls() {
    return (this.demographicInfoForm.get('propertyOwnership') as FormArray)
      .controls;
  }

  addPropertyOwnership(): void {
    this.propertyOwnership = this.demographicInfoForm.get(
      'propertyOwnership'
    ) as FormArray;
    this.propertyOwnership.push(this.createPropertyOwnership());
  }

  removePropertyOwnership(index: any) {
    this.propertyOwnership.removeAt(index);
  }

  createFamilyMembers(): FormGroup {
    return this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      relation: new FormControl('Relation', [Validators.required]),
      education: new FormControl('Education', [Validators.required]),
      occupation: new FormControl('Occupation', [Validators.required]),
      dependency: new FormControl('Dependency', [Validators.required]),
    });
  }

  getFamilyMembersControls() {
    return (this.demographicInfoForm.get('familyMembers') as FormArray)
      .controls;
  }

  addFamilyMembers(): void {
    this.familyMembers = this.demographicInfoForm.get(
      'familyMembers'
    ) as FormArray;
    this.familyMembers.push(this.createFamilyMembers());
  }

  removeFamilyMembers(index: any) {
    this.familyMembers.removeAt(index);
  }

  selectCultivationAdvice(event: any, formCtlName: any, formVal: any) {
    formVal = String(formVal);
    let aryValCurr = this.demographicInfoForm.controls[formCtlName].value;
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
    this.demographicInfoForm.get(formCtlName).setValue(aryValNew);
    if (this.demographicInfoForm.controls[formCtlName].pristine) {
      // @ts-ignore: Object is possibly 'null'.
      this.demographicInfoForm.get(formCtlName).markAsDirty();
    }
  }

  validateAndNext() {
    console.log('called');
    this.router.navigate([this.nextRoute]);
  }

  onSubmit() {
    console.log(this.demographicInfoForm.value);
  }
}
