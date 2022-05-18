import { Component, OnInit } from '@angular/core';
declare var $: any;
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-edit-co-applicant',
  templateUrl: './edit-co-applicant.component.html',
  styleUrls: ['./edit-co-applicant.component.css'],
})
export class EditCoApplicantComponent implements OnInit {
  coApplicantDisp = {} as any;
  fileUpload = {
    coaNo: '',
    fileFor: '',
    popupTitle: '',
    new: {
      imageSrc1: '',
      imageSrc2: '',
    },
    description: '',
    kyc: '',
  } as any;
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

  constructor(
    public commonService: CommonService,
  ) {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.coApplicantDisp = JSON.parse(A).co_applicant_details;
      console.log('coApplicantDisp : ', this.coApplicantDisp);
    }
  }
  ngOnInit(): void { }

  openFileModalPopup(coaNo: string, type: string) {
    this.fileUpload.coaNo = coaNo;
    this.fileUpload.fileFor = type;
    this.fileUpload.new.imageSrc1 = '';
    this.fileUpload.new.imageSrc2 = '';
    this.fileUpload.description = '';
    this.fileUpload.kyc = [];
    if (type === this.fileUploadFileFor.coa1.panCard && coaNo === 'coa1') {
      this.fileUpload.popupTitle = 'PAN Card';
      this.fileUpload.description = 'PAN Card: ' + this.coApplicantDisp[0].identityProof.panNumber;
      let kycdata = (this.coApplicantDisp[0]?.kycData?.pan?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[0]?.kycData?.pan?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.panCard.front
        );
    } else if (
      type === this.fileUploadFileFor.coa2.panCard &&
      coaNo === 'coa2'
    ) {
      this.fileUpload.popupTitle = 'PAN Card';
      this.fileUpload.description = 'PAN Card: ' + this.coApplicantDisp[1].identityProof.panNumber;
      let kycdata = (this.coApplicantDisp[1]?.kycData?.pan?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[1]?.kycData?.pan?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.panCard.front
        );
    } else if (
      type === this.fileUploadFileFor.coa1.aadhaarCard &&
      coaNo === 'coa1'
    ) {
      this.fileUpload.popupTitle = 'Aadhaar Card';
      this.fileUpload.description = 'Aadhaar Card: ' + this.coApplicantDisp[0].identityProof.aadhaarNumber;
      let kycdata = (this.coApplicantDisp[0]?.kycData?.aadhaar?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[0]?.kycData?.aadhaar?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.aadhaarCard.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.aadhaarCard.back
        );
    } else if (
      type === this.fileUploadFileFor.coa2.aadhaarCard &&
      coaNo === 'coa2'
    ) {
      this.fileUpload.popupTitle = 'Aadhaar Card';
      this.fileUpload.description = 'Aadhaar Card: ' + this.coApplicantDisp[1].identityProof.aadhaarNumber;
      let kycdata = (this.coApplicantDisp[1]?.kycData?.aadhaar?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[1]?.kycData?.aadhaar?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.aadhaarCard.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.aadhaarCard.back
        );
    } else if (
      type === this.fileUploadFileFor.coa1.drivingLicence &&
      coaNo === 'coa1'
    ) {
      this.fileUpload.popupTitle = 'Driving Licence';
      this.fileUpload.description = 'Driving Licence: ' + this.coApplicantDisp[0].identityProof.drivingLicenceNumber;
      let kycdata = (this.coApplicantDisp[0]?.kycData?.driving_licence?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[0]?.kycData?.driving_licence?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.drivingLicence.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.drivingLicence.back
        );
    } else if (
      type === this.fileUploadFileFor.coa2.drivingLicence &&
      coaNo === 'coa2'
    ) {
      this.fileUpload.popupTitle = 'Driving Licence';
      this.fileUpload.description = 'Driving Licence: ' + this.coApplicantDisp[1].identityProof.drivingLicenceNumber;
      let kycdata = (this.coApplicantDisp[1]?.kycData?.driving_licence?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[1]?.kycData?.driving_licence?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.drivingLicence.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.drivingLicence.back
        );
    } else if (
      type === this.fileUploadFileFor.coa1.voterId &&
      coaNo === 'coa1'
    ) {
      this.fileUpload.popupTitle = 'Voter Id';
      this.fileUpload.description = 'Voter Id: ' + this.coApplicantDisp[0].identityProof.voterIdNumber;
      let kycdata = (this.coApplicantDisp[0]?.kycData?.voter_id?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[0]?.kycData?.voter_id?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.voterId.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.voterId.back
        );
    } else if (
      type === this.fileUploadFileFor.coa2.voterId &&
      coaNo === 'coa2'
    ) {
      this.fileUpload.popupTitle = 'Voter Id';
      this.fileUpload.description = 'Voter Id: ' + this.coApplicantDisp[1].identityProof.voterIdNumber;
      let kycdata = (this.coApplicantDisp[1]?.kycData?.voter_id?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[1]?.kycData?.voter_id?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.voterId.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.voterId.back
        );
    } else if (
      type === this.fileUploadFileFor.coa1.passport &&
      coaNo === 'coa1'
    ) {
      this.fileUpload.popupTitle = 'Passport';
      this.fileUpload.description = 'Passport Number: ' + this.coApplicantDisp[0].identityProof.passportNumber;
      let kycdata = (this.coApplicantDisp[0]?.kycData?.passport?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[0]?.kycData?.passport?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.passport.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.passport.back
        );
    } else if (
      type === this.fileUploadFileFor.coa2.passport &&
      coaNo === 'coa2'
    ) {
      this.fileUpload.popupTitle = 'Passport';
      this.fileUpload.description = 'Passport Number: ' + this.coApplicantDisp[1].identityProof.passportNumber;
      let kycdata = (this.coApplicantDisp[1]?.kycData?.passport?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[1]?.kycData?.passport?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.passport.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.passport.back
        );
    } else if (type === this.fileUploadFileFor.coa1.NREGA && coaNo === 'coa1') {
      this.fileUpload.popupTitle = 'NREGA';
      this.fileUpload.description = 'NREGA Number: ' + this.coApplicantDisp[0].identityProof.NREGANumber;
      let kycdata = (this.coApplicantDisp[0]?.kycData?.nrega?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[0]?.kycData?.nrega?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.NREGA.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa1.NREGA.back
        );
    } else if (type === this.fileUploadFileFor.coa2.NREGA && coaNo === 'coa2') {
      this.fileUpload.popupTitle = 'NREGA';
      this.fileUpload.description = 'NREGA Number: ' + this.coApplicantDisp[1].identityProof.NREGANumber;
      let kycdata = (this.coApplicantDisp[1]?.kycData?.nrega?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.coApplicantDisp[1]?.kycData?.nrega?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
      this.fileUpload.new.imageSrc1 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.NREGA.front
        );
      this.fileUpload.new.imageSrc2 =
        this.commonService.fetchFarmerDocument(
          this.indexedDBFileNameManage.coa2.NREGA.back
        );
      // } else if (
      //   type === this.fileUploadFileFor.coa1.farmerProfile &&
      //   coaNo === 'coa1'
      // ) {
      //   this.fileUpload.popupTitle = 'Farmer Profile Image';
      //       this.fileUpload.new.imageSrc1 =
      //         this.commonService.fetchFarmerDocument(
      //           this.indexedDBFileNameManage.coa1.farmerProfile.front
      //         );
      //       this.displayCoApplicant1ProfileImage =
      //         this.commonService.fetchFarmerDocument(
      //           this.indexedDBFileNameManage.coa1.farmerProfile.front
      //         );
      // } else if (
      //   type === this.fileUploadFileFor.coa2.farmerProfile &&
      //   coaNo === 'coa2'
      // ) {
      //   this.fileUpload.popupTitle = 'Farmer Profile Image';
      //       this.fileUpload.new.imageSrc1 =
      //         this.commonService.fetchFarmerDocument(
      //           this.indexedDBFileNameManage.coa2.farmerProfile.front
      //         );
      //       this.displayCoApplicant2ProfileImage =
      //         this.commonService.fetchFarmerDocument(
      //           this.indexedDBFileNameManage.coa2.farmerProfile.front
      //         );
    }
    $('#fileUploadModalPopup').modal('show');
  }

}

