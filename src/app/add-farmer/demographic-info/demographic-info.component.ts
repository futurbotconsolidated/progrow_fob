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
    addressProof: {
      front: `${this.concatePage}_addressProofFront`,
      back: `${this.concatePage}_addressProofBack`,
    },
    passport: {
      front: `${this.concatePage}_passportFront`,
      back: `${this.concatePage}_passportBack`,
    },
    NREGA: {
      front: `${this.concatePage}_NREGAFront`,
      back: `${this.concatePage}_NREGABack`,
    },
    voterId: {
      front: `${this.concatePage}_voterIdFront`,
      back: `${this.concatePage}_voterIdBack`,
    },
    farmerProfile: { front: `${this.concatePage}_farmerProfileImage` },
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
    passport: 'passport',
    nrega: 'nrega',
    voter_id: 'voter_id',
    driving_licence: 'driving_licence',
    aadhaar: 'aadhaar',
  };
  demoGraphicKycData = {
    pan: {
      id: '',
      data: {},
      isVerified: true,
      showVerify: false,
      showTryAgain: false,
      showConfirm: false,
    },
    passport: {
      id: '',
      data: {},
      isVerified: false,
      showTryAgain: false,
      showConfirm: false,
    },
    nrega: {
      id: '',
      data: {},
      isVerified: false,
      showTryAgain: false,
      showConfirm: false,
    },
    voter_id: {
      id: '',
      data: {},
      isVerified: false,
      showTryAgain: false,
      showConfirm: false,
    },
    driving_licence: {
      id: '',
      data: {},
      isVerified: false,
      showTryAgain: false,
      showConfirm: false,
    },
    aadhaar: {
      id: '',
      data: {},
      isVerified: false,
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

      addressProof: new FormControl('', [Validators.required]),
      PANnumber: new FormControl('', [validatePANNumber]),
      passportNumber: new FormControl(''),
      voterIdNumber: new FormControl(''),
      NREGANumber: new FormControl(''),
    });

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
    console.log(this.farmerId);
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
      let editForm: any = localStorage.getItem('edit-demographic-info-form');
      if (editForm) {
        editForm = JSON.parse(editForm);
        this.demographicInfoForm.patchValue(editForm);

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
        this.patchFarmerDetails(); // bind/patch fresh api data
      }
    } else {
      let demoInfo: any = localStorage.getItem('demographic-info-form');
      if (demoInfo) {
        demoInfo = JSON.parse(demoInfo);
        this.demographicInfoForm.patchValue(demoInfo);

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
  }
  ngAfterViewInit(): void {
    /** subscribe to Observables, which are triggered from header selections*/
    this.observableSubscription = this.addFarmerService
      .getMessage()
      .subscribe((data) => {
        this.nextRoute = data.routeName;
        if (this.router.url?.includes('/add/demographic-info')) {
          this.validateAndNext();
          console.log(data.routeName);
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
    } else if (type === 'ADDRESS_PROOF') {
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
    } else if (type === 'PASSPORT') {
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
    } else if (type === 'NREGA') {
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
    } else if (type === 'VOTERID') {
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
    } else if (type === 'FARMER_PROFILE') {
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

      /* START: reading file and Patching the Selected File */
      let selectedImageFor = '';
      reader.readAsDataURL(file);
      reader.onload = () => {
        const imageSrc = reader.result;

        if (this.fileUpload.fileFor === 'PAN' && type == 'FRONT_IMAGE') {
          this.fileUpload.new.imageSrc1 = imageSrc;
          selectedImageFor = this.indexedDBFileNameManage.panCard.front;
        } else if (this.fileUpload.fileFor === 'ADDRESS_PROOF') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.addressProof.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.addressProof.back;
          }
        } else if (this.fileUpload.fileFor === 'PASSPORT') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.passport.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.passport.back;
          }
        } else if (this.fileUpload.fileFor === 'NREGA') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.NREGA.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.NREGA.back;
          }
        } else if (this.fileUpload.fileFor === 'VOTERID') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.voterId.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.voterId.back;
          }
        } else if (this.fileUpload.fileFor === 'FARMER_PROFILE') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.farmerProfile.front;
            this.displayFarmerProfileImage = imageSrc;
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
    }
  }

  removeImage(event: any, type: string) {
    if (type == 'FARMER_PROFILE') {
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

  getIndexedDBImage(type: string) {
    if (type == 'FARMER_PROFILE') {
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
  /* END: functions used indexed-db ============================================ */

  // patch edit farmer details
  patchFarmerDetails() {
    // patch farmer Profile image
    this.dbService
      .getByIndex(
        this.indexedDBName,
        'fileFor',
        `${this.indexedDBFileNameManage.farmerProfile.front}`
      )
      .subscribe((farmer: any) => {
        console.log(farmer);

        this.displayFarmerProfileImage =
          farmer?.file ||
          this.commonService.fetchFarmerDocument(
            this.indexedDBFileNameManage.farmerProfile.front
          );
      });

    // other details
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      const B = JSON.parse(A).demographic_info;
      // create form group
      this.demographicInfoForm.patchValue({
        salutation: B.farmerDetails['salutation'],
        firstName: B.farmerDetails['firstName'],

        addressProof: B.addressProof['selectedIdProof'],
        PANnumber: B.identityProof['panNumber'],
        passportNumber: B.identityProof['passportNumber'],
        voterIdNumber: B.identityProof['voterIdNumber'],
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
    }
  }

  validateAndNext() {
    console.log(this.demographicInfoForm);

    this.isSubmitted = true;
    if (this.demographicInfoForm.invalid) {
      this.toastr.error('please enter values for required fields', 'Error!');
      return;
    } else {
      const formValue = this.demographicInfoForm.value;
      const obj = {
        identityProof: {
          panNumber: formValue.PANnumber,
          passportNumber: formValue.passportNumber,
          NREGANumber: formValue.NREGANumber,
          voterIdNumber: formValue.voterIdNumber,
        },
        addressProof: {
          selectedIdProof: formValue.addressProof,
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

  // KYC Data Functions
  // kycButonHideShow(proofType: string, buttonType: string) {
  //   if (proofType === 'PAN') {
  //     if (buttonType === 'verify') {
  //       return this.demographicInfoForm.value.panNumber != '' ? true : false;
  //     }
  //   }
  // }
  /* END: NON-API Function Calls------------------------------------------------------------------------ */

  /* START: API Function Calls-------------------------------------------------------------------------- */
  getPinCodeData(event: any, type: string) {
    console.log(event, type);

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
          alert('Failed to fetch PinCode Details, please try againn...');
        }
      );
    }
  }

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

    this.spinner.show();
    this.commonService.getKycData(INPUT_OBJ).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res && !res.status) {
          alert(`${res[0].Message}`);
          this.setKycDataVariables(proofType, 'api_failed');
        } else {
          console.log(res);
          this.setKycDataVariables(proofType, 'api_success');
        }
      },
      (error: any) => {
        this.spinner.hide();
        alert('Failed to fetch KYC Details, please try againn...');
        this.setKycDataVariables(proofType, 'api_failed');
      }
    );
  }

  setKycDataVariables(proofType: string, type: string) {
    // if KYC API failed to get data
    if (type === 'api_failed') {
      this.demoGraphicKycData[proofType].showTryAgain = true;
    } else if (type === 'api_success') {
      this.demoGraphicKycData[proofType].showConfirm = true;
    } else if (type === 'confirm') {
      this.demoGraphicKycData[proofType].isVerified = true;
    }
  }

  /* END: API Function Calls---------------------------------------------------------------------------- */
}
