import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
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
import { NgxIndexedDBService } from 'ngx-indexed-db';

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
  pinCodeAPIDatacoa2: any = [];
  permPinCodeAPIData: any = [];
  permPinCodeAPIDatacoa2: any = [];

  familyMembers!: FormArray;
  familyMemberscoa2!: FormArray;
  coApplicantForm: FormGroup;

  nextRoute: any;
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle =
    SaveStatus.Idle;

  // indexed db variables
  displayCoApplicant1ProfileImage = '' as any;
  displayCoApplicant2ProfileImage = '' as any;
  displayFarmerProfileImage = '' as any;
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
      addressProof: {
        front: `${this.concatePage1}_addressProofFront`,
        back: `${this.concatePage1}_addressProofBack`,
      },
      passport: {
        front: `${this.concatePage1}_passportFront`,
        back: `${this.concatePage1}_passportBack`,
      },
      NREGA: {
        front: `${this.concatePage1}_NREGAFront`,
        back: `${this.concatePage1}_NREGABack`,
      },
      voterId: {
        front: `${this.concatePage1}_voterIdFront`,
        back: `${this.concatePage1}_voterIdBack`,
      },
      farmerProfile: { front: `${this.concatePage1}_farmerProfileImage` },
    },
    coa2: {
      panCard: {
        front: `${this.concatePage2}_PANCardFront`,
        back: '',
      },
      addressProof: {
        front: `${this.concatePage2}_addressProofFront`,
        back: `${this.concatePage2}_addressProofBack`,
      },
      passport: {
        front: `${this.concatePage2}_passportFront`,
        back: `${this.concatePage2}_passportBack`,
      },
      NREGA: {
        front: `${this.concatePage2}_NREGAFront`,
        back: `${this.concatePage2}_NREGABack`,
      },
      voterId: {
        front: `${this.concatePage2}_voterIdFront`,
        back: `${this.concatePage2}_voterIdBack`,
      },
      farmerProfile: { front: `${this.concatePage2}_farmerProfileImage` },
    },
  };

  farmerId = ''; // edit feature
  /* END: Varaibles ---------------------------------------------*/

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
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
      ]),
      taluk: new FormControl(''),
      city: new FormControl(''),
      state: new FormControl(''),
      landmark: new FormControl(''),

      phoneNumber: new FormControl('', [
        Validators.required,
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
      familyMembers: new FormArray([this.createFamilyMembers()]),

      addressProof: new FormControl(''),
      PANnumber: new FormControl('', [validatePANNumber]),
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
      phoneNumbercoa2: new FormControl('', [Validators.pattern('^[0-9]*$')]),

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
      familyMemberscoa2: new FormArray([this.createFamilyMembers()]),

      addressProofcoa2: new FormControl(''),
      PANnumbercoa2: new FormControl(''),
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
      let editForm: any = localStorage.getItem('edit-coapplicant-form');
      if (editForm) {
        editForm = JSON.parse(editForm);
        this.coApplicantForm.patchValue(editForm);

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
      let coApplicant: any = localStorage.getItem('co-applicant-form');
      if (coApplicant) {
        coApplicant = JSON.parse(coApplicant);
        this.coApplicantForm.patchValue(coApplicant);
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
  }

  ngAfterViewInit(): void {
    /** subscribe to Observables, which are triggered from header selections*/
    this.observableSubscription = this.addFarmerService
      .getMessage()
      .subscribe((data) => {
        this.nextRoute = data.routeName;
        console.log(this.router.url);

        if (this.router.url?.includes('/add/co-applicant')) {
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
        });
    } else if (type === 'PANcoa2') {
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
        });
    } else if (type === 'ADDRESS_PROOF') {
      if (!this.coApplicantForm.value.addressProof) {
        this.toastr.error('please select Address Proof Type.', 'Error!');
        return;
      }
      const A = this.coApplicantForm.value.addressProof;
      this.fileUpload.popupTitle = `Upload ${A || ''} Image`;
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.addressProof.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.addressProof.front
            );
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa1.addressProof.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa1.addressProof.back
            );
        });
    } else if (type === 'ADDRESS_PROOFcoa2') {
      if (!this.coApplicantForm.value.addressProofcoa2) {
        this.toastr.error('please select Address Proof Type.', 'Error!');
        return;
      }
      const A = this.coApplicantForm.value.addressProofcoa2;
      this.fileUpload.popupTitle = `Upload ${A || ''} Image`;
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.addressProof.front}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc1 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.addressProof.front
            );
        });

      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          `${this.indexedDBFileNameManage.coa2.addressProof.back}`
        )
        .subscribe((farmer: any) => {
          this.fileUpload.new.imageSrc2 =
            farmer?.file ||
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.coa2.addressProof.back
            );
        });
    } else if (type === 'VOTERID') {
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
        });
    } else if (type === 'VOTERIDcoa2') {
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
        });
    } else if (type === 'PASSPORT') {
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
        });
    } else if (type === 'PASSPORTcoa2') {
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
        });
    } else if (type === 'NREGA') {
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
        });
    } else if (type === 'NREGAcoa2') {
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
        });
    } else if (type === 'FARMER_PROFILE') {
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
    } else if (type === 'FARMER_PROFILEcoa2') {
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
          selectedImageFor = this.indexedDBFileNameManage.coa1.panCard.front;
        } else if (
          this.fileUpload.fileFor === 'PANcoa2' &&
          type == 'FRONT_IMAGE'
        ) {
          this.fileUpload.new.imageSrc1 = imageSrc;
          selectedImageFor = this.indexedDBFileNameManage.coa2.panCard.front;
        } else if (this.fileUpload.fileFor === 'ADDRESS_PROOF') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor =
              this.indexedDBFileNameManage.coa1.addressProof.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor =
              this.indexedDBFileNameManage.coa1.addressProof.back;
          }
        } else if (this.fileUpload.fileFor === 'ADDRESS_PROOFcoa2') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor =
              this.indexedDBFileNameManage.coa2.addressProof.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor =
              this.indexedDBFileNameManage.coa2.addressProof.back;
          }
        } else if (this.fileUpload.fileFor === 'VOTERID') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa1.voterId.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa1.voterId.back;
          }
        } else if (this.fileUpload.fileFor === 'VOTERIDcoa2') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa2.voterId.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa2.voterId.back;
          }
        } else if (this.fileUpload.fileFor === 'PASSPORT') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa1.passport.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa1.passport.back;
          }
        } else if (this.fileUpload.fileFor === 'PASSPORTcoa2') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa2.passport.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa2.passport.back;
          }
        } else if (this.fileUpload.fileFor === 'NREGA') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa1.NREGA.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa1.NREGA.back;
          }
        } else if (this.fileUpload.fileFor === 'NREGAcoa2') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa2.NREGA.front;
          } else if (type === 'BACK_IMAGE') {
            this.fileUpload.new.imageSrc2 = imageSrc;
            selectedImageFor = this.indexedDBFileNameManage.coa2.NREGA.back;
          }
        } else if (this.fileUpload.fileFor === 'FARMER_PROFILE') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
            selectedImageFor =
              this.indexedDBFileNameManage.coa1.farmerProfile.front;
            this.displayCoApplicant1ProfileImage = imageSrc;
          }
        } else if (this.fileUpload.fileFor === 'FARMER_PROFILEcoa2') {
          if (type === 'FRONT_IMAGE') {
            this.fileUpload.new.imageSrc1 = imageSrc;
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
    } else if (type == 'FARMER_PROFILEcoa2') {
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

  getIndexedDBImage(type: string) {
    if (type == 'FARMER_PROFILE') {
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          this.indexedDBFileNameManage.coa1.farmerProfile.front
        )
        .subscribe((file: any) => {
          if (file && file !== undefined && Object.keys(file).length) {
            this.displayCoApplicant1ProfileImage = file.file;
          }
        });
    } else if (type == 'FARMER_PROFILEcoa2') {
      this.dbService
        .getByIndex(
          this.indexedDBName,
          'fileFor',
          this.indexedDBFileNameManage.coa2.farmerProfile.front
        )
        .subscribe((file: any) => {
          if (file && file !== undefined && Object.keys(file).length) {
            this.displayCoApplicant2ProfileImage = file.file;
          }
        });
    }
  }
  /* END: functions used indexed-db ============================================ */

  // patch edit farmer details
  patchFarmerDetails() {
    const A: any = localStorage.getItem('farmer-details');
    const coData = JSON.parse(A).co_applicant_details;
    if (A && Array.isArray(coData) && coData.length === 2) {
      const C1 = JSON.parse(A).co_applicant_details[0];
      const C2 = JSON.parse(A).co_applicant_details[1];

      // Prefill: edit data
      this.coApplicantForm.patchValue({
        // Co-Applicant 1
        salutation: C1.farmerDetails['salutation'],
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
        yrsInAddress: C1.yrsInAddress,
        yrsInCity: C1.yrsInCity,

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

        addressProof: C1.addressProof['selectedIdProof'],
        PANnumber: C1.identityProof['panNumber'],
        voterIdNumber: C1.identityProof['voterIdNumber'],
        passportNumber: C1.identityProof['passportNumber'],
        NREGANumber: C1.identityProof['NREGANumber'],

        // Co-Applicant 1
        salutationcoa2: C2.farmerDetails['salutation'],
        firstNamecoa2: C2.farmerDetails['firstName'],
        middleNamecoa2: C2.farmerDetails['middleName'],
        lastNamecoa2: C2.farmerDetails['lastName'],
        dobcoa2: C2.farmerDetails['dob'],
        gendercoa2: C2.farmerDetails['gender'],
        religioncoa2: C2.farmerDetails['religion'],
        castecoa2: C2.farmerDetails['caste'],

        educationalQualificationcoa2:
          C2.otherDetails['educationalQualification'],
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
        yrsInAddresscoa2: C2.yrsInAddress,
        yrsInCitycoa2: C2.yrsInCity,

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

        addressProofcoa2: C2.addressProof['selectedIdProof'],
        PANnumbercoa2: C2.identityProof['panNumber'],
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
    }
  }

  validateAndNext() {
    this.isSubmitted = true;
    console.log(this.coApplicantForm);

    // if (this.coApplicantForm.invalid) {
    //   this.toastr.error('please enter values for required fields', 'Error!');
    //   return;
    // } else {
    const formValue = this.coApplicantForm.value;
    const coapparr = [] as any;
    const obj = {
      identityProof: {
        panNumber: formValue.PANnumber,
        voterIdNumber: formValue.voterIdNumber,
        passportNumber: formValue.passportNumber,
        NREGANumber: formValue.NREGANumber,
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
    };

    const objcoa2 = {
      identityProof: {
        panNumber: formValue.PANnumbercoa2,
        passportNumber: formValue.passportNumbercoa2,
        NREGANumber: formValue.NREGANumbercoa2,
        voterIdNumber: formValue.voterIdNumbercoa2,
      },
      addressProof: {
        selectedIdProof: formValue.addressProofcoa2,
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
        mobileNumber: formValue.phoneNumbercoa2,
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
        fpoName: formValue.annualIncomecoa2,
      },
      familyMembers: formValue.familyMemberscoa2,
      propertyStatus: formValue.propertyStatuscoa2,
      monthlyRent: formValue.monthlyRentcoa2,
    };
    console.log(this.coApplicantForm);

    coapparr.push(obj);
    coapparr.push(objcoa2);

    if (this.farmerId) {
      localStorage.setItem('edit-co-applicant', JSON.stringify(coapparr));
      localStorage.setItem('edit-co-applicant-form', JSON.stringify(formValue));
    } else {
      localStorage.setItem('co-applicant', JSON.stringify(coapparr));
      localStorage.setItem('co-applicant-form', JSON.stringify(formValue));
    }
    const url = `/add/${this.nextRoute}/${this.farmerId}`;
    this.router.navigate([url]);
    // }
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
              this.pinCodeAPIData = res.result;

              this.coApplicantForm.patchValue({
                city: this.pinCodeAPIData[0].district,
                state: this.pinCodeAPIData[0].state,
              });
            } else if (type === 'ADDRESScoa2') {
              this.pinCodeAPIDatacoa2 = res.result;
              this.coApplicantForm.patchValue({
                citycoa2: this.pinCodeAPIDatacoa2[0].district,
                statecoa2: this.pinCodeAPIDatacoa2[0].state,
              });
            } else if (type === 'PERMANENT_ADDRESS') {
              this.permPinCodeAPIData = res.result;

              this.coApplicantForm.patchValue({
                permCity: this.permPinCodeAPIData[0].district,
                permState: this.permPinCodeAPIData[0].state,
              });
            } else if (type === 'PERMANENT_ADDRESScoa2') {
              this.permPinCodeAPIDatacoa2 = res.result;
              this.coApplicantForm.patchValue({
                permCitycoa2: this.permPinCodeAPIDatacoa2[0].district,
                permStatecoa2: this.permPinCodeAPIDatacoa2[0].state,
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

  /* END: API Function Calls------------------------------------------------------------------------ */
}
