import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs/operators';
import { CommonService } from '../../shared/common.service';
import { ActivatedRoute } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { validatePANNumber } from '../../shared/custom-validators';
import { data } from '../../shared/fob_master_data';
declare var $: any;
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
  /* START: Varaibles */
  demoGraphicMaster = <any>{};
  isSubmitted = false;
  fileUpload = {
    fileFor: '',
    popupTitle: '',
    new: {
      imageSrc1: '',
      imageSrc2: '',
      isImage1Required: true,
      isImage2Required: false,
    },
    imageHeading1: 'Front Image',
    imageHeading2: 'Back Image',
  } as any;

  pinCodeAPIData: any = [];
  permPinCodeAPIData: any = [];

  familyMembers!: FormArray;
  propertyOwnership!: FormArray;
  demographicInfoForm: FormGroup;

  nextRoute: any;
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle =
    SaveStatus.Idle;

  // edit feature
  farmerId = '';

  /* END: Varaibles */

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute
  ) {
    // create form group
    this.demographicInfoForm = this.formBuilder.group({
      profileImg: new FormControl(''),
      addressProof: new FormControl('', [Validators.required]),
      addressProofFrontImage: new FormControl(''),
      addressProofBackImage: new FormControl(''),
      salutation: new FormControl(''),
      firstName: new FormControl('', [Validators.required]),
      PANnumber: new FormControl('', [validatePANNumber]),
      PANFrontImage: new FormControl(''),
      passportNumber: new FormControl(''),
      passportFrontImage: new FormControl(''),
      passportBackImage: new FormControl(''),
      NREGANumber: new FormControl(''),
      NREGAFrontImage: new FormControl(''),
      NREGABackImage: new FormControl(''),
      middleName: new FormControl(''),
      lastName: new FormControl('', [Validators.required]),
      dob: new FormControl(''),
      gender: new FormControl(''),
      religion: new FormControl(''),
      caste: new FormControl(''),
      educationalQualification: new FormControl(''),
      occupation: new FormControl(''),
      annualIncome: new FormControl('', [Validators.pattern('^[0-9]*$')]),

      address1: new FormControl('', [Validators.required]),
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
        Validators.minLength(10),
      ]),
      mobile1: new FormControl('', [
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10),
      ]),
      mobile2: new FormControl('', [
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(10),
      ]),
      yrsInAddress: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      yrsInCity: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      email: new FormControl('', [Validators.email]),

      permAddressLine1: new FormControl(''),
      permAddressLine2: new FormControl(''),
      permTaluk: new FormControl(''),
      permCity: new FormControl(''),
      permPincode: new FormControl(''),
      permState: new FormControl(''),

      propertyStatus: new FormControl(''),
      monthlyRent: new FormControl(''),
      commOrPerAddress: new FormControl('', [Validators.required]),
      familyMembers: new FormArray([this.createFamilyMembers()]),
      propertyOwnership: new FormArray([this.createPropertyOwnership()]),
      phoneType: new FormControl(''),
      phoneOperating: new FormControl(''),
      cultivationAdvice: [Array()],
      cultivationAdviceOther: new FormControl(''),
      adviceMedium: [Array()],
      adviceMediumOther: new FormControl(''),
      sourceOfIncome: [Array()],
      sourceOfIncomeOther: new FormControl(''),
      agriculturalInterest: new FormControl(''),
      innovativeWaysFarming: [Array()],
    });

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }

  /* START: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */
  ngOnInit(): void {
    this.demoGraphicMaster = data.demoGraphic; // read master data

    // ----------------------- Start auto save --------------------
    // draft feature is not required in edit operation
    if (!this.farmerId) {
      this.demographicInfoForm.valueChanges
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
          draft_farmer_new['demographic_info_form'] = form_values;
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
    // ----------------------- End auto save --------------------

    //  first check data exist - edit form
    if (this.farmerId) {
      let editForm: any = localStorage.getItem('edit-demographic-info-form');
      if (editForm) {
        editForm = JSON.parse(editForm);
        this.demographicInfoForm.patchValue(editForm);
      } else {
        this.patchFarmerDetails(); // bind/patch fresh api data
      }
    } else {
      let demoInfo: any = localStorage.getItem('demographic-info-form');
      if (demoInfo) {
        demoInfo = JSON.parse(demoInfo);
        this.demographicInfoForm.patchValue(demoInfo);

        // this.familyMembers = this.demographicInfoForm.get(
        //   'familyMembers'
        // ) as FormArray;
        // demoInfo.familyMembers.forEach((x: any) => {
        //   this.familyMembers.push(this.formBuilder.group(x));
        // });
      }
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
  /* END: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */

  /* START: NON-API Function Calls-------------------------------------------------------------- */
  createPropertyOwnership(): FormGroup {
    return this.formBuilder.group({
      propertyType: new FormControl(''),
      propertyPic: new FormControl(''),
      ownershipType: new FormControl(''),
      particular: new FormControl(''),
      cumulativeValue: new FormControl('', [Validators.pattern('^[0-9]*$')]),
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

  validateNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
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

  openFileModalPopup(type: string) {
    this.fileUpload.fileFor = type;
    this.fileUpload.new.imageSrc1 = '';
    this.fileUpload.new.imageSrc2 = '';
    this.fileUpload.new.isImage1Required = false;
    this.fileUpload.new.isImage2Required = false;
    this.fileUpload.imageHeading1 = 'Front Image';
    this.fileUpload.imageHeading2 = 'Back Image';

    if (type === 'PAN') {
      if (!this.demographicInfoForm.value.PANnumber) {
        this.toastr.error('please enter PAN Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload PAN Card';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.imageSrc1 =
        this.demographicInfoForm.value.PANFrontImage || '';
    } else if (type === 'ADDRESS_PROOF') {
      if (!this.demographicInfoForm.value.addressProof) {
        this.toastr.error('please select Address Proof Type.', 'Error!');
        return;
      }
      const A = this.demoGraphicMaster['addressProofType']
        .filter(
          (x: any) =>
            this.demographicInfoForm.value.addressProof == x.displayValue
        )
        .map((y: any) => {
          return y.displayName;
        });
      this.fileUpload.popupTitle = `Upload ${A || ''} Image`;
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.demographicInfoForm.value.addressProofFrontImage || '';
      this.fileUpload.new.imageSrc2 =
        this.demographicInfoForm.value.addressProofBackImage || '';
    } else if (type === 'PASSPORT') {
      if (!this.demographicInfoForm.value.passportNumber) {
        this.toastr.error('please enter Passport Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Passport';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.demographicInfoForm.value.passportFrontImage || '';
      this.fileUpload.new.imageSrc2 =
        this.demographicInfoForm.value.passportBackImage || '';
    } else if (type === 'NREGA') {
      if (!this.demographicInfoForm.value.NREGANumber) {
        this.toastr.error('please enter NREGA Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload NREGA';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.demographicInfoForm.value.NREGAFrontImage || '';
      this.fileUpload.new.imageSrc2 =
        this.demographicInfoForm.value.NREGABackImage || '';
    } else if (type === 'FARMER_PROFILE') {
      this.fileUpload.popupTitle = 'Upload Farmer Profile';
      this.fileUpload.imageHeading1 = 'Farmer Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.imageSrc1 =
        this.demographicInfoForm.value.profileImg || '';
    }
    $('#fileUploadModalPopup').modal('show');
  }

  onFileChange(event: any, type = '') {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;

      // if (file.size > 300000) {
      //   this.toastr.error('Image size can be upto 300KB Maximum.', 'Error!');
      //   return;
      // }
      if (file.type.split('/')[0] != 'image') {
        this.toastr.error('Only Image files are allowed.', 'Error!');
        return;
      }

      reader.readAsDataURL(file);
      reader.onload = () => {
        const imageSrc = reader.result;

        if (this.fileUpload.fileFor === 'PAN' && type == 'FRONT_IMAGE') {
          this.fileUpload.new.imageSrc1 = imageSrc;
          this.demographicInfoForm.patchValue({
            PANFrontImage: imageSrc,
          });
        } else if (this.fileUpload.fileFor === 'ADDRESS_PROOF') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.demographicInfoForm.patchValue({
              addressProofFrontImage: imageSrc,
            });
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.demographicInfoForm.patchValue({
              addressProofBackImage: imageSrc,
            });
          }
        } else if (this.fileUpload.fileFor === 'PASSPORT') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.demographicInfoForm.patchValue({
              passportFrontImage: imageSrc,
            });
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.demographicInfoForm.patchValue({
              passportBackImage: imageSrc,
            });
          }
        } else if (this.fileUpload.fileFor === 'NREGA') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.demographicInfoForm.patchValue({
              NREGAFrontImage: imageSrc,
            });
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.demographicInfoForm.patchValue({
              NREGABackImage: imageSrc,
            });
          }
        } else if (this.fileUpload.fileFor === 'FARMER_PROFILE') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.demographicInfoForm.patchValue({
              profileImg: imageSrc,
            });
          }
        }
      };
    }
  }
  removeImage(event: any, type: string) {
    if (type == 'FARMER_PROFILE') {
      this.demographicInfoForm.patchValue({
        profileImg: '',
      });
    }
  }

  // setDynamicValidators(event: any, formCtlName: string) {
  //   if (this.f[formCtlName].value === 'different_address') {
  //     this.demographicInfoForm.controls['permAddressLine1'].setValidators([
  //       Validators.required,
  //     ]);
  //     this.demographicInfoForm.controls['permTaluk'].setValidators([
  //       Validators.required,
  //     ]);
  //     this.demographicInfoForm.controls['permCity'].setValidators([
  //       Validators.required,
  //     ]);
  //     this.demographicInfoForm.controls['permPincode'].setValidators([
  //       Validators.required,
  //       Validators.minLength(6),
  //       Validators.maxLength(6),
  //     ]);
  //     this.demographicInfoForm.controls['permState'].setValidators([
  //       Validators.required,
  //     ]);
  //   } else {
  //     this.demographicInfoForm.controls['permAddressLine1'].clearValidators();
  //     this.demographicInfoForm.controls['permTaluk'].clearValidators();
  //     this.demographicInfoForm.controls['permCity'].clearValidators();
  //     this.demographicInfoForm.controls['permPincode'].clearValidators();
  //     this.demographicInfoForm.controls['permState'].clearValidators();
  //   }

  //   // call below function for update the form controls it will be effect immediately on the form controls.
  //   this.demographicInfoForm.controls[
  //     'permAddressLine1'
  //   ].updateValueAndValidity();
  //   this.demographicInfoForm.controls['permTaluk'].updateValueAndValidity();
  //   this.demographicInfoForm.controls['permCity'].updateValueAndValidity();
  //   this.demographicInfoForm.controls['permPincode'].updateValueAndValidity();
  //   this.demographicInfoForm.controls['permState'].updateValueAndValidity();
  //   console.log(
  //     event.target.value,
  //     this.demographicInfoForm.controls[formCtlName].value
  //   );
  //   console.log(this.demographicInfoForm);
  // }

  // patch edit farmer details
  patchFarmerDetails() {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      const B = JSON.parse(A).demographic_info;
      // create form group
      this.demographicInfoForm.patchValue({
        profileImg: B.profileImg,
        addressProof: B.addressProof['selectedIdProof'],
        addressProofFrontImage: B.addressProof['selectedIdProofFrontImg'],
        addressProofBackImage: B.addressProof['selectedIdProofBackImg'],
        salutation: B.farmerDetails['salutation'],
        firstName: B.farmerDetails['firstName'],
        PANnumber: B.identityProof['panNumber'],
        PANFrontImage: B.identityProof['panImg'],

        passportNumber: B.identityProof['passportNumber'],
        passportFrontImage: B.identityProof['passportFrontImage'],
        passportBackImage: B.identityProof['passportBackImage'],

        NREGANumber: B.identityProof['NREGANumber'],
        NREGAFrontImage: B.identityProof['NREGAFrontImage'],
        NREGABackImage: B.identityProof['NREGABackImage'],

        middleName: B.farmerDetails['middleName'],
        lastName: B.farmerDetails['lastName'],
        dob: B.farmerDetails['dob'],
        gender: B.farmerDetails['gender'],
        religion: B.farmerDetails['religion'],
        caste: B.farmerDetails['caste'],
        educationalQualification: B.otherDetails['educationalQualification'],
        occupation: B.otherDetails['occupation'],
        annualIncome: B.otherDetails['annualIncome'],

        address1: B.address['addressLine1'],
        address2: B.address['addressLine2'],
        pinCode: B.address['pincode'],
        taluk: B.address['taluk'],
        city: B.address['city'],
        state: B.address['state'],
        landmark: B.address['landmark'],

        phoneNumber: B.address['mobileNumber'],
        mobile1: B.address['mobile1'],
        mobile2: B.address['mobile2'],
        email: B.address['email'],

        yrsInAddress: B.yrsInAddress,
        yrsInCity: B.yrsInCity,

        permAddressLine1: B.permAddress?.addressLine1,
        permAddressLine2: B.permAddress?.addressLine2,
        permPincode: B.permAddress?.pincode,
        permTaluk: B.permAddress?.taluk,
        permCity: B.permAddress?.city,
        permState: B.permAddress?.state,

        propertyStatus: B.propertyStatus,
        monthlyRent: B.monthlyRent,
        commOrPerAddress: B.permAddress?.commOrPerAddress,
        // familyMembers: '',
        // propertyOwnership: '',
        phoneType: B.phoneType,
        phoneOperating: B.phoneUsedBy,
        cultivationAdvice: B.cultivationAdvice,
        cultivationAdviceOther: B.cultivationAdviceOther,
        adviceMedium: B.adviceMedium,
        adviceMediumOther: B.adviceMediumOther,
        sourceOfIncome: B.sourceOfIncome,
        sourceOfIncomeOther: B.sourceOfIncomeOther,
        agriculturalInterest: B.agricultureChildrenInterested,
        innovativeWaysFarming: B.innovativeFarmingWays,
      });
    }
  }

  validateAndNext() {
    this.isSubmitted = true;
    if (this.demographicInfoForm.invalid) {
      this.toastr.error('please enter values for required fields', 'Error!');
      return;
    } else {
      const formValue = this.demographicInfoForm.value;
      const obj = {
        // profileImg: '',
        profileImg: formValue.profileImg,
        identityProof: {
          panNumber: formValue.PANnumber,
          panImg: '',
          // panImg: formValue.PANFrontImage,

          passportNumber: formValue.passportNumber,
          passportFrontImage: formValue.passportFrontImage,
          passportBackImage: formValue.passportBackImage,

          NREGANumber: formValue.NREGANumber,
          NREGAFrontImage: formValue.NREGAFrontImage,
          NREGABackImage: formValue.NREGABackImage,
        },
        addressProof: {
          selectedIdProof: formValue.addressProof,
          selectedIdProofFrontImg: '',
          selectedIdProofBackImg: '',
          // selectedIdProofFrontImg: formValue.addressProofFrontImage,
          // selectedIdProofBackImg: formValue.addressProofBackImage,
        },
        farmerDetails: {
          salutation: formValue.salutation,
          firstName: formValue.firstName,
          middleName: formValue.middleName,
          lastName: formValue.lastName,
          dob: formValue.dob,
          gender: formValue.gender,
          religion: formValue.religion,
          caste: formValue.caste,
        },
        address: {
          addressLine1: formValue.address1,
          addressLine2: formValue.address2,
          pincode: formValue.pinCode,
          taluk: formValue.taluk,
          city: formValue.city,
          state: formValue.state,
          landmark: formValue.landmark,
          mobileNumber: formValue.phoneNumber,
          mobile1: formValue.mobile1,
          mobile2: formValue.mobile2,
          email: formValue.email,
        },
        permAddress: {
          commOrPerAddress: formValue.commOrPerAddress,
          addressLine1: formValue.permAddressLine1,
          addressLine2: formValue.permAddressLine2,
          pincode: formValue.permPincode,
          taluk: formValue.permTaluk,
          city: formValue.permCity,
          state: formValue.permState,
        },
        otherDetails: {
          educationalQualification: formValue.educationalQualification,
          occupation: formValue.occupation,
          annualIncome: formValue.annualIncome,
        },
        familyMembers: formValue.familyMembers,
        propertyOwnership: formValue.propertyOwnership,
        phoneType: formValue.phoneType,
        phoneUsedBy: formValue.phoneOperating,
        cultivationAdvice: formValue.cultivationAdvice,
        cultivationAdviceOther: formValue.cultivationAdviceOther,
        adviceMedium: formValue.adviceMedium,
        adviceMediumOther: formValue.adviceMediumOther,
        sourceOfIncome: formValue.sourceOfIncome,
        sourceOfIncomeOther: formValue.sourceOfIncomeOther,
        agricultureChildrenInterested: formValue.agriculturalInterest,
        innovativeFarmingWays: formValue.innovativeWaysFarming,

        yrsInAddress: formValue.yrsInAddress,
        yrsInCity: formValue.yrsInCity,

        propertyStatus: formValue.propertyStatus,
        monthlyRent: formValue.monthlyRent,
      };

      if (this.farmerId) {
        localStorage.setItem('edit-demographic-info', JSON.stringify(obj));
        localStorage.setItem(
          'edit-demographic-info-form',
          JSON.stringify(formValue)
        );
      } else {
        localStorage.setItem('demographic-info', JSON.stringify(obj));
        localStorage.setItem(
          'demographic-info-form',
          JSON.stringify(formValue)
        );
      }

      console.log(this.farmerId);
      const url = `/add/${this.nextRoute}/${this.farmerId}`;
      this.router.navigate([url]);
    }
  }
  /* END: NON-API Function Calls------------------------------------------------------------------------ */

  /* START: API Function Calls-------------------------------------------------------------------------- */
  getPinCodeData(event: any, type: string) {
    // clear values
    if (type === 'ADDRESS') {
      this.demographicInfoForm.patchValue({
        city: '',
        state: '',
      });
      this.pinCodeAPIData.length = 0;
    } else if (type === 'PERMANENT_ADDRESS') {
      this.demographicInfoForm.patchValue({
        permCity: '',
        permState: '',
      });
      this.permPinCodeAPIData.length = 0;
    }

    // check length and proceed
    if (event && event.target.value.trim().length == 6) {
      this.spinner.show();
      this.commonService.getPinCodeData(event.target.value.trim()).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res && res[0].Status != 'Success') {
            alert(`${res[0].Message}`);
          } else {
            if (type === 'ADDRESS') {
              this.pinCodeAPIData = res[0].PostOffice;
              this.demographicInfoForm.patchValue({
                city: this.pinCodeAPIData[0].District,
                state: this.pinCodeAPIData[0].State,
              });
            } else if (type === 'PERMANENT_ADDRESS') {
              this.permPinCodeAPIData = res[0].PostOffice;
              this.demographicInfoForm.patchValue({
                permCity: this.permPinCodeAPIData[0].District,
                permState: this.permPinCodeAPIData[0].State,
              });
            }
          }
        },
        (error: any) => {
          this.spinner.hide();
          alert('Failed to fetch PinCode Details, please try againn...');
        }
      );
    }
  }
  /* END: API Function Calls---------------------------------------------------------------------------- */
}
