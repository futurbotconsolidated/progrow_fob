import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';

import { debounceTime, of, switchMap, tap } from 'rxjs';
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
  addressProofType,
  propertyType,
} from '../../shared/modal/global-field-values';
import { AddFarmerService } from '../add-farmer.service';

enum SaveStatus {
  Saving = 'Saving...',
  Saved = 'Saved.',
  Idle = '',
}

function sleep(ms: number): Promise<any> {
  return new Promise((res) => setTimeout(res, ms));
}

@Component({
  selector: 'app-demographic-info',
  templateUrl: './demographic-info.component.html',
  styleUrls: ['./demographic-info.component.css'],
})
export class DemographicInfoComponent implements OnInit {
  isSubmitted = false;

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
  addressProofList: any = [];
  propertyTypeList: any = [];

  pinCodeAPIData: any = [];

  familyMembers!: FormArray;
  propertyOwnership!: FormArray;
  demographicInfoForm: FormGroup;

  nextRoute: any;
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle =
    SaveStatus.Idle;

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService
  ) {
    this.demographicInfoForm = this.formBuilder.group({
      addressProof: new FormControl('', [Validators.required]),
      firstName: new FormControl('', [Validators.required]),
      PANnumber: new FormControl(''),
      middleName: new FormControl(''),
      lastName: new FormControl('', [Validators.required]),
      dob: new FormControl(''),
      gender: new FormControl('male'),
      religion: new FormControl('hindu'),
      caste: new FormControl('sc'),
      educationQualification: new FormControl(''),
      occupation: new FormControl(''),
      annualIncome: new FormControl(''),
      address1: new FormControl(''),
      address2: new FormControl(''),
      taluk: new FormControl('', [Validators.required]),
      city: new FormControl('', [Validators.required]),
      pinCode: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ]),
      state: new FormControl('', [Validators.required]),
      landmark: new FormControl(''),
      phoneNumber: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
      ]),
      mobile1: new FormControl('', [Validators.pattern('^[0-9]*$')]), //
      mobile2: new FormControl(''),
      yrsInAddress: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      yrsInCity: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      email: new FormControl('', [Validators.email]),
      propertyStatus: new FormControl('own'),
      monthlyRent: new FormControl(''),
      commOrPerAddress: new FormControl('same_above', [Validators.required]),
      familyMembers: new FormArray([this.createFamilyMembers()]),
      propertyOwnership: new FormArray([this.createPropertyOwnership()]),
      phoneType: new FormControl('feature_phone'),
      phoneOperating: new FormControl('i_check_mostly'),
      cultivationAdvice: [Array()],
      adviceMedium: [Array()],
      sourceOfIncome: [Array()],
      agriculturalInterest: new FormControl('very_much_interested'),
      innovativeWaysFarming: [Array()],
    });
  }

  ngOnInit(): void {
    this.addressProofList = addressProofType;
    this.propertyTypeList = propertyType;
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
    // ----------------------- auto save --------------------
    // this.demographicInfoForm.valueChanges
    //   .pipe(
    //     tap(() => {
    //       this.saveStatus = SaveStatus.Saving;
    //     })
    //   )
    //   .subscribe(async (value) => {
    //     console.log(value);
    //     this.saveStatus = SaveStatus.Saved;
    //     await sleep(2000);
    //     if (this.saveStatus === SaveStatus.Saved) {
    //       this.saveStatus = SaveStatus.Idle;
    //     }
    //   });

    let demoInfo: any = localStorage.getItem('demographic-info-form');
    if (demoInfo) {
      demoInfo = JSON.parse(demoInfo);
      this.demographicInfoForm.patchValue(demoInfo);
      console.log(demoInfo);

      // this.familyMembers = this.demographicInfoForm.get(
      //   'familyMembers'
      // ) as FormArray;
      // demoInfo.familyMembers.forEach((x: any) => {
      //   this.familyMembers.push(this.formBuilder.group(x));
      // });
    }
  }
  ngAfterViewInit(): void {
    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.validateAndNext();
    });
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.demographicInfoForm.controls;
  }
  createPropertyOwnership(): FormGroup {
    return this.formBuilder.group({
      propertyType: new FormControl(''),
      propertyPic: new FormControl(''),
      ownershipType: new FormControl(''),
      particular: new FormControl(''),
      cumulativeValue: new FormControl(''),
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
      name: new FormControl(''),
      relation: new FormControl(''),
      education: new FormControl(''),
      occupation: new FormControl(''),
      dependency: new FormControl(''),
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
  getPinCodeData(event: any) {
    // clear values
    this.demographicInfoForm.patchValue({
      city: '',
      state: '',
    });
    this.pinCodeAPIData.length = 0;

    // check length and proceed
    if (event && event.target.value.trim().length == 6) {
      this.spinner.show();
      this.commonService.getPinCodeData(event.target.value.trim()).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res && res[0].Status != 'Success') {
            alert('Failed to fetch PinCode Details, please try again...');
          } else {
            this.pinCodeAPIData = res[0].PostOffice;

            this.demographicInfoForm.patchValue({
              city: this.pinCodeAPIData[0].District,
              state: this.pinCodeAPIData[0].State,
            });
          }
        },
        (error: any) => {
          this.spinner.hide();
          alert('Failed to fetch PinCode Details, please try againn...');
        }
      );
    }
  }

  validateAndNext() {
    this.isSubmitted = true;
    if (this.demographicInfoForm.invalid) {
      const invalid = [];
      const controls = this.demographicInfoForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }
      // this.toastr.error(
      //   `please enter values for ${invalid.join(',')}`,
      //   'Error!'
      // );

      this.toastr.error('please enter values for required fields', 'Error!');
    } else {
      let formValue = this.demographicInfoForm.value;
      let obj = {
        profileImg: 'imgUrl',
        identityProof: {
          panNumber: this.demographicInfoForm.value.PANnumber,
          panImg: 'imgUrl',
        },
        addressProof: {
          selectedIdProof: this.demographicInfoForm.value.addressProof,
          selectedIdProofFrontImg: 'imgUrl',
          selectedIdProofBackImg: 'imgUrl',
        },
        farmerDetails: {
          firstName: this.demographicInfoForm.value.firstName,
          middleName: this.demographicInfoForm.value.middleName,
          lastName: this.demographicInfoForm.value.lastName,
          dob: this.demographicInfoForm.value.dob,
        },
        address: {
          addressLine1: this.demographicInfoForm.value.address1,
          addressLine2: this.demographicInfoForm.value.address2,
          pincode: this.demographicInfoForm.value.pinCode,
          mobileNumber: this.demographicInfoForm.value.phoneNumber,
        },
        otherDetails: {
          educationalQualification:
            this.demographicInfoForm.value.educationalQualification,
          occupation: this.demographicInfoForm.value.occupation,
          fpoName: this.demographicInfoForm.value.annualIncome,
        },
        familyMembers: this.demographicInfoForm.value.familyMembers,
        propertyOwnership: this.demographicInfoForm.value.propertyOwnership,
        phoneType: this.demographicInfoForm.value.phoneType,
        phoneUsedBy: this.demographicInfoForm.value.phoneOperating,
        cultivationAdvice: this.demographicInfoForm.value.cultivationAdvice,
        adviceMedium: this.demographicInfoForm.value.adviceMedium,
        sourceOfIncome: this.demographicInfoForm.value.sourceOfIncome,
        agricultureChildrenInterested:
          this.demographicInfoForm.value.agriculturalInterest,
        innovativeFarmingWays:
          this.demographicInfoForm.value.innovativeWaysFarming,
      };
      console.log(obj);
      localStorage.setItem('demographic-info', JSON.stringify(obj));
      localStorage.setItem('demographic-info-form', JSON.stringify(formValue));

      let url = `/add/${this.nextRoute}`;
      this.router.navigate([url]);
    }
  }
}
