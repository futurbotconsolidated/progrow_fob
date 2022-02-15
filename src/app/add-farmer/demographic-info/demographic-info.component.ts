import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';
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
  /* END: Varaibles */

  constructor(
    public router: Router,
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService
  ) {
    this.demographicInfoForm = this.formBuilder.group({
      profileImg: new FormControl(''),
      addressProof: new FormControl('', [Validators.required]),
      addressProofFrontImage: new FormControl(''),
      addressProofBackImage: new FormControl(''),
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
      educationQualification: new FormControl(''),
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
      mobile1: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      mobile2: new FormControl(''),
      yrsInAddress: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      yrsInCity: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      email: new FormControl('', [Validators.email]),

      permAddressLine1: new FormControl(''),
      permAddressLine2: new FormControl(''),
      permTaluk: new FormControl(''),
      permCity: new FormControl(''),
      permPincode: new FormControl(''),
      permState: new FormControl(''),

      propertyStatus: new FormControl('own'),
      monthlyRent: new FormControl(''),
      commOrPerAddress: new FormControl('same_above', [Validators.required]),
      familyMembers: new FormArray([this.createFamilyMembers()]),
      propertyOwnership: new FormArray([this.createPropertyOwnership()]),
      phoneType: new FormControl('feature_phone'),
      phoneOperating: new FormControl('i_check_mostly'),
      cultivationAdvice: [Array()],
      cultivationAdviceOther: new FormControl(''),
      adviceMedium: [Array()],
      adviceMediumOther: new FormControl(''),
      sourceOfIncome: [Array()],
      sourceOfIncomeOther: new FormControl(''),
      agriculturalInterest: new FormControl('very_much_interested'),
      innovativeWaysFarming: [Array()],
    });
  }

  ngOnInit(): void {
    this.demoGraphicMaster = data.demoGraphic; // read master data

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

        console.log(this.fileUpload);
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

  validateAndNext() {
    console.log(this.demographicInfoForm.value);

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
        },
        addressProof: {
          selectedIdProof: formValue.addressProof,
          selectedIdProofFrontImg: '',
          selectedIdProofBackImg: '',
          // selectedIdProofFrontImg: formValue.addressProofFrontImage,
          // selectedIdProofBackImg: formValue.addressProofBackImage,
        },
        farmerDetails: {
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
          mobileNumber: formValue.phoneNumber,
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
      };
      console.log(obj);
      localStorage.setItem('demographic-info', JSON.stringify(obj));
      localStorage.setItem('demographic-info-form', JSON.stringify(formValue));

      // console.log(JSON.stringify(obj).length, JSON.stringify(formValue).length);

      const url = `/add/${this.nextRoute}`;
      this.router.navigate([url]);
    }
  }
}
