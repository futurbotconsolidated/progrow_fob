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
import { validatePANNumber } from '../../shared/custom-validators';

declare var $: any;

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
  selector: 'app-co-applicant',
  templateUrl: './co-applicant.component.html',
  styleUrls: ['./co-applicant.component.css'],
})
export class CoApplicantComponent implements OnInit {
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
  addressProofList: any = [];
  propertyTypeList: any = [];

  pinCodeAPIData: any = [];
  permPinCodeAPIData: any = [];

  familyMembers!: FormArray;
  coApplicantForm: FormGroup;

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
      this.coApplicantForm = this.formBuilder.group({
      profileImg: new FormControl(''),
      addressProof: new FormControl('', [Validators.required]),
      addressProofFrontImage: new FormControl('', [Validators.required]),
      addressProofBackImage: new FormControl('', [Validators.required]),
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
      gender: new FormControl('male'),
      religion: new FormControl('hindu'),
      caste: new FormControl('sc'),
      educationQualification: new FormControl(''),
      occupation: new FormControl(''),
      annualIncome: new FormControl('', [Validators.pattern('^[0-9]*$')]),
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
    
    let demoInfo: any = localStorage.getItem('co-applicant-form');
    if (demoInfo) {
      demoInfo = JSON.parse(demoInfo);
      this.coApplicantForm.patchValue(demoInfo);
      console.log(demoInfo);
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
    return this.coApplicantForm.controls;
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
    return (this.coApplicantForm.get('familyMembers') as FormArray)
      .controls;
  }

  addFamilyMembers(): void {
    this.familyMembers = this.coApplicantForm.get(
      'familyMembers'
    ) as FormArray;
    this.familyMembers.push(this.createFamilyMembers());
  }

  removeFamilyMembers(index: any) {
    this.familyMembers.removeAt(index);
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
      if (!this.coApplicantForm.value.PANnumber) {
        this.toastr.error('please enter PAN Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload PAN Card';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.PANFrontImage || '';
    } else if (type === 'ADDRESS_PROOF') {
      if (!this.coApplicantForm.value.addressProof) {
        this.toastr.error('please select Address Proof Type.', 'Error!');
        return;
      }
      const A = this.addressProofList
        .filter(
          (x: any) =>
            this.coApplicantForm.value.addressProof == x.displayValue
        )
        .map((y: any) => {
          return y.displayName;
        });
      this.fileUpload.popupTitle = `Upload ${A || ''} Image`;
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.addressProofFrontImage || '';
      this.fileUpload.new.imageSrc2 =
        this.coApplicantForm.value.addressProofBackImage || '';
    } else if (type === 'PASSPORT') {
      if (!this.coApplicantForm.value.passportNumber) {
        this.toastr.error('please enter Passport Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Passport';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.passportFrontImage || '';
      this.fileUpload.new.imageSrc2 =
        this.coApplicantForm.value.passportBackImage || '';
    } else if (type === 'NREGA') {
      if (!this.coApplicantForm.value.NREGANumber) {
        this.toastr.error('please enter NREGA Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload NREGA';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.NREGAFrontImage || '';
      this.fileUpload.new.imageSrc2 =
        this.coApplicantForm.value.NREGABackImage || '';
    } else if (type === 'FARMER_PROFILE') {
      this.fileUpload.popupTitle = 'Upload Farmer Profile';
      this.fileUpload.imageHeading1 = 'Farmer Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.profileImg || '';
    }
    $('#fileUploadModalPopup').modal('show');
  }
  onFileChange(event: any, type = '') {
    const reader = new FileReader();
    if (event.target.files && event.target.files.length) {
      const [file] = event.target.files;

      if (file.size > 300000) {
        this.toastr.error('Image size can be upto 300KB Maximum.', 'Error!');
        return;
      }
      if (file.type.split('/')[0] != 'image') {
        this.toastr.error('Only Image files are allowed.', 'Error!');
        return;
      }

      reader.readAsDataURL(file);
      reader.onload = () => {
        const imageSrc = reader.result;

        if (this.fileUpload.fileFor === 'PAN' && type == 'FRONT_IMAGE') {
          this.fileUpload.new.imageSrc1 = imageSrc;
          this.coApplicantForm.patchValue({
            PANFrontImage: imageSrc,
          });
        } else if (this.fileUpload.fileFor === 'ADDRESS_PROOF') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.coApplicantForm.patchValue({
              addressProofFrontImage: imageSrc,
            });
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.coApplicantForm.patchValue({
              addressProofBackImage: imageSrc,
            });
          }
        } else if (this.fileUpload.fileFor === 'PASSPORT') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.coApplicantForm.patchValue({
              passportFrontImage: imageSrc,
            });
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.coApplicantForm.patchValue({
              passportBackImage: imageSrc,
            });
          }
        } else if (this.fileUpload.fileFor === 'NREGA') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.coApplicantForm.patchValue({
              NREGAFrontImage: imageSrc,
            });
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.coApplicantForm.patchValue({
              NREGABackImage: imageSrc,
            });
          }
        } else if (this.fileUpload.fileFor === 'FARMER_PROFILE') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.coApplicantForm.patchValue({
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
      this.coApplicantForm.patchValue({
        profileImg: '',
      });
    }
  }
  getPinCodeData(event: any, type: string) {
    // clear values
    if (type === 'ADDRESS') {
      this.coApplicantForm.patchValue({
        city: '',
        state: '',
      });
      this.pinCodeAPIData.length = 0;
    } else if (type === 'PERMANENT_ADDRESS') {
      this.coApplicantForm.patchValue({
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
            alert('Failed to fetch PinCode Details, please try again...');
          } else {
            if (type === 'ADDRESS') {
              this.pinCodeAPIData = res[0].PostOffice;

              this.coApplicantForm.patchValue({
                city: this.pinCodeAPIData[0].District,
                state: this.pinCodeAPIData[0].State,
              });
            } else if (type === 'PERMANENT_ADDRESS') {
              this.permPinCodeAPIData = res[0].PostOffice;

              this.coApplicantForm.patchValue({
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
    console.log('validateAndNext');
    console.log(this.coApplicantForm.value);
    this.isSubmitted = true;
    if (this.coApplicantForm.invalid) {
      this.toastr.error('please enter values for required fields', 'Error!');
      return;
    } else {
      const formValue = this.coApplicantForm.value;
      const obj = {
        profileImg: formValue.profileImg,
        identityProof: {
          panNumber: formValue.PANnumber,
          panImg: formValue.PANFrontImage,
        },
        addressProof: {
          selectedIdProof: formValue.addressProof,
          selectedIdProofFrontImg: formValue.addressProofFrontImage,
          selectedIdProofBackImg: formValue.addressProofBackImage,
        },
        passportNumber: formValue.passportNumber,    
        passportFrontImage: formValue.passportFrontImage,    
        passportBackImage: formValue.passportBackImage,        
        NREGANumber: formValue.NREGANumber,        
        NREGAFrontImage: formValue.NREGAFrontImage,        
        NREGABackImage: formValue.NREGABackImage,        
        farmerDetails: {
          firstName: formValue.firstName,
          middleName: formValue.middleName,
          lastName: formValue.lastName,
          dob: formValue.dob,
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
          fpoName: formValue.annualIncome,
        },
        familyMembers: formValue.familyMembers,    
    
      };
      console.log(obj);
      localStorage.setItem('co-applicant', JSON.stringify(obj));
      localStorage.setItem('co-applicant-form', JSON.stringify(formValue));
      // console.log(JSON.stringify(obj).length, JSON.stringify(formValue).length);
      const url = `/add/${this.nextRoute}`;
      this.router.navigate([url]);
    }
  }
}
