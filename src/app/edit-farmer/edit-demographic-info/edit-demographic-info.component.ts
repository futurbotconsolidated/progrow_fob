import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/common.service';

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
      isImage1Required: true,
      isImage2Required: false,
      isMultiple: false,
      fileIndex: 0,
    },
    imageHeading1: 'Front Image',
    imageHeading2: 'Back Image',
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
    ownershipPicture: {
      front: `${this.concatePage}_ownershipPictureImage`,
      count: `${this.concatePage}_ownershipPictureImageCount`,
    },
  };
  constructor(
    public commonService: CommonService
  ) {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
      console.log('this.demographicDisp : ', this.demographicDisp);
    }
  }

  ngOnInit(): void {}

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

      this.fileUpload.popupTitle = 'PAN Card Image';
      this.fileUpload.new.isImage1Required = true;

          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.panCard.front
            );
    }

    else if (type === this.fileUploadFileFor.aadhaarCard) {
      this.fileUpload.popupTitle = 'Aadhaar Card Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.aadhaarCard.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.aadhaarCard.back
            );

    } else if (type === this.fileUploadFileFor.drivingLicence) {
      this.fileUpload.popupTitle = 'Driving Licence Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.drivingLicence.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.drivingLicence.back
            );
    } else if (type === this.fileUploadFileFor.voterId) {
      this.fileUpload.popupTitle = 'Upload Voter Id Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.voterId.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.voterId.back
            );
    } else if (type === this.fileUploadFileFor.passport) {
      this.fileUpload.popupTitle = 'Passport Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.passport.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.passport.back
            );
    } else if (type === this.fileUploadFileFor.NREGA) {
      this.fileUpload.popupTitle = 'NREGA Image';
      this.fileUpload.new.isImage1Required = true;
      this.fileUpload.new.isImage2Required = true;
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.NREGA.front
            );
          this.fileUpload.new.imageSrc2 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.NREGA.back
            );
    } else if (type === this.fileUploadFileFor.farmerProfile) {
      this.fileUpload.popupTitle = 'Farmer Profile Image';
      this.fileUpload.imageHeading1 = 'Farmer Image';
      this.fileUpload.new.isImage1Required = true;
          this.fileUpload.new.imageSrc1 =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.farmerProfile.front
            );
 
    } else if (type === this.fileUploadFileFor.ownershipPicture) {
      this.fileUpload.popupTitle = 'Ownership Picture Image';
      this.fileUpload.imageHeading1 = 'Ownership Picture Image';
      this.fileUpload.new.isMultiple = true;
      var fCount = 0;
      let demoInfoFiles: any = localStorage.getItem('demo-info-files');
      if (demoInfoFiles) {
        demoInfoFiles = JSON.parse(demoInfoFiles);
        // let difkey =
        //   this.indexedDBFileNameManage.ownershipPicture.count +
        //   '_' +
        //   this.fileUpload.new.fileIndex;
        // if (demoInfoFiles[difkey]) {
        //   fCount = demoInfoFiles[difkey];
        // }
      }
      if (!fCount) {
        let farmerFiles: any = localStorage.getItem('farmer-files');
        if (farmerFiles) {
          farmerFiles = JSON.parse(farmerFiles);
          for (let ffi = 0; ffi < Object.keys(farmerFiles).length; ffi++) {
            // if (
            //   farmerFiles.hasOwnProperty(
            //     this.indexedDBFileNameManage.ownershipPicture.front +
            //       '_' +
            //       this.fileUpload.new.fileIndex +
            //       '_' +
            //       ffi
            //   )
            // ) {
            //   fCount++;
            // }
          }
        }
      }
      for (let fIndex = 0; fIndex < fCount; fIndex++) {
  
      }
    }
    $('#fileUploadModalPopup').modal('show');
  }
}
