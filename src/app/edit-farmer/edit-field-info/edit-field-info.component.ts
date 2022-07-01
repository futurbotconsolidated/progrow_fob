import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';

declare const L: any;
import 'leaflet-draw';
declare var $: any;
@Component({
  selector: 'app-edit-field-info',
  templateUrl: './edit-field-info.component.html',
  styleUrls: ['./edit-field-info.component.css'],
})
export class EditFieldInfoComponent implements OnInit {
  fieldInfo = {} as any;
  selectedCoordinates = [] as any;
  ownerShipDetails = [] as any;
  historicalDetails = [] as any;
  plannedDetails = [] as any;
  enumerateDetails = [] as any;
  typesOfTests = [] as any;
  editFieldArea = <any>[];
  fileUpload = {
    fileFor: '',
    popupTitle: '',
    new: {
      imageMultiple: [] as any,
      isMultiple: false,
      fileIndex: 0,
    },
  } as any;
  localStoragePageName = 'field-info-files';
  indexedDBPageName = 'field_info';
  concatePage = 'field';
  indexedDBName = 'registerFarmer';
  indexedDBFileNameManage = {
    ownershipPicture: {
      front: `${this.concatePage}_ownershipPictureImage`,
      count: `${this.concatePage}_ownershipPictureImageCount`
    },
    testPicture: {
      front: `${this.concatePage}_testPictureImage`,
      count: `${this.concatePage}_testPictureImageCount`
    },
  };
  fileUploadFileFor = {
    ownershipPicture: 'OWENERSHIP_PICTURE',
    testPicture: 'TEST_PICTURE',
  };
  constructor(
    public commonService: CommonService,
    private spinner: NgxSpinnerService
  ) {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.fieldInfo = JSON.parse(A).fieldInfo;
      console.log('this.fieldInfo : ', this.fieldInfo);
    }
  }

  ngOnInit(): void {
    if (this.fieldInfo) {
      this.editFieldArea = [];
      // this.spinner.show();
      this.fieldInfo?.forEach((el: any) => {
        this.ownerShipDetails.push(el.field_ownership_detail);
        this.plannedDetails.push(el.planned_season_detail.plannedFieldDetails);
        this.historicalDetails.push(
          el.historical_season_detail.historicalFieldDetails
        );
        if (el.test_on_fields.length) {
          el.test_on_fields?.forEach((eltof: any) => {
            this.typesOfTests.push(eltof);
          });
        } 
        // else {
        //   this.typesOfTests.push(el.test_on_fields);
        // }
        this.enumerateDetails.push(el.enumerate_planned_season);
      });
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          this.setGeoLocation.bind(this)
        );
      }
console.log('typesOfTests : ', this.typesOfTests)
      this.fieldInfo.forEach((el: any) => {
        this.editFieldArea.push(el.field_area_ha);
        let arr = el.field_boundary.geometry.coordinates;
        let co: any = [];
        arr.forEach((x: any) => {
          co.push([x[0], x[1]]);
        });

        this.selectedCoordinates.push(co);
      });
      this.spinner.hide();
    }
  }

  cleanString(str: any) {
    str = str.replace("'", '"');
    return str;
  }

  setGeoLocation(position: { coords: { latitude: any; longitude: any } }) {
    const {
      coords: { latitude, longitude },
    } = position;

    this.drawMap(latitude, longitude);
  }

  getDepth(id: any, type: string) {
    return type == 'Bore'
      ? this.enumerateDetails[id].boreDepth
      : this.enumerateDetails[id].pumpDepth;
  }

  drawMap(latitude: any, longitude: any) {
    let map = new L.Map('map', {
      center: new L.LatLng(latitude, longitude),
      zoom: 18,
      fullscreenControl: true,
      fullscreenControlOptions: {
        // optional
        title: 'Show me the fullscreen !',
        titleCancel: 'Exit fullscreen mode',
      },
    }),
      drawnItems = L.featureGroup().addTo(map);

    var mapboxAccessToken =
      'pk.eyJ1IjoicHVybmFyYW0iLCJhIjoiY2tpenBvZWpsMDNlaTMzcWpiZ2liZjEydiJ9.Mdj1w5dXDfCGCpIH5MlI2g';
    L.tileLayer(
      'http://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' +
      mapboxAccessToken,
      {
        id: 'mapbox/satellite-v9',
        attribution: '',
        tileSize: 512,
        zoomOffset: -1,
      }
    ).addTo(map);

    var searchControl = L.esri.Geocoding.geosearch({
      position: 'topright',
      placeholder: 'Enter an address or place e.g. 1 York St',
      useMapBounds: false,
      providers: [
        L.esri.Geocoding.arcgisOnlineProvider({
          apikey:
            'AAPKb10821df102a46a4b930958d7a6a06593sdla7i0cMWoosp7XXlYflDTAxsZMUq-oKvVOaom9B8CokPvJFd-sE88vOQ2B_rC', // replace with your api key - https://developers.arcgis.com
          nearby: {
            lat: 0,
            lng: 0,
          },
        }),
      ],
    }).addTo(map);

    var results = L.layerGroup().addTo(map);

    searchControl.on('results', function (data: any) {
      results.clearLayers();
      //L.markerClusterGroup();
      for (var i = data.results.length - 1; i >= 0; i--) {
        results.addLayer(L.marker(data.results[i].latlng));
      }
    });

    L.easyButton(
      '<span><i style="margin-top: 2px; margin-left: -1px;" class="fa fa-compass fa-2x"></i></span>',
      function (btn: any, map: any) {
        if (window.console) window.console.log('easyButton');
        map.locate({ setView: true, watch: false, enableHighAccuracy: true });
      }
    ).addTo(map);

    this.selectedCoordinates.forEach((x: any, index: number) => {
      var polygon = L.polygon(x).addTo(map);
      polygon
        .bindPopup(
          `Field ID : ${index + 1} <br/> Area : ${this.editFieldArea[index]
          } (Hectare)`
        )
        .openPopup();
      map.fitBounds(polygon.getBounds());
    });
  }
  openFileModalPopup(type: string, fileIndex: number) {
    this.fileUpload.fileFor = type;
    this.fileUpload.new.imageMultiple = [];
    this.fileUpload.new.isMultiple = false;
    this.fileUpload.new.fileIndex = fileIndex;

    if (type === this.fileUploadFileFor.ownershipPicture) {
      this.fileUpload.popupTitle = 'Ownership Documents';
      this.fileUpload.new.isMultiple = true;
      let farmerFiles: any = localStorage.getItem('farmer-files');
      if (farmerFiles) {
        farmerFiles = JSON.parse(farmerFiles);
        for (let fIndex = 0; fIndex <= Object.keys(farmerFiles).length; fIndex++) {
          let imageSrc =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.ownershipPicture.front + '_' + this.fileUpload.new.fileIndex + '_' + fIndex
            );
          if (imageSrc) {
            let type = 'file';
            if (imageSrc.includes('data:image/') || imageSrc.includes('.png') || imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('.gif')) {
              type = 'image';
            }
            let filename = imageSrc.split('/').pop().split('#')[0].split('?')[0];
            let imgObj = {
              file: imageSrc,
              type: type,
              name: filename.toString().substring(0, 60),
            };
            this.fileUpload.new.imageMultiple.push(imgObj);
          }
        }
      }
    } else if (type === this.fileUploadFileFor.testPicture) {
      this.fileUpload.popupTitle = 'Test Reports';
      this.fileUpload.new.isMultiple = true;
      let farmerFiles: any = localStorage.getItem('farmer-files');
      if (farmerFiles) {
        farmerFiles = JSON.parse(farmerFiles);
        for (let fIndex = 0; fIndex <= Object.keys(farmerFiles).length; fIndex++) {
          let imageSrc =
            this.commonService.fetchFarmerDocument(
              this.indexedDBFileNameManage.testPicture.front + '_' + this.fileUpload.new.fileIndex + '_' + fIndex
            );
          if (imageSrc) {
            let type = 'file';
            if (imageSrc.includes('data:image/') || imageSrc.includes('.png') || imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('.gif')) {
              type = 'image';
            }
            let filename = imageSrc.split('/').pop().split('#')[0].split('?')[0];
            let imgObj = {
              file: imageSrc,
              type: type,
              name: filename.toString().substring(0, 60),
            };
            this.fileUpload.new.imageMultiple.push(imgObj);
          }
        }
      }
    }
    $('#fileUploadModalPopup').modal('show');
  }

  downloadFile(data: any) {
    let dwldLink = document.createElement("a");
    dwldLink.setAttribute("target", "_blank");
    dwldLink.setAttribute("href", data);
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

}
