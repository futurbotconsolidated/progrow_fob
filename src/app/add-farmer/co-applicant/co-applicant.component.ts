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
  pinCodeAPIDatacoa2: any = [];
  permPinCodeAPIData: any = [];
  permPinCodeAPIDatacoa2: any = [];

  familyMembers!: FormArray;
  familyMemberscoa2!: FormArray;
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
      ]),

      // mobile1: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      // mobile2: new FormControl(''),
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

      profileImgcoa2: new FormControl(''),
      addressProofcoa2: new FormControl(''),
      addressProofFrontImagecoa2: new FormControl(''),
      addressProofBackImagecoa2: new FormControl(''),
      firstNamecoa2: new FormControl(''),
      PANnumbercoa2: new FormControl(''),
      PANFrontImagecoa2: new FormControl(''),
      passportNumbercoa2: new FormControl(''),
      passportFrontImagecoa2: new FormControl(''),
      passportBackImagecoa2: new FormControl(''),
      NREGANumbercoa2: new FormControl(''),
      NREGAFrontImagecoa2: new FormControl(''),
      NREGABackImagecoa2: new FormControl(''),
      middleNamecoa2: new FormControl(''),
      lastNamecoa2: new FormControl(''),
      dobcoa2: new FormControl(''),
      gendercoa2: new FormControl(''),
      religioncoa2: new FormControl(''),
      castecoa2: new FormControl(''),
      educationQualificationcoa2: new FormControl(''),
      occupationcoa2: new FormControl(''),
      annualIncomecoa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      address1coa2: new FormControl(''),
      address2coa2: new FormControl(''),
      talukcoa2: new FormControl(''),
      citycoa2: new FormControl(''),
      pinCodecoa2: new FormControl('', [
        Validators.minLength(6),
        Validators.maxLength(6),
      ]),
      statecoa2: new FormControl(''),
      landmarkcoa2: new FormControl(''),
      phoneNumbercoa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      // mobile1coa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      // mobile2coa2: new FormControl(''),
      yrsInAddresscoa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      yrsInCitycoa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      emailcoa2: new FormControl('', [Validators.email]),

      permAddressLine1coa2: new FormControl(''),
      permAddressLine2coa2: new FormControl(''),
      permTalukcoa2: new FormControl(''),
      permCitycoa2: new FormControl(''),
      permPincodecoa2: new FormControl(''),
      permStatecoa2: new FormControl(''),

      propertyStatuscoa2: new FormControl(''),
      monthlyRentcoa2: new FormControl(''),
      commOrPerAddresscoa2: new FormControl(''),
      familyMemberscoa2: new FormArray([this.createFamilyMembers()]),
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

    // ----------------------- Start auto save --------------------
    this.coApplicantForm.valueChanges
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
      draft_farmer_new['co_applicant_form'] = form_values;
      localStorage.setItem('draft_farmer_new', JSON.stringify(draft_farmer_new));
      this.saveStatus = SaveStatus.Saved;
      if (this.saveStatus === SaveStatus.Saved) {
        this.saveStatus = SaveStatus.Idle;
      }
    });
    // ----------------------- End auto save --------------------
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

  getFamilyMembersControls(type: string) {
    if (type === 'coa2') {
      return (this.coApplicantForm.get('familyMemberscoa2') as FormArray)
        .controls;
    } else {
      return (this.coApplicantForm.get('familyMembers') as FormArray).controls;
    }
  }

  addFamilyMembers(type: string): void {
    if (type === 'coa2') {
      this.familyMemberscoa2 = this.coApplicantForm.get(
        'familyMemberscoa2'
      ) as FormArray;
      this.familyMemberscoa2.push(this.createFamilyMembers());
    } else {
      this.familyMembers = this.coApplicantForm.get(
        'familyMembers'
      ) as FormArray;
      this.familyMembers.push(this.createFamilyMembers());
    }
  }

  removeFamilyMembers(index: any, type: string) {
    if (type === 'coa2') {
      this.familyMemberscoa2.removeAt(index);
    } else {
      this.familyMembers.removeAt(index);
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
      if (!this.coApplicantForm.value.PANnumber) {
        this.toastr.error('please enter PAN Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload PAN Card';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.PANFrontImage || '';
    } else if (type === 'PANcoa2') {
      if (!this.coApplicantForm.value.PANnumbercoa2) {
        this.toastr.error('please enter PAN Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload PAN Card';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.PANFrontImagecoa2 || '';
    } else if (type === 'ADDRESS_PROOF') {
      if (!this.coApplicantForm.value.addressProof) {
        this.toastr.error('please select Address Proof Type.', 'Error!');
        return;
      }
      const A = this.addressProofList
        .filter(
          (x: any) => this.coApplicantForm.value.addressProof == x.displayValue
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
    } else if (type === 'ADDRESS_PROOFcoa2') {
      if (!this.coApplicantForm.value.addressProofcoa2) {
        this.toastr.error('please select Address Proof Type.', 'Error!');
        return;
      }
      const A = this.addressProofList
        .filter(
          (x: any) =>
            this.coApplicantForm.value.addressProofcoa2 == x.displayValue
        )
        .map((y: any) => {
          return y.displayName;
        });
      this.fileUpload.popupTitle = `Upload ${A || ''} Image`;
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.addressProofFrontImagecoa2 || '';
      this.fileUpload.new.imageSrc2 =
        this.coApplicantForm.value.addressProofBackImagecoa2 || '';
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
    } else if (type === 'PASSPORTcoa2') {
      if (!this.coApplicantForm.value.passportNumbercoa2) {
        this.toastr.error('please enter Passport Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Passport';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.passportFrontImagecoa2 || '';
      this.fileUpload.new.imageSrc2 =
        this.coApplicantForm.value.passportBackImagecoa2 || '';
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
    } else if (type === 'NREGAcoa2') {
      if (!this.coApplicantForm.value.NREGANumbercoa2) {
        this.toastr.error('please enter NREGA Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload NREGA';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.NREGAFrontImagecoa2 || '';
      this.fileUpload.new.imageSrc2 =
        this.coApplicantForm.value.NREGABackImagecoa2 || '';
    } else if (type === 'FARMER_PROFILE') {
      this.fileUpload.popupTitle = 'Upload Farmer Profile';
      this.fileUpload.imageHeading1 = 'Farmer Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.profileImg || '';
    } else if (type === 'FARMER_PROFILEcoa2') {
      this.fileUpload.popupTitle = 'Upload Farmer Profile';
      this.fileUpload.imageHeading1 = 'Farmer Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.imageSrc1 =
        this.coApplicantForm.value.profileImgcoa2 || '';
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
          this.coApplicantForm.patchValue({
            PANFrontImage: imageSrc,
          });
        } else if (
          this.fileUpload.fileFor === 'PANcoa2' &&
          type == 'FRONT_IMAGE'
        ) {
          this.fileUpload.new.imageSrc1 = imageSrc;
          this.coApplicantForm.patchValue({
            PANFrontImagecoa2: imageSrc,
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
        } else if (this.fileUpload.fileFor === 'ADDRESS_PROOFcoa2') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.coApplicantForm.patchValue({
              addressProofFrontImagecoa2: imageSrc,
            });
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.coApplicantForm.patchValue({
              addressProofBackImagecoa2: imageSrc,
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
        } else if (this.fileUpload.fileFor === 'PASSPORTcoa2') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.coApplicantForm.patchValue({
              passportFrontImagecoa2: imageSrc,
            });
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.coApplicantForm.patchValue({
              passportBackImagecoa2: imageSrc,
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
        } else if (this.fileUpload.fileFor === 'NREGAcoa2') {
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
        } else if (this.fileUpload.fileFor === 'FARMER_PROFILEcoa2') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.coApplicantForm.patchValue({
              profileImgcoa2: imageSrc,
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
    } else if (type == 'FARMER_PROFILEcoa2') {
      this.coApplicantForm.patchValue({
        profileImgcoa2: '',
      });
    }
  }
  validateNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  getPinCodeData(event: any, type: string) {
    // clear values
    if (type === 'ADDRESS') {
      this.coApplicantForm.patchValue({
        city: '',
        state: '',
      });
      this.pinCodeAPIData.length = 0;
    } else if (type === 'ADDRESScoa2') {
      this.coApplicantForm.patchValue({
        city: '',
        state: '',
      });
      this.pinCodeAPIDatacoa2.length = 0;
    } else if (type === 'PERMANENT_ADDRESS') {
      this.coApplicantForm.patchValue({
        permCity: '',
        permState: '',
      });
      this.permPinCodeAPIData.length = 0;
    } else if (type === 'PERMANENT_ADDRESScoa2') {
      this.coApplicantForm.patchValue({
        permCity: '',
        permState: '',
      });
      this.permPinCodeAPIDatacoa2.length = 0;
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
            } else if (type === 'ADDRESScoa2') {
              this.pinCodeAPIDatacoa2 = res[0].PostOffice;
              this.coApplicantForm.patchValue({
                citycoa2: this.pinCodeAPIDatacoa2[0].District,
                statecoa2: this.pinCodeAPIDatacoa2[0].State,
              });
            } else if (type === 'PERMANENT_ADDRESS') {
              this.permPinCodeAPIData = res[0].PostOffice;

              this.coApplicantForm.patchValue({
                permCity: this.permPinCodeAPIData[0].District,
                permState: this.permPinCodeAPIData[0].State,
              });
            } else if (type === 'PERMANENT_ADDRESScoa2') {
              this.permPinCodeAPIDatacoa2 = res[0].PostOffice;
              this.coApplicantForm.patchValue({
                permCitycoa2: this.permPinCodeAPIDatacoa2[0].District,
                permStatecoa2: this.permPinCodeAPIDatacoa2[0].State,
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
    this.isSubmitted = true;
    if (this.coApplicantForm.invalid) {
      this.toastr.error('please enter values for required fields', 'Error!');
      return;
    } else {
      const formValue = this.coApplicantForm.value;
      const coapparr = <any>[];
      const obj = {
        profileImg: '',
        // profileImg: formValue.profileImg,
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
        passportNumber: formValue.passportNumber,
        passportFrontImage: '',
        // passportFrontImage: formValue.passportFrontImage,
        passportBackImage: '',
        // passportBackImage: formValue.passportBackImage,
        NREGANumber: formValue.NREGANumber,
        NREGAFrontImage: '',
        // NREGAFrontImage: formValue.NREGAFrontImage,
        NREGABackImage: '',
        // NREGABackImage: formValue.NREGABackImage,
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
          taluk: formValue.taluk,
          city: formValue.city,
          state: formValue.state,
          landmark: formValue.landmark,
          yrsInAddress: formValue.yrsInAddress,
          yrsInCity: formValue.yrsInCity,
        },
        email: formValue.email,
        propertyStatus: formValue.propertyStatus,
        monthlyRent: formValue.monthlyRent,
        commOrPerAddress: formValue.commOrPerAddress,
        otherDetails: {
          educationalQualification: formValue.educationalQualification,
          occupation: formValue.occupation,
          fpoName: formValue.annualIncome,
        },
        familyMembers: formValue.familyMembers,
      };

      const objcoa2 = {
        profileImg: '', //formValue.profileImgcoa2,
        identityProof: {
          panNumber: formValue.PANnumbercoa2,
          panImg: '', //formValue.PANFrontImagecoa2,
        },
        addressProof: {
          selectedIdProof: formValue.addressProofcoa2,
          selectedIdProofFrontImg: '', //formValue.addressProofFrontImagecoa2,
          selectedIdProofBackImg: '', //formValue.addressProofBackImagecoa2,
        },
        passportNumber: formValue.passportNumbercoa2,
        passportFrontImage: '', // formValue.passportFrontImagecoa2,
        passportBackImage: '', //formValue.passportBackImagecoa2,
        NREGANumber: formValue.NREGANumbercoa2,
        NREGAFrontImage: '', // formValue.NREGAFrontImagecoa2,
        NREGABackImage: '', //formValue.NREGABackImagecoa2,
        farmerDetails: {
          firstName: formValue.firstNamecoa2,
          middleName: formValue.middleNamecoa2,
          lastName: formValue.lastNamecoa2,
          dob: formValue.dobcoa2,
          gender: formValue.gendercoa2,
          religion: formValue.religioncoa2,
          caste: formValue.castecoa2,
        },
        address: {
          addressLine1: formValue.address1coa2,
          addressLine2: formValue.address2coa2,
          pincode: formValue.pinCodecoa2,
          mobileNumber: formValue.phoneNumbercoa2,
          taluk: formValue.talukcoa2,
          city: formValue.citycoa2,
          state: formValue.statecoa2,
          landmark: formValue.landmarkcoa2,
          yrsInAddress: formValue.yrsInAddresscoa2,
          yrsInCity: formValue.yrsInCitycoa2,
        },
        email: formValue.emailcoa2,
        propertyStatus: formValue.propertyStatuscoa2,
        monthlyRent: formValue.monthlyRentcoa2,
        commOrPerAddress: formValue.commOrPerAddresscoa2,
        otherDetails: {
          educationalQualification: formValue.educationalQualificationcoa2,
          occupation: formValue.occupationcoa2,
          fpoName: formValue.annualIncomecoa2,
        },
        familyMembers: formValue.familyMemberscoa2,
      };

      coapparr.push(obj);
      coapparr.push(objcoa2);
      // console.log(coapparr);
      localStorage.setItem('co-applicant', JSON.stringify(coapparr));
      localStorage.setItem('co-applicant-form', JSON.stringify(formValue));
      // console.log(JSON.stringify(obj).length, JSON.stringify(formValue).length);
      //console.log(localStorage.getItem('co-applicant'));

      const url = `/add/${this.nextRoute}`;
      this.router.navigate([url]);
    }
  }
}
