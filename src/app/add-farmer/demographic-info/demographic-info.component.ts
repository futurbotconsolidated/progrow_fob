import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { tap } from 'rxjs/operators';
import { CommonService } from '../../shared/common.service';
import { NgxIndexedDBService } from 'ngx-indexed-db';
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
export class DemographicInfoComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  /* START: Varaibles ------------------------------------------------- */
  private observableSubscription: any;

  demoGraphicMaster = <any>{};
  isSubmitted = false;
  fileUpload = {
    fileFor: '',
    popupTitle: '',
    new: {
      imageSrc1: '',
      imageSrc2: '',
      imageMultiple: [] as any,
      isImage1Required: true,
      isImage2Required: false,
      isMultiple: false,
      fileIndex: 0,
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

  /* START: indexed db variables */
  displayFarmerProfileImage = '' as any;
  indexedDBPageName = 'demographic_info';
  concatePage = 'demographic';
  indexedDBName = 'registerFarmer';
  indexedDBFileNameManage = {
    panCard: {
      front: `${this.concatePage}_PANCardFront`,
      back: '',
    },
    aadhaarCard: {
      front: `${this.concatePage}_AadhaarCardFront`,
      back: `${this.concatePage}_AadhaarCardBack`,
    },
    drivingLicence: {
      front: `${this.concatePage}_DrivingLicenceFront`,
      back: `${this.concatePage}_DrivingLicenceBack`,
    },

    /*
    addressProof: {
      front: `${this.concatePage}_addressProofFront`,
      back: `${this.concatePage}_addressProofBack`,
    },
    */
    voterId: {
      front: `${this.concatePage}_voterIdFront`,
      back: `${this.concatePage}_voterIdBack`,
    },
    passport: {
      front: `${this.concatePage}_passportFront`,
      back: `${this.concatePage}_passportBack`,
    },
    NREGA: {
      front: `${this.concatePage}_NREGAFront`,
      back: `${this.concatePage}_NREGABack`,
    },

    farmerProfile: { front: `${this.concatePage}_farmerProfileImage` },
    ownershipPicture: { front: `${this.concatePage}_ownershipPictureImage`,
    count: `${this.concatePage}_ownershipPictureImageCount`
   },
  };
  fileUploadFileFor = {
    panCard: 'PAN',
    aadhaarCard: 'AADHAAR',
    drivingLicence: 'DRIVING_LICENCE',
    voterId: 'VOTERID',
    passport: 'PASSPORT',
    NREGA: 'NREGA',
    farmerProfile: 'FARMER_PROFILE',
    ownershipPicture: 'OWENERSHIP_PICTURE',
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
    pan: 'pan',
    aadhaar: 'aadhaar',
    driving_licence: 'driving_licence',
    voter_id: 'voter_id',
    passport: 'passport',
    nrega: 'nrega',
  };

  kycData = {
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
  } as any;
  /* END: KYC Data Structure & Related Variables */

  /* END: Varaibles ------------------------------------------------- */

  constructor(
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
    this.demographicInfoForm = this.formBuilder.group({
      salutation: new FormControl(''),
      firstName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      lastName: new FormControl(''),
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
        Validators.minLength(10),
        Validators.maxLength(10),
        Validators.pattern('^[0-9]*$'),
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
      familyMembers: new FormArray([]),
      propertyOwnership: new FormArray([]),
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

      // addressProof: new FormControl('', [Validators.required]),
      PANnumber: new FormControl('', [validatePANNumber]),
      aadhaarNumber: new FormControl('', [
        Validators.minLength(12),
        Validators.maxLength(12),
      ]),
      drivingLicenceNumber: new FormControl(''),
      voterIdNumber: new FormControl(''),
      passportNumber: new FormControl(''),
      NREGANumber: new FormControl(''),
    });

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }

  /* START: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */
  ngOnInit(): void {
    this.demoGraphicMaster = data.demoGraphic; // read master data

    // populate
    this.commonService.fetchFarmerDocument(
      this.indexedDBFileNameManage.farmerProfile.front
    );

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
      // assign kyc data to populate
      const demoInfoRaw: any = localStorage.getItem('edit-demographic-info');
      if (demoInfoRaw && JSON.parse(demoInfoRaw).kycData) {
        this.kycData = JSON.parse(demoInfoRaw).kycData;
      }

      // assign other data to populate
      let editForm: any = localStorage.getItem('edit-demographic-info-form');
      if (editForm) {
        editForm = JSON.parse(editForm);        
        this.patchFarmerDetails(editForm);
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

        // patch farmer Profile image
        this.dbService
          .getByIndex(
            this.indexedDBName,
            'fileFor',
            `${this.indexedDBFileNameManage.farmerProfile.front}`
          )
          .subscribe((farmer: any) => {
            this.displayFarmerProfileImage =
              farmer?.file ||
              this.commonService.fetchFarmerDocument(
                this.indexedDBFileNameManage.farmerProfile.front
              );
          });
      } else {
        const farmerDetails: any = localStorage.getItem('farmer-details');
        if (farmerDetails) {
          let demoInfo = JSON.parse(farmerDetails).demographic_info;        
          this.patchFarmerDetails(demoInfo); // bind/patch fresh api data
        }
      }
    } else {
      // assign kyc data to populate
      const demoInfoRaw: any = localStorage.getItem('demographic-info');
      if (demoInfoRaw && JSON.parse(demoInfoRaw).kycData) {
        this.kycData = JSON.parse(demoInfoRaw).kycData;
      }

      // assign other data to populate
      let demoInfo: any = localStorage.getItem('demographic-info-form');
      if (demoInfo) {
        demoInfo = JSON.parse(demoInfo);
        this.patchFarmerDetails(demoInfo);
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

        // this.familyMembers = this.demographicInfoForm.get(
        //   'familyMembers'
        // ) as FormArray;
        // demoInfo.familyMembers.forEach((x: any) => {
        //   this.demographicInfoForm.controls.familyMembers.push({
        //     name: new FormControl(x.name),
        //     relation: new FormControl(''),
        //     education: new FormControl(''),
        //     occupation: new FormControl(''),
        //     dependency: new FormControl(''),
        //   }
        // });
      }
    }
    if(!(this.demographicInfoForm.get('propertyOwnership') as FormArray).controls.length){
      this.addPropertyOwnership();
    }
    if(!(this.demographicInfoForm.get('familyMembers') as FormArray).controls.length){
      this.addFamilyMembers();
    }
  }
  ngAfterViewInit(): void {
    /** subscribe to Observables, which are triggered from header selections*/
    this.observableSubscription = this.addFarmerService
      .getMessage()
      .subscribe((data) => {
        this.nextRoute = data.routeName;
        if (this.router.url?.includes('/add/demographic-info')) {
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
    return this.demographicInfoForm.controls;
  }
  get val() {
    return this.demographicInfoForm.value;
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

  /* START: functions used indexed-db ============================================ */
  openFileModalPopup(type: string, fileIndex: number) {
    this.fileUpload.fileFor = type;
    this.fileUpload.new.imageSrc1 = '';
    this.fileUpload.new.imageSrc2 = '';
    this.fileUpload.new.imageMultiple = [];
    this.fileUpload.new.isImage1Required = false;
    this.fileUpload.new.isImage2Required = false;
    this.fileUpload.new.isMultiple = false;
    this.fileUpload.new.fileIndex = fileIndex;
    this.fileUpload.imageHeading1 = 'Front Image';
    this.fileUpload.imageHeading2 = 'Back Image';

    if (type === this.fileUploadFileFor.panCard) {
      if (!this.demographicInfoForm.value.PANnumber) {
        this.toastr.error('please enter PAN Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload PAN Card Image';
      this.fileUpload.new.isImage1Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.panCard.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.panCard.front
            );
        });
    }

    //  CURRENTLY NOT USING - DO NOT DELETE
    /* else if (type === 'ADDRESS_PROOF') {
      if (!this.demographicInfoForm.value.addressProof) {
        this.toastr.error('please select Address Proof Type.', 'Error!');
        return;
      }
      const A = this.demographicInfoForm.value.addressProof;
      this.fileUpload.popupTitle = `Upload ${A || ''} Image`;
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.addressProof.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.addressProof.front
            );
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.addressProof.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.addressProof.back
            );
        });
    } */
    else if (type === this.fileUploadFileFor.aadhaarCard) {
      if (!this.demographicInfoForm.value.aadhaarNumber) {
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
          `${this.indexedDBFileNameManage.aadhaarCard.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.aadhaarCard.front
            );
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.aadhaarCard.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.aadhaarCard.back
            );
        });
    } else if (type === this.fileUploadFileFor.drivingLicence) {
      if (!this.demographicInfoForm.value.drivingLicenceNumber) {
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
          `${this.indexedDBFileNameManage.drivingLicence.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.drivingLicence.front
            );
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.drivingLicence.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.drivingLicence.back
            );
        });
    } else if (type === this.fileUploadFileFor.voterId) {
      if (!this.demographicInfoForm.value.voterIdNumber) {
        this.toastr.error('please enter Voter Id Number.', 'Error!');
        return;
      }
      this.fileUpload.popupTitle = 'Upload Voter Id Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.voterId.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.voterId.front
            );
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.voterId.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.voterId.back
            );
        });
    } else if (type === this.fileUploadFileFor.passport) {
      if (!this.demographicInfoForm.value.passportNumber) {
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
          `${this.indexedDBFileNameManage.passport.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.passport.front
            );
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.passport.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.passport.back
            );
        });
    } else if (type === this.fileUploadFileFor.NREGA) {
      if (!this.demographicInfoForm.value.NREGANumber) {
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
          `${this.indexedDBFileNameManage.NREGA.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.NREGA.front
            );
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.NREGA.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.NREGA.back
            );
        });
    } else if (type === this.fileUploadFileFor.farmerProfile) {
      this.fileUpload.popupTitle = 'Upload Farmer Profile Image';
      this.fileUpload.imageHeading1 = 'Farmer Image';
      this.fileUpload.new.isImage1Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.farmerProfile.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.farmerProfile.front
            );
          this.displayFarmerProfileImage = farmer?.file;
        });
    } else if (type === this.fileUploadFileFor.ownershipPicture) {
      this.fileUpload.popupTitle = 'Upload Ownership Picture Image';
      this.fileUpload.imageHeading1 = 'Ownership Picture Image';
      this.fileUpload.new.isMultiple = true; 
      var fCount = 0;  
      let demoInfoFiles:any = localStorage.getItem('demo-info-files');
      if(demoInfoFiles){
        demoInfoFiles = JSON.parse(demoInfoFiles);
        let difkey = this.indexedDBFileNameManage.ownershipPicture.count+'_'+this.fileUpload.new.fileIndex;
        if(demoInfoFiles[difkey]){
          fCount = demoInfoFiles[difkey];
        }
      }
      if(!fCount){
        let farmerFiles:any = localStorage.getItem('farmer-files');
        if(farmerFiles){
          farmerFiles = JSON.parse(farmerFiles);
          for (let ffi = 0; ffi < Object.keys(farmerFiles).length; ffi++) {
            if (farmerFiles.hasOwnProperty(this.indexedDBFileNameManage.ownershipPicture.front+'_'+this.fileUpload.new.fileIndex+'_'+ffi)){ 
              fCount++;  
            }
          }
        }
      }
      for (let fIndex = 0; fIndex < fCount; fIndex++) {
        this.dbService
          .getByIndex(
            this.indexedDBName,
            'fileFor',
            `${this.indexedDBFileNameManage.ownershipPicture.front+'_'+this.fileUpload.new.fileIndex+'_'+fIndex}`
          )
          .subscribe((farmer: any) => {
            let ownershipPicture =
              farmer?.file ||
              this.commonService.fetchFarmerDocument(
                this.indexedDBFileNameManage.ownershipPicture.front+'_'+this.fileUpload.new.fileIndex+'_'+fIndex
              );
              if(ownershipPicture){
                this.fileUpload.new.imageMultiple.push(ownershipPicture);
              }
          });
      }
    }
    $('#fileUploadModalPopup').modal('show');
  }

  onFileChange(event: any, type = '', fileIndex: number) {
    if (event.target.files && event.target.files.length) {
      if (
        this.fileUpload.fileFor === this.fileUploadFileFor.ownershipPicture
      ) {
        this.fileUpload.new.fileIndex = fileIndex;
      this.fileUpload.new.imageMultiple = []; 
      var fCount = 0;  
      let demoInfoFiles:any = localStorage.getItem('demo-info-files');
      if(demoInfoFiles){
        demoInfoFiles = JSON.parse(demoInfoFiles);
        let difkey = this.indexedDBFileNameManage.ownershipPicture.count+'_'+this.fileUpload.new.fileIndex;
        if(demoInfoFiles[difkey]){
          fCount = demoInfoFiles[difkey];
        }
      }
      for (let fIndex = 0; fIndex < fCount; fIndex++) {  
      this.dbService
          .getByIndex(this.indexedDBName, 'fileFor', this.indexedDBFileNameManage.ownershipPicture.front+'_'+this.fileUpload.new.fileIndex+'_'+fIndex)
          .subscribe((file: any) => {
            if (file && file !== undefined && Object.keys(file).length) {
              // delete if exists
              this.dbService
                .deleteByKey(this.indexedDBName, file.id)
                .subscribe((status) => {});
            }
          });
        }
      }
      for (let findex = 0; findex < event.target.files.length; findex++) {       
      const file = event.target.files[findex];   

      // if (file.size > 300000) {
      //   this.toastr.error('Image size can be upto 300KB Maximum.', 'Error!');
      //   return;
      // }
      if (file.type.split('/')[0] != 'image') {
        this.toastr.error('Only Image files are allowed.', 'Error!');
        return;
      }

      /* START: reading file and Patching the Selected File */
      const reader = new FileReader();
      let selectedImageFor = '';
      reader.readAsDataURL(file);
      reader.onload = () => {
        const imageSrc = reader.result;

        if (
          this.fileUpload.fileFor === this.fileUploadFileFor.panCard &&
          type == 'FRONT_IMAGE'
        ) {
          this.fileUpload.new.imageSrc1 = imageSrc;
          selectedImageFor = this.indexedDBFileNameManage.panCard.front;
        } else if (
          this.fileUpload.fileFor === this.fileUploadFileFor.aadhaarCard
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.aadhaarCard.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.aadhaarCard.back;
          }
        } else if (
          this.fileUpload.fileFor === this.fileUploadFileFor.drivingLicence
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor =
              this.indexedDBFileNameManage.drivingLicence.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.drivingLicence.back;
          }
        } else if (this.fileUpload.fileFor === this.fileUploadFileFor.voterId) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.voterId.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.voterId.back;
          }
        } else if (
          this.fileUpload.fileFor === this.fileUploadFileFor.passport
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.passport.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.passport.back;
          }
        } else if (this.fileUpload.fileFor === this.fileUploadFileFor.NREGA) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.NREGA.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.NREGA.back;
          }
        } else if (
          this.fileUpload.fileFor === this.fileUploadFileFor.farmerProfile
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.farmerProfile.front;
            this.displayFarmerProfileImage = imageSrc;
          }
        } else if (
          this.fileUpload.fileFor === this.fileUploadFileFor.ownershipPicture
        ) {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageMultiple.push(imageSrc);
            selectedImageFor = this.indexedDBFileNameManage.ownershipPicture.front+'_'+this.fileUpload.new.fileIndex+'_'+findex;         
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
                .subscribe((status) => {});
              // then add new
              this.dbService
                .add(this.indexedDBName, {
                  pageName: this.indexedDBPageName,
                  fileFor: selectedImageFor,
                  file: imageSrc,
                })
                .subscribe((key) => {});
            } else {
              // add new
              this.dbService
                .add(this.indexedDBName, {
                  pageName: this.indexedDBPageName,
                  fileFor: selectedImageFor,
                  file: imageSrc,
                })
                .subscribe((key) => {});
            }
          });
        /* END: ngx-indexed-db feature to store files(images/docs) */
      };
      /* END: reading file and Patching the Selected File */
      if (
        this.fileUpload.fileFor !== this.fileUploadFileFor.ownershipPicture
      ) {
        return;
      }
    }
    if (
      this.fileUpload.fileFor === this.fileUploadFileFor.ownershipPicture
    ) { 
      let demoInfoFiles:any = localStorage.getItem('demo-info-files');
      if(demoInfoFiles){
        demoInfoFiles = JSON.parse(demoInfoFiles);
      } else {
        demoInfoFiles = {};
      }
      let difkey = this.indexedDBFileNameManage.ownershipPicture.count+'_'+this.fileUpload.new.fileIndex;
      demoInfoFiles[difkey] = event.target.files.length;
      localStorage.setItem('demo-info-files', JSON.stringify(demoInfoFiles));
    }
  }
  }

  removeImage(event: any, type: string) {
    if (type == this.fileUploadFileFor.farmerProfile) {
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          this.indexedDBFileNameManage.farmerProfile.front
        )
        .subscribe((file: any) => {
          if (file && file !== undefined && Object.keys(file).length) {
            // delete if exists
            this.dbService
              .deleteByKey(this.indexedDBName, file.id)
              .subscribe((status) => {
                if (status) this.displayFarmerProfileImage = '';
              });
          }
        });
    }
  }

  /* getIndexedDBImage(type: string) {
    if (type == this.fileUploadFileFor.farmerProfile) {
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          this.indexedDBFileNameManage.farmerProfile.front
        )
        .subscribe((file: any) => {
          if (file && file !== undefined && Object.keys(file).length) {
            this.displayFarmerProfileImage = file.file;
          }
        });
    }
  }
  */
  /* END: functions used indexed-db ============================================ */

  // patch edit farmer details
  patchFarmerDetails(B: any) {
    this.demographicInfoForm.patchValue(B);
    // patch farmer Profile image
    this.dbService
      .getByIndex(
        this.indexedDBName,
        'fileFor',
        `${this.indexedDBFileNameManage.farmerProfile.front}`
      )
      .subscribe((farmer: any) => {
        this.displayFarmerProfileImage =
          farmer?.file ||
          this.commonService.fetchFarmerDocument(
            this.indexedDBFileNameManage.farmerProfile.front
          );
      });

    // other details

      // assign kyc data to populate
      if (B.kycData) {
        this.kycData = B.kycData;
      }

      // create form group
      this.demographicInfoForm.patchValue({
        salutation: B.farmerDetails['salutation'],
        firstName: B.farmerDetails['firstName'],

        // addressProof: B.addressProof['selectedIdProof'],
        PANnumber: B.identityProof['panNumber'],
        aadhaarNumber: B.identityProof['aadhaarNumber'],
        drivingLicenceNumber: B.identityProof['drivingLicenceNumber'],
        voterIdNumber: B.identityProof['voterIdNumber'],
        passportNumber: B.identityProof['passportNumber'],
        NREGANumber: B.identityProof['NREGANumber'],

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
        familyMembers: B.familyMembers,
        propertyOwnership: B.propertyOwnership,
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

      if (B.address['pincode']) {
        this.getPinCodeData(
          { target: { value: B.address['pincode'] } },
          'ADDRESS'
        );
      }
      if (B.permAddress?.pincode) {
        this.getPinCodeData(
          { target: { value: B.permAddress?.pincode } },
          'PERMANENT_ADDRESS'
        );
      }

      this.propertyOwnership = this.demographicInfoForm.get('propertyOwnership') as FormArray;
      B.propertyOwnership.map((item: any) => {
        this.propertyOwnership.push(
          this.formBuilder.group({
            propertyType: new FormControl(item.propertyType),
            propertyPic: new FormControl(item.propertyPic),
            ownershipType: new FormControl(item.ownershipType),
            particular: new FormControl(item.particular),
            cumulativeValue: new FormControl(item.cumulativeValue, [Validators.pattern('^[0-9]*$')]),
          })
        );
      });

      this.familyMembers = this.demographicInfoForm.get('familyMembers') as FormArray;
      B.familyMembers.map((item: any) => {
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
      
  }

  validateAndNext() {
    this.isSubmitted = true;
    if (this.demographicInfoForm.invalid) {
      this.toastr.error('please enter values for required fields', 'Error!');
      return;
    } else {
      const formValue = this.demographicInfoForm.value;
      const obj = {
        identityProof: {
          panNumber: formValue.PANnumber,
          aadhaarNumber: formValue.aadhaarNumber,
          drivingLicenceNumber: formValue.drivingLicenceNumber,
          voterIdNumber: formValue.voterIdNumber,
          passportNumber: formValue.passportNumber,
          NREGANumber: formValue.NREGANumber,
        },

        // addressProof: {
        //   selectedIdProof: formValue.addressProof,
        // },

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

        kycData: this.kycData,
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
      this.demographicInfoForm.get(formCtlName)?.setValue(event.target.value);
    } else if (valueType === 'list') {
      this.demographicInfoForm.get(formCtlName)?.setValue(opt_val);
    }
  }

  /* END: NON-API Function Calls------------------------------------------------------------------------ */

  /* START: API Function Calls-------------------------------------------------------------------------- */
  getPinCodeData(event: any, type: string) {
    // clear values
    if (type === 'ADDRESS' && !this.farmerId) {
      this.demographicInfoForm.patchValue({
        city: '',
        state: '',
      });
      this.pinCodeAPIData.length = 0;
    } else if (type === 'PERMANENT_ADDRESS' && !this.farmerId) {
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
          if (res && !res.status) {
            alert(`${res[0].Message}`);
          } else {
            if (type === 'ADDRESS') {
              this.pinCodeAPIData = res.result;
              this.demographicInfoForm.patchValue({
                city: this.pinCodeAPIData[0].district,
                state: this.pinCodeAPIData[0].state,
              });
            } else if (type === 'PERMANENT_ADDRESS') {
              this.permPinCodeAPIData = res.result;
              this.demographicInfoForm.patchValue({
                permCity: this.permPinCodeAPIData[0].district,
                permState: this.permPinCodeAPIData[0].state,
              });
            }
          }
        },
        (error: any) => {
          this.spinner.hide();
          alert('Failed to fetch PinCode Details, please try again...');
        }
      );
    }
  }

  /* PAN,Voter ID,Driving Licence EKYC related : start */
  getKycData(event: any, proofType: string) {
    let INPUT_OBJ = {};
    // PAN Card
    if (proofType === this.kycProofNames.pan) {
      const A = this.demographicInfoForm.value.PANnumber;
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
        id_no: this.demographicInfoForm.value.PANnumber,
      };
    }
    // VOTER ID
    else if (proofType === this.kycProofNames.voter_id) {
      const A = this.demographicInfoForm.value.voterIdNumber;
      if (!A) {
        this.toastr.info('please enter Voter Id Number', 'Info!');
        return;
      }
      INPUT_OBJ = {
        id_type: 'VOTER_ID',
        id_no: this.demographicInfoForm.value.voterIdNumber,
      };
    }
    // DRIVING_LICENSE
    else if (proofType === this.kycProofNames.driving_licence) {
      const A = this.demographicInfoForm.value.drivingLicenceNumber;
      if (!A) {
        this.toastr.info('please enter Driving Licence Number', 'Info!');
        return;
      }

      const B = this.demographicInfoForm.value.dob;
      if (!B) {
        this.toastr.info(
          'please select Date Of Birth as per Driving Licence',
          'Info!'
        );
        return;
      }
      // convert date farmat from 'YYYY-MM-DD' to 'dd/MM/yyyy'
      const C = this.demographicInfoForm.value.dob.split('-');

      INPUT_OBJ = {
        id_type: 'DRIVING_LICENSE',
        id_no: this.demographicInfoForm.value.drivingLicenceNumber,
        dob: `${C[1]}/${C[2]}/${C[0]}`,
      };
    }

    this.spinner.show();
    this.commonService.getKycData(INPUT_OBJ).subscribe(
      (res: any) => {
        this.spinner.hide();

        // PAN Card
        if (proofType === this.kycProofNames.pan) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty('full_name')) {
            this.toastr.info(`Invalid PAN Number`, 'Info!');
            this.setKycDataVariables(
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }

        // VOTER ID
        if (proofType === this.kycProofNames.voter_id) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty('name')) {
            this.toastr.info(`Invalid Voter Id Number`, 'Info!');
            this.setKycDataVariables(
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }

        // DRIVING_LICENSE
        if (proofType === this.kycProofNames.driving_licence) {
          if (res && !res.status) {
            this.toastr.info(`${res.data.message}`, 'Info!');
            this.setKycDataVariables(proofType, 'api_failed', '');
          } else if (!res.data.hasOwnProperty("Holder's Name")) {
            this.toastr.info(`Invalid Driving Licence Number`, 'Info!');
            this.setKycDataVariables(
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setKycDataVariables(
              proofType,
              'api_success_valid_data',
              res.data
            );
          }
        }
      },
      (error: any) => {
        this.spinner.hide();
        alert('Failed to fetch KYC Details, please try again...');
        this.setKycDataVariables(proofType, 'api_failed', '');
      }
    );
  }

  setKycDataVariables(proofType: string, type: string, apiData = {}) {
    // if KYC API failed to get data
    if (type === 'api_failed') {
      this.kycData[proofType].data = {};
      this.kycData[proofType].showVerify = false;
      this.kycData[proofType].showTryAgain = true;
      this.kycData[proofType].showConfirm = false;
      this.kycData[proofType].isVerified = false;
    } else if (type === 'api_success_invalid_data') {
      this.kycData[proofType].data = {};
      this.kycData[proofType].showVerify = false;
      this.kycData[proofType].showTryAgain = true;
      this.kycData[proofType].showConfirm = false;
      this.kycData[proofType].isVerified = false;
    } else if (type === 'api_success_valid_data') {
      this.kycData[proofType].data = apiData;
      this.kycData[proofType].showVerify = true;
      this.kycData[proofType].showTryAgain = false;
      this.kycData[proofType].showConfirm = true;
      this.kycData[proofType].isVerified = false;
    } else if (type === 'confirm') {
      this.kycData[proofType].showVerify = false;
      this.kycData[proofType].showTryAgain = false;
      this.kycData[proofType].showConfirm = false;
      this.kycData[proofType].isVerified = true;
    }
  }
  /* PAN,Voter ID,Driving Licence EKYC related : end */

  /* Aadhaar EKYC related : start */
  getAadhaarEkycVerification(event: any, proofType: string) {
    let INPUT_OBJ = {};

    if (proofType === this.kycProofNames.aadhaar) {
      /* 
      // checking for Aadhaar Mandatory is not required
      const aadhaarInput = this.demographicInfoForm.value.aadhaarNumber;
      if (!aadhaarInput) {
        this.toastr.info('please enter Aadhaar Number', 'Info!');
        return;
      } else if (aadhaarInput && aadhaarInput.length !== 12) {
        this.toastr.info('please enter 12 digit valid Aadhaar Number', 'Info!');
        return;
       } else */
      const phoneNumberInput = this.demographicInfoForm.value.phoneNumber;
      if (
        !phoneNumberInput ||
        (phoneNumberInput && phoneNumberInput.trim().length !== 10)
      ) {
        this.toastr.info('please enter your 10 digit Phone Number', 'Info!');
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
        if (proofType === this.kycProofNames.aadhaar) {
          if (res && !res.status) {
            this.toastr.info(`${res.message}`, 'Info!');
            this.setAadhaarEkycDataVariables(
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
              'api_1',
              proofType,
              'api_success_invalid_data',
              res.data
            );
          } else {
            this.setAadhaarEkycDataVariables(
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
        alert('Failed to fetch KYC Details, please try again...');
        this.setAadhaarEkycDataVariables('api_1', proofType, 'api_failed', '');
      }
    );
  }
  getAadhaarDetails(event: any, proofType: string) {
    let INPUT_OBJ = {};
    if (proofType === this.kycProofNames.aadhaar) {
      INPUT_OBJ = {
        kId: this.kycData.aadhaar.verificationLinkData['kId'],
      };
    }

    this.spinner.show();
    this.commonService.getAadhaarDetails(INPUT_OBJ).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (proofType === this.kycProofNames.aadhaar) {
          if (
            res &&
            (!res.status || (res.status && res.data && res.data.code))
          ) {
            this.toastr.info(`${res.message}`, 'Info!');
            this.setAadhaarEkycDataVariables(
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
            !res.data.actions[0].processing_done
          ) {
            this.toastr.info(
              `Please complete the verification process`,
              'Info!'
            );
            this.setAadhaarEkycDataVariables(
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
            res.data.actions[0].processing_done &&
            res.data.actions[0].details &&
            res.data.actions[0].details.aadhaar
          ) {
            this.toastr.info(
              `Please verify the Aadhaar details and confirm to complete the process`,
              'Info!'
            );
            this.setAadhaarEkycDataVariables(
              'api_2',
              proofType,
              'api_success_valid_data',
              res.data
            );
          } else {
            this.setAadhaarEkycDataVariables(
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
        alert('Failed to fetch KYC Details, please try again...');
        this.setAadhaarEkycDataVariables('api_2', proofType, 'api_failed', '');
      }
    );
  }

  setAadhaarEkycDataVariables(
    apiCalled: string,
    proofType: string,
    type: string,
    apiData = {}
  ) {
    if (apiCalled === 'api_1') {
      if (type === 'api_failed') {
        this.kycData[proofType].verificationLinkData = {};
        this.kycData[proofType].data = {};
        this.kycData[proofType].showVerify = false;
        this.kycData[proofType].showTryAgain = true;
        this.kycData[proofType].showConfirm = false;
        this.kycData[proofType].isVerified = false;
      } else if (type === 'api_success_invalid_data') {
        this.kycData[proofType].verificationLinkData = {};
        this.kycData[proofType].data = {};
        this.kycData[proofType].showVerify = false;
        this.kycData[proofType].showTryAgain = true;
        this.kycData[proofType].showConfirm = false;
        this.kycData[proofType].isVerified = false;
      } else if (type === 'api_success_valid_data') {
        this.kycData[proofType].verificationLinkData = apiData;
        this.kycData[proofType].data = {};
        this.kycData[proofType].showVerify = true;
        this.kycData[proofType].showTryAgain = false;
        this.kycData[proofType].showConfirm = false;
        this.kycData[proofType].isVerified = false;
      }
    } else if (apiCalled === 'api_2') {
      if (type === 'api_failed') {
        this.kycData[proofType].data = {};
        this.kycData[proofType].showVerify = false;
        this.kycData[proofType].showTryAgain = true;
        this.kycData[proofType].showConfirm = false;
        this.kycData[proofType].isVerified = false;
      } else if (type === 'api_success_invalid_data') {
        this.kycData[proofType].data = {};
        this.kycData[proofType].showVerify = false;
        this.kycData[proofType].showTryAgain = true;
        this.kycData[proofType].showConfirm = false;
        this.kycData[proofType].isVerified = false;
      } else if (type === 'api_success_valid_data') {
        this.kycData[proofType].data = apiData;
        this.kycData[proofType].showVerify = true;
        this.kycData[proofType].showTryAgain = false;
        this.kycData[proofType].showConfirm = true;
        this.kycData[proofType].isVerified = false;
      } else if (type === 'confirm') {
        this.kycData[proofType].showVerify = false;
        this.kycData[proofType].showTryAgain = false;
        this.kycData[proofType].showConfirm = false;
        this.kycData[proofType].isVerified = true;
      }
    }
  }
  /* Aadhaar EKYC related : end */
  /* END: API Function Calls---------------------------------------------------------------------------- */
}
