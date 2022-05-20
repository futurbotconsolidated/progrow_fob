import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/common.service';
import { Router } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-edit-demographic-info',
  templateUrl: './edit-demographic-info.component.html',
  styleUrls: ['./edit-demographic-info.component.css'],
})
export class EditDemographicInfoComponent implements OnInit {
  demographicDisp = {} as any;
  fileUpload = {
    fileFor: '',
    popupTitle: '',
    new: {
      imageSrc1: '',
      imageSrc2: '',
      imageMultiple: [] as any,
      fileIndex: 0,
    },
    description: '',
    kyc: '',
  } as any;

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
    ownershipPicture: {
      front: `${this.concatePage}_ownershipPictureImage`,
      count: `${this.concatePage}_ownershipPictureImageCount`,
    },
  };
  constructor(
    public router: Router,
    public commonService: CommonService
  ) {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
      console.log('demographicDisp : ',this.demographicDisp);
    }
  }

  ngOnInit(): void {}

  openFileModalPopup(type: string, fileIndex: number) {
    this.fileUpload.fileFor = type;
    this.fileUpload.new.imageSrc1 = '';
    this.fileUpload.new.imageSrc2 = '';
    this.fileUpload.new.imageMultiple = [];
    this.fileUpload.new.fileIndex = fileIndex;
    this.fileUpload.description = '';
    this.fileUpload.kyc = '';
    if (type === this.fileUploadFileFor.panCard) {
      this.fileUpload.popupTitle = 'PAN Card';
      this.fileUpload.description = 'PAN Card: '+this.demographicDisp.identityProof.panNumber;
      let kycdata = (this.demographicDisp.kycData?.pan?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.demographicDisp.kycData?.pan?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.panCard.front
            );
    } else if (type === this.fileUploadFileFor.aadhaarCard) {
      this.fileUpload.popupTitle = 'Aadhaar Card';
      this.fileUpload.description = 'Aadhaar Card: '+this.demographicDisp.identityProof.aadhaarNumber;
      this.fileUpload.kyc = (this.demographicDisp.kycData?.aadhaar || {});
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.aadhaarCard.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.aadhaarCard.back
            );

    } else if (type === this.fileUploadFileFor.drivingLicence) {
      this.fileUpload.popupTitle = 'Driving Licence';
      this.fileUpload.description = 'Driving Licence: '+this.demographicDisp.identityProof.drivingLicenceNumber;
      let kycdata = (this.demographicDisp.kycData?.driving_licence?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.demographicDisp.kycData?.driving_licence?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr; 
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.drivingLicence.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.drivingLicence.back
            );
    } else if (type === this.fileUploadFileFor.voterId) {
      this.fileUpload.popupTitle = 'Voter Id';
      this.fileUpload.description = 'Voter Id: '+this.demographicDisp.identityProof.voterIdNumber;
      let kycdata = (this.demographicDisp.kycData?.voter_id?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.demographicDisp.kycData?.voter_id?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr;
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.voterId.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.voterId.back
            );
    } else if (type === this.fileUploadFileFor.passport) {
      this.fileUpload.popupTitle = 'Passport';
      this.fileUpload.description = 'Voter Id: '+this.demographicDisp.identityProof.passportNumber;
      let kycdata = (this.demographicDisp.kycData?.passport?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.demographicDisp.kycData?.passport?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr; 
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.passport.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.passport.back
            );
    } else if (type === this.fileUploadFileFor.NREGA) {
      this.fileUpload.popupTitle = 'NREGA';
      this.fileUpload.description = 'NREGA: '+this.demographicDisp.identityProof.NREGANumber;
      let kycdata = (this.demographicDisp.kycData?.nrega?.data || {});
      let kycdata_var = JSON.stringify(kycdata);
      kycdata_var = kycdata_var.toString().replace('{','').replace('}','');
      let kycdata_s = kycdata_var.split(',');
      let kycdata_arr:any = [];
      kycdata_arr.push('Verified: ' + (this.demographicDisp.kycData?.nrega?.isVerified || 'NA'));
      kycdata_s.forEach((x: any) => {
        let y = x.toString().replace('"','').replace('"','').replace('"','').replace('"','').replace(':',':  ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ').replace('_',' ');
        kycdata_arr.push(y);
      });
      this.fileUpload.kyc = kycdata_arr; 
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.NREGA.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.NREGA.back
            );
    } else if (type === this.fileUploadFileFor.ownershipPicture) {
      this.fileUpload.popupTitle = 'Ownership Picture Image';
      let farmerFiles: any = localStorage.getItem('farmer-files');
      if (farmerFiles) {
        farmerFiles = JSON.parse(farmerFiles);
        for (let fIndex = 0; fIndex < Object.keys(farmerFiles).length; fIndex++) {
          let ownershipPicture =
          this.commonService.fetchFarmerDocument(
            this.indexedDBFileNameManage.ownershipPicture.front +
              '_' +
              this.fileUpload.new.fileIndex +
              '_' +
              fIndex
          );
          if (ownershipPicture) {
            this.fileUpload.new.imageMultiple.push(ownershipPicture);
          }
        }
      }
    }
    $('#fileUploadModalPopup').modal('show');
  }
}
