import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';
import { validatePANNumber } from '../../shared/custom-validators';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { formatDate } from '@angular/common';

declare var $: any;
import { data } from '../../shared/fob_master_data';
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
export class CoApplicantComponent implements OnInit, AfterViewInit, OnDestroy {
  /* START: Varaibles ---------------------------------------------*/
  private observableSubscription: any;

  coApplicantMaster = <any>{};
  demoGraphicMaster = <any>{};

  isSubmitted = false;
  fileUpload = {
    coaNo: '',
    fileFor: '',
    popupTitle: '',
    new: {
      imageSrc1: '',
      imageSrc2: '',
      imageName1: '',
      imageName2: '',      
      isImage1Required: true,
      isImage2Required: false,
    },
    imageHeading1: 'Front Image',
    imageHeading2: 'Back Image',
  } as any;

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

  /* START: indexed db variables */
  displayCoApplicant1ProfileImage = '' as any;
  displayCoApplicant2ProfileImage = '' as any;
  indexedDBPageName = 'coapplicant';
  concatePage1 = 'coapplicant1';
  concatePage2 = 'coapplicant2';
  indexedDBName = 'registerFarmer';
  indexedDBFileNameManage = {
    coa1: {
      panCard: {
        front: `${this.concatePage1}_PANCardFront`,
        back: '',
      },
      aadhaarCard: {
        front: `${this.concatePage1}_AadhaarCardFront`,
        back: `${this.concatePage1}_AadhaarCardBack`,
      },
      drivingLicence: {
        front: `${this.concatePage1}_DrivingLicenceFront`,
        back: `${this.concatePage1}_DrivingLicenceBack`,
      },

      voterId: {
        front: `${this.concatePage1}_voterIdFront`,
        back: `${this.concatePage1}_voterIdBack`,
      },
      passport: {
        front: `${this.concatePage1}_passportFront`,
        back: `${this.concatePage1}_passportBack`,
      },
      NREGA: {
        front: `${this.concatePage1}_NREGAFront`,
        back: `${this.concatePage1}_NREGABack`,
      },

      farmerProfile: { front: `${this.concatePage1}_farmerProfileImage` },
    },
    coa2: {
      panCard: {
        front: `${this.concatePage2}_PANCardFront`,
        back: '',
      },
      aadhaarCard: {
        front: `${this.concatePage2}_AadhaarCardFront`,
        back: `${this.concatePage2}_AadhaarCardBack`,
      },
      drivingLicence: {
        front: `${this.concatePage2}_DrivingLicenceFront`,
        back: `${this.concatePage2}_DrivingLicenceBack`,
      },

      voterId: {
        front: `${this.concatePage2}_voterIdFront`,
        back: `${this.concatePage2}_voterIdBack`,
      },
      passport: {
        front: `${this.concatePage2}_passportFront`,
        back: `${this.concatePage2}_passportBack`,
      },
      NREGA: {
        front: `${this.concatePage2}_NREGAFront`,
        back: `${this.concatePage2}_NREGABack`,
      },

      farmerProfile: { front: `${this.concatePage2}_farmerProfileImage` },
    },
  };

  fileUploadFileFor = {
    coa1: {
      panCard: 'PAN',
      aadhaarCard: 'AADHAAR',
      drivingLicence: 'DRIVING_LICENCE',
      voterId: 'VOTERID',
      passport: 'PASSPORT',
      NREGA: 'NREGA',
      farmerProfile: 'FARMER_PROFILE',
    },
    coa2: {
      panCard: 'PAN',
      aadhaarCard: 'AADHAAR',
      drivingLicence: 'DRIVING_LICENCE',
      voterId: 'VOTERID',
      passport: 'PASSPORT',
      NREGA: 'NREGA',
      farmerProfile: 'FARMER_PROFILE',
    },
  };
  /* END: indexed db variables */

  farmerId = ''; // edit feature

  /* START: KYC Data Structure & Related Variables */
  kycFieldButtonLabels = {
    verify: 'Verify',
    verified: 'Verified',
    try_again: 'Try again',
    confirm: 'Confirm',
  };

  kycProofNames = {
    coa1: {
      pan: 'pan',
      aadhaar: 'aadhaar',
      driving_licence: 'driving_licence',
      voter_id: 'voter_id',
      passport: 'passport',
      nrega: 'nrega',
    },
    coa2: {
      pan: 'pan',
      aadhaar: 'aadhaar',
      driving_licence: 'driving_licence',
      voter_id: 'voter_id',
      passport: 'passport',
      nrega: 'nrega',
    },
  };

  kycData = {
    coa1: {
      pan: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      aadhaar: {
        id: '',
        verificationLinkData: {},
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      driving_licence: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      voter_id: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      passport: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      nrega: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
    },
    coa2: {
      pan: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      aadhaar: {
        id: '',
        verificationLinkData: {},
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      driving_licence: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      voter_id: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      passport: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
      nrega: {
        id: '',
        data: {},
        isVerified: false,
        showVerify: true,
        showTryAgain: false,
        showConfirm: false,
      },
    },
  } as any;
  /* END: KYC Data Structure & Related Variables */
  /* END: Varaibles ---------------------------------------------*/

  constructor(
    public oauthService: OAuthService,
    public router: Router,
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    private toastr: ToastrService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    private activatedRoute: ActivatedRoute,
    private dbService: NgxIndexedDBService
  ) {
    // create form group
    this.coApplicantForm = this.formBuilder.group({
      // co-applicat 1
      salutation: new FormControl(''),
      firstName: new FormControl(''),
      middleName: new FormControl(''),
      lastName: new FormControl(''),
      dob: new FormControl(''),
      gender: new FormControl(''),
      religion: new FormControl(''),
      caste: new FormControl(''),
      educationalQualification: new FormControl(''),
      occupation: new FormControl(''),
      annualIncome: new FormControl('', [Validators.pattern('^[0-9]*$')]),

      address1: new FormControl(''),
      address2: new FormControl(''),
      pinCode: new FormControl('', [
        // Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ]),
      taluk: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      landmark: new FormControl(''),

      phoneNumber: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('^[0-9]*$'),
      ]),

      yrsInAddress: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      yrsInCity: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      email: new FormControl('', [Validators.email]),

      commOrPerAddress: new FormControl(''),
      permAddressLine1: new FormControl(''),
      permAddressLine2: new FormControl(''),
      permPincode: new FormControl(''),
      permTaluk: new FormControl(''),
      permCity: new FormControl(''),
      permState: new FormControl(''),

      propertyStatus: new FormControl(''),
      monthlyRent: new FormControl(''),
      familyMembers: new FormArray([]),

      PANnumber: new FormControl('', [validatePANNumber]),
      aadhaarNumber: new FormControl('', [
        Validators.minLength(12),
        Validators.maxLength(12),
      ]),
      drivingLicenceNumber: new FormControl(''),
      voterIdNumber: new FormControl(''),
      passportNumber: new FormControl(''),
      NREGANumber: new FormControl(''),

      // co-applicat 2
      salutationcoa2: new FormControl(''),
      firstNamecoa2: new FormControl(''),
      middleNamecoa2: new FormControl(''),
      lastNamecoa2: new FormControl(''),
      dobcoa2: new FormControl(''),
      gendercoa2: new FormControl(''),
      religioncoa2: new FormControl(''),
      castecoa2: new FormControl(''),
      educationalQualificationcoa2: new FormControl(''),
      occupationcoa2: new FormControl(''),
      annualIncomecoa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),

      address1coa2: new FormControl(''),
      address2coa2: new FormControl(''),
      pinCodecoa2: new FormControl('', [
        Validators.minLength(6),
        Validators.maxLength(6),
      ]),
      talukcoa2: new FormControl(''),
      citycoa2: new FormControl(''),
      statecoa2: new FormControl(''),
      landmarkcoa2: new FormControl(''),
      phoneNumbercoa2: new FormControl('', [
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('^[0-9]*$'),
      ]),

      emailcoa2: new FormControl('', [Validators.email]),
      yrsInAddresscoa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),
      yrsInCitycoa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),

      commOrPerAddresscoa2: new FormControl(''),
      permAddressLine1coa2: new FormControl(''),
      permAddressLine2coa2: new FormControl(''),
      permPincodecoa2: new FormControl(''),
      permTalukcoa2: new FormControl(''),
      permCitycoa2: new FormControl(''),
      permStatecoa2: new FormControl(''),

      propertyStatuscoa2: new FormControl(''),
      monthlyRentcoa2: new FormControl(''),
      familyMemberscoa2: new FormArray([]),

      PANnumbercoa2: new FormControl(''),
      aadhaarNumbercoa2: new FormControl('', [
        Validators.minLength(12),
        Validators.maxLength(12),
      ]),
      drivingLicenceNumbercoa2: new FormControl(''),
      voterIdNumbercoa2: new FormControl(''),
      passportNumbercoa2: new FormControl(''),
      NREGANumbercoa2: new FormControl(''),
    });

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }

  /* START: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */
  ngOnInit(): void {
    this.coApplicantMaster = data.coApplicant; // read master data
    this.demoGraphicMaster = data.demoGraphic; // read master data
    // ----------------------- Start auto save --------------------
    // draft feature is not required in edit operation
    if (!this.farmerId) {
      this.coApplicantForm.valueChanges
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
          draft_farmer_new['co_applicant_form'] = form_values;
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
    // if case is for EDIT and else case is for NEW/DRAFT
    if (this.farmerId) {
      // assign kyc data to populate
      const coApplRaw: any = localStorage.getItem('edit-co-applicant');
      if (coApplRaw) {
        console.log(coApplRaw);

        const A = JSON.parse(coApplRaw);
        if (Array.isArray(A) && A.length && A[0].kycData) {
          this.kycData.coa1 = A[0].kycData;
          console.log(this.kycData);
        }
        if (Array.isArray(A) && A.length > 1 && A[1].kycData) {
          this.kycData.coa2 = A[1].kycData;
          console.log(this.kycData);
        }
      }

      let editForm: any = localStorage.getItem('edit-co-applicant-form');
      if (editForm) {
        editForm = JSON.parse(editForm);
        this.editDynamicBindFormArray(editForm);

        //  call pincode apis again when we come back to the page again
        if (this.val.pinCode) {
          this.getPinCodeData(
            { target: { value: this.val.pinCode } },
            'ADDRESS'
          );
        }
        if (this.val.permPincode) {
          this.getPinCodeData(
            { target: { value: this.val.permPincode } },
            'PERMANENT_ADDRESS'
          );
        }
        if (this.val.pinCodecoa2) {
          this.getPinCodeData(
            { target: { value: this.val.pinCodecoa2 } },
            'ADDRESScoa2'
          );
        }
        if (this.val.permPincodecoa2) {
          this.getPinCodeData(
            { target: { value: this.val.permPincodecoa2 } },
            'PERMANENT_ADDRESScoa2'
          );
        }
      } else {
        this.patchFarmerDetails(); // bind/patch fresh api data
      }
    } else {
      // assign kyc data to populate
      const coApplRaw: any = localStorage.getItem('co-applicant');
      if (coApplRaw) {
        const A = JSON.parse(coApplRaw);
        if (Array.isArray(A) && A.length && A[0].kycData) {
          this.kycData.coa1 = A[0].kycData;
        }
        if (Array.isArray(A) && A.length > 1 && A[1].kycData) {
          this.kycData.coa2 = A[1].kycData;
        }
      }

      // assign other data to populate

      let coApplicant: any = localStorage.getItem('co-applicant-form');
      if (coApplicant) {
        coApplicant = JSON.parse(coApplicant);
        this.editDynamicBindFormArray(coApplicant);
        //  call pincode apis again when we come back to the page again
        if (this.val.pinCode) {
          this.getPinCodeData(
            { target: { value: this.val.pinCode } },
            'ADDRESS'
          );
        }
        if (this.val.permPincode) {
          this.getPinCodeData(
            { target: { value: this.val.permPincode } },
            'PERMANENT_ADDRESS'
          );
        }
        if (this.val.pinCodecoa2) {
          this.getPinCodeData(
            { target: { value: this.val.pinCodecoa2 } },
            'ADDRESScoa2'
          );
        }
        if (this.val.permPincodecoa2) {
          this.getPinCodeData(
            { target: { value: this.val.permPincodecoa2 } },
            'PERMANENT_ADDRESScoa2'
          );
        }
      }
    }
    if (
      !(this.coApplicantForm.get('familyMembers') as FormArray).controls.length
    ) {
      this.addFamilyMembers('');
    }
    if (
      !(this.coApplicantForm.get('familyMemberscoa2') as FormArray).controls
        .length
    ) {
      this.addFamilyMembers('coa2');
    }
  }

  ngAfterViewInit(): void {
    /** subscribe to Observables, which are triggered from header selections*/
    this.observableSubscription = this.addFarmerService
      .getMessage()
      .subscribe((data) => {
        this.nextRoute = data.routeName;

        if (this.router.url?.includes('/add/co-applicant')) {
          this.validateAndNext();
        }
      });
  }
  ngOnDestroy(): void {
    /** unsubscribe from Observables*/
    this.observableSubscription.unsubscribe();
  }
  // convenience getter for easy access to form fields
  get f() {
    return this.coApplicantForm.controls;
  }
  get val() {
    return this.coApplicantForm.value;
  }
  /* END: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */

  /* START: NON-API Function Calls-------------------------------------------------------------- */
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

  validateNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  /* START: functions used indexed-db ============================================ */
  openFileModalPopup(coaNo: string, type: string) {
    this.fileUpload.coaNo = coaNo;
    this.fileUpload.fileFor = type;
    this.fileUpload.new.imageSrc1 = '';
    this.fileUpload.new.imageSrc2 = '';
    this.fileUpload.new.imageName1 = '';
    this.fileUpload.new.imageName2 = '';    
    this.fileUpload.new.isImage1Required = false;
    this.fileUpload.new.isImage2Required = false;
    this.fileUpload.imageHeading1 = 'Front Image';
    this.fileUpload.imageHeading2 = 'Back Image';

    if (type === this.fileUploadFileFor.coa1.panCard && coaNo === 'coa1') {
      if (!this.coApplicantForm.value.PANnumber) {
        this.toastr.error('please enter PAN Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload PAN Card Image';
      this.fileUpload.new.isImage1Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.panCard.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.panCard.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa2.panCard &&
      coaNo === 'coa2'
    ) {
      if (!this.coApplicantForm.value.PANnumbercoa2) {
        this.toastr.error('please enter PAN Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload PAN Card Image';
      this.fileUpload.new.isImage1Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.panCard.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.panCard.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa1.aadhaarCard &&
      coaNo === 'coa1'
    ) {
      if (!this.coApplicantForm.value.aadhaarNumber) {
        this.toastr.error('please enter Aadhaar Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Aadhaar Card Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.aadhaarCard.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.aadhaarCard.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.aadhaarCard.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.aadhaarCard.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa2.aadhaarCard &&
      coaNo === 'coa2'
    ) {
      if (!this.coApplicantForm.value.aadhaarNumbercoa2) {
        this.toastr.error('please enter Aadhaar Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Aadhaar Card Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.aadhaarCard.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.aadhaarCard.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.aadhaarCard.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.aadhaarCard.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa1.drivingLicence &&
      coaNo === 'coa1'
    ) {
      if (!this.coApplicantForm.value.drivingLicenceNumber) {
        this.toastr.error('please enter Driving Licence Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Driving Licence Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.drivingLicence.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.drivingLicence.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.drivingLicence.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.drivingLicence.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa2.drivingLicence &&
      coaNo === 'coa2'
    ) {
      if (!this.coApplicantForm.value.drivingLicenceNumbercoa2) {
        this.toastr.error('please enter Driving Licence Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Driving Licence Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.drivingLicence.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.drivingLicence.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.drivingLicence.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.drivingLicence.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa1.voterId &&
      coaNo === 'coa1'
    ) {
      if (!this.coApplicantForm.value.voterIdNumber) {
        this.toastr.error('please enter  Voter Id Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload VoterId Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.voterId.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.voterId.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.voterId.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.voterId.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa2.voterId &&
      coaNo === 'coa2'
    ) {
      if (!this.coApplicantForm.value.voterIdNumbercoa2) {
        this.toastr.error('please enter  Voter Id Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload VoterId Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.voterId.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.voterId.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.voterId.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.voterId.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa1.passport &&
      coaNo === 'coa1'
    ) {
      if (!this.coApplicantForm.value.passportNumber) {
        this.toastr.error('please enter Passport Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Passport Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.passport.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.passport.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.passport.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.passport.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa2.passport &&
      coaNo === 'coa2'
    ) {
      if (!this.coApplicantForm.value.passportNumbercoa2) {
        this.toastr.error('please enter Passport Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Passport Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.passport.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.passport.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.passport.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.passport.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (type === this.fileUploadFileFor.coa1.NREGA && coaNo === 'coa1') {
      if (!this.coApplicantForm.value.NREGANumber) {
        this.toastr.error('please enter NREGA Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload NREGA Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.NREGA.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.NREGA.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.NREGA.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.NREGA.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (type === this.fileUploadFileFor.coa2.NREGA && coaNo === 'coa2') {
      if (!this.coApplicantForm.value.NREGANumbercoa2) {
        this.toastr.error('please enter NREGA Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload NREGA Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.NREGA.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.NREGA.front
            );
            this.fileUpload.new.imageName1 = this.fileUpload.new.imageSrc1.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.NREGA.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.NREGA.back
            );
            this.fileUpload.new.imageName2 = this.fileUpload.new.imageSrc2.split('/').pop().split('#')[0].split('?')[0].toString().substring(0, 60);
        });
    } else if (
      type === this.fileUploadFileFor.coa1.farmerProfile &&
      coaNo === 'coa1'
    ) {
      this.fileUpload.popupTitle = 'Upload Farmer Profile Image';
      this.fileUpload.imageHeading1 = 'Farmer Image';
      this.fileUpload.new.isImage1Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.farmerProfile.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.farmerProfile.front
            );
          this.displayCoApplicant1ProfileImage =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.farmerProfile.front
            );
        });
    } else if (
      type === this.fileUploadFileFor.coa2.farmerProfile &&
      coaNo === 'coa2'
    ) {
      this.fileUpload.popupTitle = 'Upload Farmer Profile Image';
      this.fileUpload.imageHeading1 = 'Farmer Image';
      this.fileUpload.new.isImage1Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.farmerProfile.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.farmerProfile.front
            );
          this.displayCoApplicant2ProfileImage =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.farmerProfile.front
            );
        });
    }
    $('input.formFileSm').val('');
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

      /* START: reading file and Patching the Selected File */
      let selectedImageFor = '';
      reader.readAsDataURL(file);
      reader.onload = () => {
        const imageSrc = reader.result;

        if (
          this.fileUpload.coaNo === 'coa1' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa1.panCard &&
          type == 'FRONT_IMAGE'
        ) {
          this.fileUpload.new.imageSrc1 = imageSrc;
          this.fileUpload.new.imageName1 = file.name;
          selectedImageFor = this.indexedDBFileNameManage.coa1.panCard.front;
        } else if (
          this.fileUpload.coaNo === 'coa2' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa2.panCard &&
          type == 'FRONT_IMAGE'
        ) {
          this.fileUpload.new.imageSrc1 = imageSrc;
          this.fileUpload.new.imageName1 = file.name;
          selectedImageFor = this.indexedDBFileNameManage.coa2.panCard.front;
        } else if (
          this.fileUpload.coaNo === 'coa1' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa1.aadhaarCard
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa1.aadhaarCard.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa1.aadhaarCard.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa2' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa2.aadhaarCard
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa2.aadhaarCard.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa2.aadhaarCard.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa1' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa1.drivingLicence
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa1.drivingLicence.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa1.drivingLicence.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa2' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa2.drivingLicence
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa2.drivingLicence.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa2.drivingLicence.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa1' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa1.voterId
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa1.voterId.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa1.voterId.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa2' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa2.voterId
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa2.voterId.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa2.voterId.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa1' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa1.passport
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa1.passport.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa1.passport.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa2' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa2.passport
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa2.passport.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa2.passport.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa1' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa1.NREGA
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa1.NREGA.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa1.NREGA.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa2' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa2.NREGA
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa2.NREGA.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            this.fileUpload.new.imageName2 = file.name;
            selectedImageFor = this.indexedDBFileNameManage.coa2.NREGA.back;
          }
        } else if (
          this.fileUpload.coaNo === 'coa1' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa1.farmerProfile
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa1.farmerProfile.front;
            this.displayCoApplicant1ProfileImage = imageSrc;
          }
        } else if (
          this.fileUpload.coaNo === 'coa2' &&
          this.fileUpload.fileFor === this.fileUploadFileFor.coa2.farmerProfile
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            this.fileUpload.new.imageName1 = file.name;
            selectedImageFor =
              this.indexedDBFileNameManage.coa2.farmerProfile.front;
            this.displayCoApplicant2ProfileImage = imageSrc;
          }
        }

        /* START: ngx-indexed-db feature to store files(images/docs) */
        // if file already exist then delete then add
        this.dbService
          .getByIndex(this.indexedDBName, 'fileFor', selectedImageFor)
          .subscribe((file: any) => {
            if (file && file !== undefined && Object.keys(file).length) {
              // delete if exists
              this.dbService
                .deleteByKey(this.indexedDBName, file.id)
                .subscribe((status) => { });
              // then add new
              this.dbService
                .add(this.indexedDBName, {
                  pageName: this.indexedDBPageName,
                  fileFor: selectedImageFor,
                  file: imageSrc,
                })
                .subscribe((key) => { });
            } else {
              // add new
              this.dbService
                .add(this.indexedDBName, {
                  pageName: this.indexedDBPageName,
                  fileFor: selectedImageFor,
                  file: imageSrc,
                })
                .subscribe((key) => { });
            }
          });
        /* END: ngx-indexed-db feature to store files(images/docs) */
      };
      /* END: reading file and Patching the Selected File */
    }
  }

  removeImage(event: any, type: string) {
    if (type === this.fileUploadFileFor.coa1.farmerProfile) {
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          this.indexedDBFileNameManage.coa1.farmerProfile.front
        )
        .subscribe((file: any) => {
          if (file && file !== undefined && Object.keys(file).length) {
            // delete if exists
            this.dbService
              .deleteByKey(this.indexedDBName, file.id)
              .subscribe((status) => {
                if (status) this.displayCoApplicant1ProfileImage = '';
              });
          }
        });
    } else if (type === this.fileUploadFileFor.coa2.farmerProfile) {
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          this.indexedDBFileNameManage.coa2.farmerProfile.front
        )
        .subscribe((file: any) => {
          if (file && file !== undefined && Object.keys(file).length) {
            // delete if exists
            this.dbService
              .deleteByKey(this.indexedDBName, file.id)
              .subscribe((status) => {
                if (status) this.displayCoApplicant2ProfileImage = '';
              });
          }
        });
    }
  }

  // getIndexedDBImage(type: string) {
  //   if (type == 'FARMER_PROFILE') {
  //     this.dbService
  //       .getByIndex(
  //         this.indexedDBName,
  //         'fileFor',
  //         this.indexedDBFileNameManage.coa1.farmerProfile.front
  //       )
  //       .subscribe((file: any) => {
  //         if (file && file !== undefined && Object.keys(file).length) {
  //           this.displayCoApplicant1ProfileImage = file.file;
  //         }
  //       });
  //   } else if (type == 'FARMER_PROFILEcoa2') {
  //     this.dbService
  //       .getByIndex(
  //         this.indexedDBName,
  //         'fileFor',
  //         this.indexedDBFileNameManage.coa2.farmerProfile.front
  //       )
  //       .subscribe((file: any) => {
  //         if (file && file !== undefined && Object.keys(file).length) {
  //           this.displayCoApplicant2ProfileImage = file.file;
  //         }
  //       });
  //   }
  // }
  /* END: functions used indexed-db ============================================ */

  // patch edit farmer details
  patchFarmerDetails() {
    // patch coapplicant-1 Profile image
    this.dbService
      .getByIndex(
        this.indexedDBName,
        'fileFor',
        `${this.indexedDBFileNameManage.coa1.farmerProfile.front}`
      )
      .subscribe((farmer: any) => {
        this.displayCoApplicant1ProfileImage =
          farmer?.file ||
          this.commonService.fetchFarmerDocument(
            this.indexedDBFileNameManage.coa1.farmerProfile.front
          );
      });
    // patch coapplicant-2 Profile image
    this.dbService
      .getByIndex(
        this.indexedDBName,
        'fileFor',
        `${this.indexedDBFileNameManage.coa2.farmerProfile.front}`
      )
      .subscribe((farmer: any) => {
        this.displayCoApplicant2ProfileImage =
          farmer?.file ||
          this.commonService.fetchFarmerDocument(
            this.indexedDBFileNameManage.coa2.farmerProfile.front
          );
      });

    // other details
    const A: any = localStorage.getItem('farmer-details');
    const coData = JSON.parse(A).co_applicant_details;
    const C1 = coData ? coData[0] : {};
    const C2 = coData ? coData[1] : {};

    console.log(coData);

    // assign kyc data to populate
    this.kycData.coa1 = C1.hasOwnProperty('kycData')
      ? C1.kycData
      : this.kycData.coa1;
    this.kycData.coa2 = C2.hasOwnProperty('kycData')
      ? C2.kycData
      : this.kycData.coa2;

    console.log(this.kycData);

    // Prefill: edit data
    this.coApplicantForm.patchValue({
      // Co-Applicant 1
      salutation: C1.farmerDetails['salutation'] || '',
      firstName: C1.farmerDetails['firstName'],
      middleName: C1.farmerDetails['middleName'],
      lastName: C1.farmerDetails['lastName'],
      dob: C1.farmerDetails['dob'],
      gender: C1.farmerDetails['gender'],
      religion: C1.farmerDetails['religion'],
      caste: C1.farmerDetails['caste'],

      educationalQualification: C1.otherDetails['educationalQualification'],
      occupation: C1.otherDetails['occupation'],
      annualIncome: C1.otherDetails['annualIncome'],

      address1: C1.address['addressLine1'],
      address2: C1.address['addressLine2'],
      pinCode: C1.address['pincode'],
      taluk: C1.address['taluk'],
      city: C1.address['city'],
      state: C1.address['state'],
      landmark: C1.address['landmark'],
      phoneNumber: C1.address['phoneNumber'],
      email: C1.address['email'],
      yrsInAddress: C1.address['yrsInAddress'],
      yrsInCity: C1.address['yrsInCity'],

      commOrPerAddress: C1.permAddress?.commOrPerAddress,
      permAddressLine1: C1.permAddress?.addressLine1,
      permAddressLine2: C1.permAddress?.addressLine2,
      permPincode: C1.permAddress?.pincode,
      permTaluk: C1.permAddress?.taluk,
      permCity: C1.permAddress?.city,
      permState: C1.permAddress?.state,

      propertyStatus: C1.propertyStatus,
      monthlyRent: C1.monthlyRent,
      familyMembers: C1.familyMembers,

      PANnumber: C1.identityProof['panNumber'],
      aadhaarNumber: C1.identityProof['aadhaarNumber'],
      drivingLicenceNumber: C1.identityProof['drivingLicenceNumber'],
      voterIdNumber: C1.identityProof['voterIdNumber'],
      passportNumber: C1.identityProof['passportNumber'],
      NREGANumber: C1.identityProof['NREGANumber'],

      // Co-Applicant 1
      salutationcoa2: C2.farmerDetails['salutation'] || '',
      firstNamecoa2: C2.farmerDetails['firstName'],
      middleNamecoa2: C2.farmerDetails['middleName'],
      lastNamecoa2: C2.farmerDetails['lastName'],
      dobcoa2: C2.farmerDetails['dob'],
      gendercoa2: C2.farmerDetails['gender'],
      religioncoa2: C2.farmerDetails['religion'],
      castecoa2: C2.farmerDetails['caste'],

      educationalQualificationcoa2: C2.otherDetails['educationalQualification'],
      occupationcoa2: C2.otherDetails['occupation'],
      annualIncomecoa2: C2.otherDetails['annualIncome'],

      address1coa2: C2.address['addressLine1'],
      address2coa2: C2.address['addressLine2'],
      pinCodecoa2: C2.address['pincode'],
      talukcoa2: C2.address['taluk'],
      citycoa2: C2.address['city'],
      statecoa2: C2.address['state'],
      landmarkcoa2: C2.address['landmark'],
      phoneNumbercoa2: C2.address['phoneNumber'],
      emailcoa2: C2.address['email'],
      yrsInAddresscoa2: C2.address['yrsInAddress'],
      yrsInCitycoa2: C2.address['yrsInCity'],

      commOrPerAddresscoa2: C2.permAddress?.commOrPerAddress,
      permAddressLine1coa2: C2.permAddress?.addressLine1,
      permAddressLine2coa2: C2.permAddress?.addressLine2,
      permPincodecoa2: C2.permAddress?.pincode,
      permTalukcoa2: C2.permAddress?.taluk,
      permCitycoa2: C2.permAddress?.city,
      permStatecoa2: C2.permAddress?.state,

      propertyStatuscoa2: C2.propertyStatus,
      monthlyRentcoa2: C2.monthlyRent,
      familyMemberscoa2: C2.familyMembers,

      PANnumbercoa2: C2.identityProof['panNumber'],
      aadhaarNumbercoa2: C2.identityProof['aadhaarNumber'],
      drivingLicenceNumbercoa2: C2.identityProof['drivingLicenceNumber'],
      voterIdNumbercoa2: C2.identityProof['voterIdNumber'],
      passportNumbercoa2: C2.identityProof['passportNumber'],
      NREGANumbercoa2: C2.identityProof['NREGANumber'],
    });

    if (C1.address['pincode']) {
      this.getPinCodeData(
        { target: { value: C1.address['pincode'] } },
        'ADDRESS'
      );
    }
    if (C1.permAddress?.pincode) {
      this.getPinCodeData(
        { target: { value: C1.permAddress?.pincode } },
        'PERMANENT_ADDRESS'
      );
    }

    if (C2.address['pincode']) {
      this.getPinCodeData(
        { target: { value: C2.address['pincode'] } },
        'ADDRESScoa2'
      );
    }
    if (C2.permAddress?.pincode) {
      this.getPinCodeData(
        { target: { value: C2.permAddress?.pincode } },
        'PERMANENT_ADDRESScoa2'
      );
    }
    this.familyMembers = this.coApplicantForm.get('familyMembers') as FormArray;
    C1.familyMembers.map((item: any) => {
      this.familyMembers.push(
        this.formBuilder.group({
          name: new FormControl(item.name),
          relation: new FormControl(item.relation),
          education: new FormControl(item.education),
          occupation: new FormControl(item.occupation),
          dependency: new FormControl(item.dependency),
        })
      );
    });
    this.familyMemberscoa2 = this.coApplicantForm.get(
      'familyMemberscoa2'
    ) as FormArray;
    C2.familyMembers.map((item: any) => {
      this.familyMemberscoa2.push(
        this.formBuilder.group({
          name: new FormControl(item.name),
          relation: new FormControl(item.relation),
          education: new FormControl(item.education),
          occupation: new FormControl(item.occupation),
          dependency: new FormControl(item.dependency),
        })
      );
    });
    // }
  }

  validateAndNext() {
    this.isSubmitted = true;

    const formValue = this.coApplicantForm.value;
    const coapparr = [] as any;
    const obj = {
      identityProof: {
        panNumber: formValue.PANnumber,
        aadhaarNumber: formValue.aadhaarNumber,
        drivingLicenceNumber: formValue.drivingLicenceNumber,
        voterIdNumber: formValue.voterIdNumber,
        passportNumber: formValue.passportNumber,
        NREGANumber: formValue.NREGANumber,
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
        phoneNumber: formValue.phoneNumber,
        email: formValue.email,
        yrsInAddress: formValue.yrsInAddress,
        yrsInCity: formValue.yrsInCity,
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
      propertyStatus: formValue.propertyStatus,
      monthlyRent: formValue.monthlyRent,
      familyMembers: formValue.familyMembers,

      kycData: this.kycData.coa1,
    };

    const objcoa2 = {
      identityProof: {
        panNumber: formValue.PANnumbercoa2,
        aadhaarNumber: formValue.aadhaarNumbercoa2,
        drivingLicenceNumber: formValue.drivingLicenceNumbercoa2,
        passportNumber: formValue.passportNumbercoa2,
        NREGANumber: formValue.NREGANumbercoa2,
        voterIdNumber: formValue.voterIdNumbercoa2,
      },

      farmerDetails: {
        salutation: formValue.salutationcoa2,
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
        taluk: formValue.talukcoa2,
        city: formValue.citycoa2,
        state: formValue.statecoa2,
        landmark: formValue.landmarkcoa2,
        phoneNumber: formValue.phoneNumbercoa2,
        email: formValue.emailcoa2,
        yrsInAddress: formValue.yrsInAddresscoa2,
        yrsInCity: formValue.yrsInCitycoa2,
      },

      permAddress: {
        commOrPerAddress: formValue.commOrPerAddresscoa2,
        addressLine1: formValue.permAddressLine1coa2,
        addressLine2: formValue.permAddressLine2coa2,
        pincode: formValue.permPincodecoa2,
        taluk: formValue.permTalukcoa2,
        city: formValue.permCitycoa2,
        state: formValue.permStatecoa2,
      },

      commOrPerAddress: formValue.commOrPerAddresscoa2,
      otherDetails: {
        educationalQualification: formValue.educationalQualificationcoa2,
        occupation: formValue.occupationcoa2,
        annualIncome: formValue.annualIncomecoa2,
      },
      familyMembers: formValue.familyMemberscoa2,
      propertyStatus: formValue.propertyStatuscoa2,
      monthlyRent: formValue.monthlyRentcoa2,

      kycData: this.kycData.coa2,
    };

    coapparr.push(obj);
    coapparr.push(objcoa2);

    if (this.farmerId) {
      localStorage.setItem('edit-co-applicant', JSON.stringify(coapparr));
      localStorage.setItem('edit-co-applicant-form', JSON.stringify(formValue));
    } else {
      localStorage.setItem('co-applicant', JSON.stringify(coapparr));
      localStorage.setItem('co-applicant-form', JSON.stringify(formValue));
    }
    if (this.coApplicantForm.invalid) {
      this.toastr.error('Please enter values for required fields', 'Error!');
      return;
    } else {
      const url = `/add/${this.nextRoute}/${this.farmerId}`;
      this.router.navigate([url]);
    }
  }
  objectKeyCount(object: any) {
    return object ? Object.keys(object).length : 0;
  }

  setSelectedValue(
    event: any,
    formCtlName: any,
    opt_val: any,
    valueType: string
  ) {
    if (valueType === 'manual') {
      this.coApplicantForm.get(formCtlName)?.setValue(event.target.value);
    } else if (valueType === 'list') {
      this.coApplicantForm.get(formCtlName)?.setValue(opt_val);
    }
  }
  /* END: NON-API Function Calls------------------------------------------------------------------------ */

  /* START: API Function Calls------------------------------------------------------------------------ */
  getPinCodeData(event: any, type: string) {
    // clear values
    if (type === 'ADDRESS' && !this.farmerId) {
      this.coApplicantForm.patchValue({
        city: '',
        state: '',
      });
      this.pinCodeAPIData.length = 0;
    } else if (type === 'ADDRESScoa2' && !this.farmerId) {
      this.coApplicantForm.patchValue({
        citycoa2: '',
        statecoa2: '',
      });
      this.pinCodeAPIDatacoa2.length = 0;
    } else if (type === 'PERMANENT_ADDRESS' && !this.farmerId) {
      this.coApplicantForm.patchValue({
        permCity: '',
        permState: '',
      });
      this.permPinCodeAPIData.length = 0;
    } else if (type === 'PERMANENT_ADDRESScoa2' && !this.farmerId) {
      this.coApplicantForm.patchValue({
        permCitycoa2: '',
        permStatecoa2: '',
      });
      this.permPinCodeAPIDatacoa2.length = 0;
    }

    // check length and proceed
    if (event && event.target.value.trim().length == 6) {
      this.spinner.show();
      this.commonService.getPinCodeData(event.target.value.trim()).subscribe(
        (res: any) => {
          this.spinner.hide();
          if (res && !res.status) {
            alert('Failed to fetch PinCode Details, please try again...');
          } else {
            if (type === 'ADDRESS') {
              this.pinCodeAPIData = res.data;

              this.coApplicantForm.patchValue({
                city: this.pinCodeAPIData[0].district_name,
                state: this.pinCodeAPIData[0].state_name,
              });
            } else if (type === 'ADDRESScoa2') {
              this.pinCodeAPIDatacoa2 = res.data;
              this.coApplicantForm.patchValue({
                citycoa2: this.pinCodeAPIDatacoa2[0].district_name,
                statecoa2: this.pinCodeAPIDatacoa2[0].state_name,
              });
            } else if (type === 'PERMANENT_ADDRESS') {
              this.permPinCodeAPIData = res.data;

              this.coApplicantForm.patchValue({
                permCity: this.permPinCodeAPIData[0].district_name,
                permState: this.permPinCodeAPIData[0].state_name,
              });
            } else if (type === 'PERMANENT_ADDRESScoa2') {
              this.permPinCodeAPIDatacoa2 = res.data;
              this.coApplicantForm.patchValue({
                permCitycoa2: this.permPinCodeAPIDatacoa2[0].district_name,
                permStatecoa2: this.permPinCodeAPIDatacoa2[0].state_name,
              });
            }
          }
        },
        (error: any) => {
          this.spinner.hide();
          if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
            this.logOut();
            return;
          } else {
            alert('Failed to fetch PinCode Details, please try again...');
          }
        }
      );
    }
  }

  editDynamicBindFormArray(fieldValues: any) {
    this.coApplicantForm.patchValue(fieldValues);
    this.familyMembers = this.coApplicantForm.get('familyMembers') as FormArray;
    fieldValues.familyMembers.map((item: any) => {
      this.familyMembers.push(
        this.formBuilder.group({
          name: new FormControl(item.name),
          relation: new FormControl(item.relation),
          education: new FormControl(item.education),
          occupation: new FormControl(item.occupation),
          dependency: new FormControl(item.dependency),
        })
      );
    });
    this.familyMemberscoa2 = this.coApplicantForm.get(
      'familyMemberscoa2'
    ) as FormArray;
    fieldValues.familyMemberscoa2.map((item: any) => {
      this.familyMemberscoa2.push(
        this.formBuilder.group({
          name: new FormControl(item.name),
          relation: new FormControl(item.relation),
          education: new FormControl(item.education),
          occupation: new FormControl(item.occupation),
          dependency: new FormControl(item.dependency),
        })
      );
    });
  }

  /* PAN,Voter ID,Driving Licence EKYC related : start */
  getKycData(event: any, coaNo: string, proofType: string) {
    let INPUT_OBJ = {};
    // PAN Card
    if (proofType === this.kycProofNames.coa1.pan && coaNo === 'coa1') {
      const A = this.coApplicantForm.value.PANnumber;
      if (!A) {
        this.toastr.info('please enter PAN number', 'Info!');
        return;
      } else if (
        this.f['PANnumber'].errors &&
        this.f['PANnumber'].errors['invalidPanNumber']
      ) {
        this.toastr.info(' Please enter valid PAN Number', 'Info!');
        return;
      }
      INPUT_OBJ = {
        id_type: 'PAN',
        id_no: this.coApplicantForm.value.PANnumber,
      };
    } else if (proofType === this.kycProofNames.coa2.pan && coaNo === 'coa2') {
      const A = this.coApplicantForm.value.PANnumbercoa2;
      if (!A) {
        this.toastr.info('please enter PAN number', 'Info!');
        return;
      } else if (
        this.f['PANnumbercoa2'].errors &&
        this.f['PANnumbercoa2'].errors['invalidPanNumber']
      ) {
        this.toastr.info(' Please enter valid PAN Number', 'Info!');
        return;
      }
      INPUT_OBJ = {
        id_type: 'PAN',
        id_no: this.coApplicantForm.value.PANnumbercoa2,
      };
    }
    // VOTER ID
    else if (
      proofType === this.kycProofNames.coa1.voter_id &&
      coaNo === 'coa1'
    ) {
      const A = this.coApplicantForm.value.voterIdNumber;
      if (!A) {
        this.toastr.info('please enter Voter Id Number', 'Info!');
        return;
      }
      INPUT_OBJ = {
        id_type: 'VOTER_ID',
        id_no: this.coApplicantForm.value.voterIdNumber,
      };
    } else if (
      proofType === this.kycProofNames.coa2.voter_id &&
      coaNo === 'coa2'
    ) {
      const A = this.coApplicantForm.value.voterIdNumbercoa2;
      if (!A) {
        this.toastr.info('please enter Voter Id Number', 'Info!');
        return;
      }
      INPUT_OBJ = {
        id_type: 'VOTER_ID',
        id_no: this.coApplicantForm.value.voterIdNumbercoa2,
      };
    }
    // DRIVING_LICENSE
    else if (
      proofType === this.kycProofNames.coa1.driving_licence &&
      coaNo === 'coa1'
    ) {
      const A = this.coApplicantForm.value.drivingLicenceNumber;
      if (!A) {
        this.toastr.info('please enter Driving Licence Number', 'Info!');
        return;
      }

      const B = this.coApplicantForm.value.dob;
      if (!B) {
        this.toastr.info(
          'please select Date Of Birth as per Driving Licence',
          'Info!'
        );
        return;
      }
      // convert date farmat from 'YYYY-MM-DD' to 'dd/MM/yyyy'
      // const C = this.coApplicantForm.value.dob.split('-');
      let dob = formatDate(this.coApplicantForm.value.dob, 'dd/MM/yyyy', 'en_IN') as string;
      INPUT_OBJ = {
        id_type: 'DRIVING_LICENSE',
        id_no: this.coApplicantForm.value.drivingLicenceNumber,
        dob: `${dob}`,
        // dob: `${C[1]}/${C[2]}/${C[0]}`,
      };
      console.log('INPUT_OBJ : ', INPUT_OBJ);
    } else if (
      proofType === this.kycProofNames.coa2.driving_licence &&
      coaNo === 'coa2'
    ) {
      const A = this.coApplicantForm.value.drivingLicenceNumbercoa2;
      if (!A) {
        this.toastr.info('please enter Driving Licence Number', 'Info!');
        return;
      }

      const B = this.coApplicantForm.value.dobcoa2;
      if (!B) {
        this.toastr.info(
          'please select Date Of Birth as per Driving Licence',
          'Info!'
        );
        return;
      }
      // convert date farmat from 'YYYY-MM-DD' to 'dd/MM/yyyy'
      // const C = this.coApplicantForm.value.dobcoa2.split('-');
      let dob = formatDate(this.coApplicantForm.value.dobcoa2, 'dd/MM/yyyy', 'en_IN') as string;
      INPUT_OBJ = {
        id_type: 'DRIVING_LICENSE',
        id_no: this.coApplicantForm.value.drivingLicenceNumbercoa2,
        dob: `${dob}`,
        // dob: `${C[1]}/${C[2]}/${C[0]}`,
      };
      console.log('INPUT_OBJ : ', INPUT_OBJ);
    }

    this.spinner.show();
    this.commonService.getKycData(INPUT_OBJ).subscribe(
      (res: any) => {
        this.spinner.hide();

        // PAN Card - COA1
        if (proofType === this.kycProofNames.coa1.pan) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(coaNo, proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty('full_name')) {
            this.toastr.info(`Invalid PAN Number`, 'Info!');
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }
        // PAN Card - COA2
        if (proofType === this.kycProofNames.coa2.pan) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(coaNo, proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty('full_name')) {
            this.toastr.info(`Invalid PAN Number`, 'Info!');
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }

        // VOTER ID - COA1
        if (proofType === this.kycProofNames.coa1.voter_id) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(coaNo, proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty('name')) {
            this.toastr.info(`Invalid Voter Id Number`, 'Info!');
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        } // VOTER ID - COA2
        if (proofType === this.kycProofNames.coa2.voter_id) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(coaNo, proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty('name')) {
            this.toastr.info(`Invalid Voter Id Number`, 'Info!');
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }

        // DRIVING_LICENSE - COA1
        if (proofType === this.kycProofNames.coa1.driving_licence) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(coaNo, proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty("Holder's Name")) {
            this.toastr.info(`Invalid Driving Licence Number`, 'Info!');
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        } // DRIVING_LICENSE - COA2
        if (proofType === this.kycProofNames.coa2.driving_licence) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(coaNo, proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty("Holder's Name")) {
            this.toastr.info(`Invalid Driving Licence Number`, 'Info!');
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              coaNo,
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }
      },
      (error: any) => {
        this.spinner.hide();
        if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
          this.logOut();
          return;
        } else {
          alert('Failed to fetch KYC Details, please try again...');
          this.setKycDataVariables(coaNo, proofType, 'api_failed', '');
        }
      }
    );
  }

  logOut() {
    this.oauthService.logOut();
    this.router.navigate(['/']);
  }

  setKycDataVariables(
    coaNo: string,
    proofType: string,
    type: string,
    apiData = {}
  ) {
    if (type === 'api_failed') {
      this.kycData[coaNo][proofType].data = {};
      this.kycData[coaNo][proofType].showVerify = false;
      this.kycData[coaNo][proofType].showTryAgain = true;
      this.kycData[coaNo][proofType].showConfirm = false;
      this.kycData[coaNo][proofType].isVerified = false;
    } else if (type === 'api_success_invalid_data') {
      this.kycData[coaNo][proofType].data = {};
      this.kycData[coaNo][proofType].showVerify = false;
      this.kycData[coaNo][proofType].showTryAgain = true;
      this.kycData[coaNo][proofType].showConfirm = false;
      this.kycData[coaNo][proofType].isVerified = false;
    } else if (type === 'api_success_valid_data') {
      this.kycData[coaNo][proofType].data = apiData;
      this.kycData[coaNo][proofType].showVerify = true;
      this.kycData[coaNo][proofType].showTryAgain = false;
      this.kycData[coaNo][proofType].showConfirm = true;
      this.kycData[coaNo][proofType].isVerified = false;
    } else if (type === 'confirm') {
      this.kycData[coaNo][proofType].showVerify = false;
      this.kycData[coaNo][proofType].showTryAgain = false;
      this.kycData[coaNo][proofType].showConfirm = false;
      this.kycData[coaNo][proofType].isVerified = true;
    }
  }
  /* PAN,Voter ID,Driving Licence EKYC related : end */

  /* Aadhaar EKYC related : start */
  getAadhaarEkycVerification(event: any, coaNo: string, proofType: string) {
    let INPUT_OBJ = {};

    // Aadhaar Card
    if (proofType === this.kycProofNames.coa1.aadhaar && coaNo === 'coa1') {
      /*  
      // checking for Aadhaar Mandatory is not required
      const aadhaarInput = this.coApplicantForm.value.aadhaarNumber;
      if (!aadhaarInput) {
        this.toastr.info('please enter Aadhaar Number', 'Info!');
        return;
      } else if (aadhaarInput && aadhaarInput.length !== 12) {
        this.toastr.info('please enter 12 digit valid Aadhaar Number', 'Info!');
        return;
      } else */

      const phoneNumberInput = this.coApplicantForm.value.phoneNumber;
      if (
        !phoneNumberInput ||
        (phoneNumberInput && phoneNumberInput.trim().length !== 10)
      ) {
        this.toastr.info('please enter your 10 digit Mobile Number', 'Info!');
        return;
      }
      INPUT_OBJ = {
        mobile_no: phoneNumberInput,
      };
    } else if (
      proofType === this.kycProofNames.coa2.aadhaar &&
      coaNo === 'coa2'
    ) {
      /*
      // checking for Aadhaar Mandatory is not required
      const aadhaarInput = this.coApplicantForm.value.aadhaarNumbercoa2;
      if (!aadhaarInput) {
        this.toastr.info('please enter Aadhaar Number', 'Info!');
        return;
      } else if (aadhaarInput && aadhaarInput.length !== 12) {
        this.toastr.info('please enter 12 digit valid Aadhaar Number', 'Info!');
        return;
      } else */

      const phoneNumberInput = this.coApplicantForm.value.phoneNumbercoa2;
      if (
        !phoneNumberInput ||
        (phoneNumberInput && phoneNumberInput.trim().length !== 10)
      ) {
        this.toastr.info('please enter your 10 digit Mobile Number', 'Info!');
        return;
      }
      INPUT_OBJ = {
        mobile_no: phoneNumberInput,
      };
    }
    this.spinner.show();
    this.commonService.getAadhaarEkycVerification(INPUT_OBJ).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (
          ['coa1', 'coa2'].includes(coaNo) &&
          (proofType === this.kycProofNames.coa1.aadhaar ||
            proofType === this.kycProofNames.coa2.aadhaar)
        ) {
          if (res && !res.status) {
            this.toastr.info(`${res.message}`, 'Info!');
            this.setAadhaarEkycDataVariables(
              coaNo,
              'api_1',
              proofType,
              'api_failed',
              ''
            );
          } else if (
            !res.data.hasOwnProperty('kId') ||
            !res.data.hasOwnProperty('redirect_url')
          ) {
            this.toastr.info(`Invalid Aadhaar Card Number`, 'Info!');
            this.setAadhaarEkycDataVariables(
              coaNo,
              'api_1',
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setAadhaarEkycDataVariables(
              coaNo,
              'api_1',
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }
      },
      (error: any) => {
        this.spinner.hide();
        if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
          this.logOut();
          return;
        } else {
          alert('Failed to fetch KYC Details, please try again...');
          this.setAadhaarEkycDataVariables(coaNo, 'api_1', proofType, 'api_failed', '');
        }
      }
    );
  }
  getAadhaarDetails(event: any, coaNo: string, proofType: string) {
    let INPUT_OBJ = {};
    if (proofType === this.kycProofNames.coa1.aadhaar && coaNo === 'coa1') {
      INPUT_OBJ = {
        kId: this.kycData.coa1.aadhaar.verificationLinkData['kId'],
      };
    } else if (
      proofType === this.kycProofNames.coa2.aadhaar &&
      coaNo === 'coa2'
    ) {
      INPUT_OBJ = {
        kId: this.kycData.coa2.aadhaar.verificationLinkData['kId'],
      };
    }
    this.spinner.show();
    this.commonService.getAadhaarDetails(INPUT_OBJ).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (
          ['coa1', 'coa2'].includes(coaNo) &&
          (proofType === this.kycProofNames.coa1.aadhaar ||
            proofType === this.kycProofNames.coa2.aadhaar)
        ) {
          if (
            res &&
            (!res.status || (res.status && res.data && res.data.code))
          ) {
            this.toastr.info(`${res.message}`, 'Info!');
            this.setAadhaarEkycDataVariables(
              coaNo,
              'api_2',
              proofType,
              'api_failed',
              ''
            );
          } else if (
            res.data &&
            res.data.actions &&
            Array.isArray(res.data.actions) &&
            res.data.actions.length &&
            res.data.actions[0].details &&
            !Object.keys(res.data.actions[0].details).length
          ) {
            this.toastr.info(
              `Please complete the verification process`,
              'Info!'
            );
            this.setAadhaarEkycDataVariables(
              coaNo,
              'api_2',
              proofType,
              'api_success_invalid_data',
              ''
            );
          } else if (
            res.data &&
            res.data.actions &&
            Array.isArray(res.data.actions) &&
            res.data.actions.length &&
            res.data.actions[0].details &&
            res.data.actions[0].details.aadhaar
          ) {
            this.toastr.info(
              `Please verify the Aadhaar details and confirm to complete the process`,
              'Info!'
            );
            this.setAadhaarEkycDataVariables(
              coaNo,
              'api_2',
              proofType,
              'api_success_valid_data',
              res.data
            );
          } else {
            this.setAadhaarEkycDataVariables(
              coaNo,
              'api_2',
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }
      },
      (error: any) => {
        this.spinner.hide();
        if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
          this.logOut();
          return;
        } else {
          alert('Failed to fetch KYC Details, please try again...');
          this.setAadhaarEkycDataVariables(coaNo, 'api_2', proofType, 'api_failed', '');
        }
      }
    );
  }

  setAadhaarEkycDataVariables(
    coaNo: string,
    apiCalled: string,
    proofType: string,
    type: string,
    apiData: any
  ) {
    if (apiCalled === 'api_1') {
      if (type === 'api_failed') {
        this.kycData[coaNo][proofType].verificationLinkData = {};
        this.kycData[coaNo][proofType].data = {};
        this.kycData[coaNo][proofType].showVerify = false;
        this.kycData[coaNo][proofType].showTryAgain = true;
        this.kycData[coaNo][proofType].showConfirm = false;
        this.kycData[coaNo][proofType].isVerified = false;
      } else if (type === 'api_success_invalid_data') {
        this.kycData[coaNo][proofType].verificationLinkData = {};
        this.kycData[coaNo][proofType].data = {};
        this.kycData[coaNo][proofType].showVerify = false;
        this.kycData[coaNo][proofType].showTryAgain = true;
        this.kycData[coaNo][proofType].showConfirm = false;
        this.kycData[coaNo][proofType].isVerified = false;
      } else if (type === 'api_success_valid_data') {
        this.kycData[coaNo][proofType].verificationLinkData = apiData;
        this.kycData[coaNo][proofType].data = {};
        this.kycData[coaNo][proofType].showVerify = true;
        this.kycData[coaNo][proofType].showTryAgain = false;
        this.kycData[coaNo][proofType].showConfirm = false;
        this.kycData[coaNo][proofType].isVerified = false;
      }
    } else if (apiCalled === 'api_2') {
      if (type === 'api_failed') {
        this.kycData[coaNo][proofType].data = {};
        this.kycData[coaNo][proofType].showVerify = false;
        this.kycData[coaNo][proofType].showTryAgain = true;
        this.kycData[coaNo][proofType].showConfirm = false;
        this.kycData[coaNo][proofType].isVerified = false;
      } else if (type === 'api_success_invalid_data') {
        this.kycData[coaNo][proofType].data = {};
        this.kycData[coaNo][proofType].showVerify = false;
        this.kycData[coaNo][proofType].showTryAgain = true;
        this.kycData[coaNo][proofType].showConfirm = false;
        this.kycData[coaNo][proofType].isVerified = false;
      } else if (type === 'api_success_valid_data') {
        this.kycData[coaNo][proofType].data = apiData;
        this.kycData[coaNo][proofType].showVerify = true;
        this.kycData[coaNo][proofType].showTryAgain = false;
        this.kycData[coaNo][proofType].showConfirm = true;
        this.kycData[coaNo][proofType].isVerified = false;
        // prefill the First Name from Aadhaar Data
        if (!this.farmerId && proofType === 'aadhaar' && coaNo === 'coa1' && apiData?.actions[0].details.aadhaar.name) {
          let aadhaar_name = apiData?.actions[0].details.aadhaar.name;
          let aadhaar_name_arr = aadhaar_name.toString().split(" ");
          if (aadhaar_name_arr.length >= 1) {
            this.coApplicantForm.get('firstName')?.setValue(aadhaar_name_arr[0]);
          }
          if (aadhaar_name_arr.length >= 2) {
            this.coApplicantForm.get('middleName')?.setValue(aadhaar_name_arr[1]);
          }
          if (aadhaar_name_arr.length >= 3) {
            let lastName = '';
            for (let i = 2; i < aadhaar_name_arr.length; i++) {
              lastName = + aadhaar_name_arr[i] + ' ';
            }
            this.coApplicantForm.get('lastName')?.setValue(lastName);
          }
        }
        if (!this.farmerId && proofType === 'aadhaar' && coaNo === 'coa2' && apiData?.actions[0].details.aadhaar.name) {
          let aadhaar_name = apiData?.actions[0].details.aadhaar.name;
          let aadhaar_name_arr = aadhaar_name.toString().split(" ");
          if (aadhaar_name_arr.length >= 1) {
            this.coApplicantForm.get('firstNamecoa2')?.setValue(aadhaar_name_arr[0]);
          }
          if (aadhaar_name_arr.length >= 2) {
            this.coApplicantForm.get('middleNamecoa2')?.setValue(aadhaar_name_arr[1]);
          }
          if (aadhaar_name_arr.length >= 3) {
            let lastName = '';
            for (let i = 2; i < aadhaar_name_arr.length; i++) {
              lastName = + aadhaar_name_arr[i] + ' ';
            }
            this.coApplicantForm.get('lastNamecoa2')?.setValue(lastName);
          }
        }
      } else if (type === 'confirm') {
        this.kycData[coaNo][proofType].showVerify = false;
        this.kycData[coaNo][proofType].showTryAgain = false;
        this.kycData[coaNo][proofType].showConfirm = false;
        this.kycData[coaNo][proofType].isVerified = true;
      }
    }
  }
  /* Aadhaar EKYC related : end */

  /* END: API Function Calls------------------------------------------------------------------------ */
}
