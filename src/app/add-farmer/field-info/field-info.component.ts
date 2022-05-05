import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CommonService } from '../../shared/common.service';

import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';
import { data } from '../../shared/fob_master_data';

// import 'leaflet';
declare const L: any;
import 'leaflet-draw';
import '../../../../node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import { AddFarmerService } from '../add-farmer.service';
import { ToastrService } from 'ngx-toastr';

enum SaveStatus {
  Saving = 'Saving...',
  Saved = 'Saved.',
  Idle = '',
}

declare var $: any;

@Component({
  selector: 'app-field-info',
  templateUrl: './field-info.component.html',
  styleUrls: ['./field-info.component.css'],
})
export class FieldInfoComponent implements OnInit {
  /* START: Variables */
  fieldInforMaster = <any>{};
  commonMaster = <any>{};

  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle =
    SaveStatus.Idle;
  SoilQualityStar = [] as any;
  selectedSoilQualityStar = [] as any;
  selectedWaterQualityStar = [] as any;
  selectedYieldQualityStar = [] as any;

  selectedHistoSoilQualityStar: any;
  selectedHistoWaterQualityStar: any;
  selectedHistoYieldQualityStar: any;

  nextRoute: any;
  fieldInfoForm = new FormGroup({});
  plannedFieldDetails!: FormArray;
  // historicalFieldDetails!: FormArray;
  fieldOwnership!: FormArray;
  enumerate!: FormArray;
  testType!: FormArray;

  selectedCoordinates = <any>[];
  drawnCoordinates = <any>[];

  field_boundary: any;
  fieldArea = <any>[];
  editFieldArea = <any>[];
  fieldIndexMapIds = <any>[];

  farmerId = ''; // edit feature

  fileUpload = {
    fileFor: '',
    popupTitle: '',
    new: {
      imageMultiple: [] as any,
      isMultiple: false,
      fileIndex: 0,
    },
    imageHeading1: 'Front Image',
   } as any;
  /* END: Variables */
  /* START: indexed db variables */
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
  /* END: indexed db variables */

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router,
    private toastr: ToastrService,
    private dbService: NgxIndexedDBService,
    public commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {
    this.fieldInfoForm = this.formBuilder.group({
      plannedSeason: new FormControl('', [Validators.required]),
      plannedCrops: new FormControl('', [Validators.required]),
      plannedFieldDetails: new FormArray([]),
      // historicalFieldDetails: new FormArray([]),
      fieldOwnership: new FormArray([]),
      testType: new FormArray([]),
      enumerate: new FormArray([]),
      cropCycleOnReports: new FormControl('', [Validators.required]), //radio
    });

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }

  ngOnInit(): void {
    this.fieldInforMaster = data.fieldInfo; // read master data
    // this.commonMaster = data.commonData; // read master data 

    this.SoilQualityStar = this.fieldInforMaster['soilQuality'];

    this.selectedCoordinates = [];
    this.fieldArea = [];
    this.editFieldArea = [];
    this.fieldIndexMapIds = [];
    // -----------------------start auto save --------------------
    // draft feature is not required in edit operation
    if (!this.farmerId) {
      this.fieldInfoForm.valueChanges
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
          var fimi_coordinates = [] as any;
          this.fieldIndexMapIds.forEach((fimi_value: any) => {
            fimi_coordinates.push(fimi_value.coordinates);
          });
          draft_farmer_new['field_info_form'] = form_values;
          draft_farmer_new['field_info_coordinates'] = fimi_coordinates;
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
    // -----------------------End auto save --------------------
    // if case is for EDIT and else case is for NEW/DRAFT
    if (this.farmerId) {
      let editForm: any = localStorage.getItem('edit-field-info-form');
      if (editForm) {
        let map_info: any = localStorage.getItem('edit-field-info');
        map_info = JSON.parse(map_info);
        if (map_info) {
          this.editFieldArea = [];
          this.selectedCoordinates = [];
          map_info.forEach((el: any) => {
            this.editFieldArea.push(el.field_area_ha);
            this.selectedCoordinates.push(
              el.field_boundary.geometry.coordinates
            );
          });
        }
        editForm = JSON.parse(editForm);
        this.bindItemsInEdit(editForm);
      } else {
        const farmer_details: any = localStorage.getItem('farmer-details');
        if (farmer_details) {
          const edit_field_info = JSON.parse(farmer_details).fieldInfo;
          var editFieldInfo = {} as any;
          editFieldInfo.plannedFieldDetails = [] as any;
          // editFieldInfo.historicalFieldDetails = [] as any;
          editFieldInfo.fieldOwnership = [] as any;
          editFieldInfo.testType = [] as any;
          editFieldInfo.enumerate = [] as any;
          this.editFieldArea = [];
          this.selectedCoordinates = [];
          edit_field_info.forEach((fiv: any, findex: number) => {
            editFieldInfo.enumerate.push(fiv.enumerate_planned_season);
            editFieldInfo.fieldOwnership.push(fiv.field_ownership_detail);
            // editFieldInfo.historicalFieldDetails.push(
            //   fiv.historical_season_detail.historicalFieldDetails
            // );
            if(typeof(fiv.planned_season_detail.plannedFieldDetails) == 'object'){
              fiv.planned_season_detail.plannedFieldDetails.crop_id = fiv.crop_id;
            }
            editFieldInfo.plannedFieldDetails.push(
              fiv.planned_season_detail.plannedFieldDetails
            );

            if (fiv.test_on_fields) {
              editFieldInfo.testType.push(fiv.test_on_fields);
            }
            editFieldInfo.cropCycleOnReports = fiv.undertaking_cultivation.uc;
            editFieldInfo.plannedSeason = fiv.crop_season_id+'##'+fiv.planned_season_detail.plannedSeason;
            editFieldInfo.plannedCrops = fiv.planned_season_detail.plannedCrops;
            this.editFieldArea.push(fiv.field_area_ha);
            this.selectedCoordinates.push(
              fiv.field_boundary.geometry.coordinates
            );
          });
          this.bindItemsInEdit(editFieldInfo);
        }
      }
    } else {
      let fieldInfo: any = localStorage.getItem('field-info-form');
      if (fieldInfo) {
        let fieldInfoCoordinates: any = localStorage.getItem(
          'field-info-coordinates'
        );
        if (fieldInfoCoordinates) {
          fieldInfoCoordinates = JSON.parse(fieldInfoCoordinates);
        }
        fieldInfo = JSON.parse(fieldInfo);
        this.bindItemsInEdit(fieldInfo);
      }

      let map_info: any = localStorage.getItem('field-info');
      map_info = JSON.parse(map_info);
      if (map_info) {
        this.editFieldArea = [];
        this.selectedCoordinates = [];
        map_info.forEach((el: any) => {
          this.editFieldArea.push(el.field_area_ha);
          this.selectedCoordinates.push(el.field_boundary.geometry.coordinates);
        });
      }
    }
    if (!(this.fieldInfoForm.get('testType') as FormArray).controls.length) {
      this.addTestType();
    }

    this.commonMaster.crops = [];
    this.commonMaster.season = [];
    this.commonService.getMasterData().subscribe(
      (res: any) => {
        //this.spinner.hide();
        if (res && !res.status) {
          console.log(`${res[0].Message}`);
        } else {
          if(res.data && res.data.crops){
            this.commonMaster.crops = res.data.crops;
          }
          if(res.data && res.data.seasons){
            this.commonMaster.season = res.data.seasons;
          }
        }
      },
      (error: any) => {
        //this.spinner.hide();
        console.log('Failed to fetch PinCode Details, please try again...');
      }
    );
  }

  bindItemsInEdit(fieldValues: any) {
    console.log('fieldValues : ', fieldValues);
    this.fieldInfoForm.patchValue(fieldValues);
    fieldValues.plannedFieldDetails.map((item: any, index: number) => {
      const plannedDetails = <any>{};
      plannedDetails['fieldId'] = new FormControl(item.fieldId);
      plannedDetails['fieldName'] = new FormControl(item.fieldName);
      plannedDetails['fieldArea'] = new FormControl(item.fieldArea);
      plannedDetails['irrigationSystem'] = new FormControl(
        item.irrigationSystem
      );
      plannedDetails['waterSource'] = new FormControl(item.waterSource);
      if(item.crop_id){
        plannedDetails['crop'] = new FormControl(item.crop_id+'##'+item.crop);
      } else {
      plannedDetails['crop'] = new FormControl(item.crop);
      }
      plannedDetails['soilQuality'] = new FormControl(item.soilQuality);
      plannedDetails['waterQuality'] = new FormControl(item.waterQuality);
      plannedDetails['yieldQuality'] = new FormControl(item.yieldQuality);
      plannedDetails['expectedProduce'] = new FormControl(item.expectedProduce);

      this.selectedSoilQualityStar[index] = item.soilQuality;
      this.selectedWaterQualityStar[index] = item.waterQuality;
      this.selectedYieldQualityStar[index] = item.yieldQuality;

      this.plannedFieldDetails = this.fieldInfoForm.get(
        'plannedFieldDetails'
      ) as FormArray;
      this.plannedFieldDetails.push(new FormGroup(plannedDetails));
    });

    // fieldValues.historicalFieldDetails.map((item: any) => {
    //   const histDetails = <any>{};
    //   histDetails['fieldId'] = new FormControl(item.fieldId);
    //   histDetails['fieldArea'] = new FormControl(item.fieldArea);
    //   histDetails['irrigationSystem'] = new FormControl(item.irrigationSystem);
    //   histDetails['waterSource'] = new FormControl(item.waterSource);
    //   histDetails['crop'] = new FormControl(item.crop);
    //   histDetails['soilQuality'] = new FormControl(item.soilQuality);
    //   histDetails['waterQuality'] = new FormControl(item.waterQuality);
    //   histDetails['yieldQuality'] = new FormControl(item.yieldQuality);
    //   histDetails['historicalCrops'] = new FormControl(item.historicalCrops);
    //   histDetails['historicalSeason'] = new FormControl(item.historicalSeason);
    //   this.historicalFieldDetails = this.fieldInfoForm.get(
    //     'historicalFieldDetails'
    //   ) as FormArray;
    //   this.historicalFieldDetails.push(new FormGroup(histDetails));
    // });

    fieldValues.enumerate.map((item: any) => {
      const enumerateDetails = <any>{};
      enumerateDetails['fieldId'] = new FormControl(item.fieldId);
      enumerateDetails['boreDepth'] = new FormControl(item.boreDepth);
      enumerateDetails['pumpDepth'] = new FormControl(item.pumpDepth);
      enumerateDetails['waterSource'] = new FormControl(item.waterSource);
      this.enumerate = this.fieldInfoForm.get('enumerate') as FormArray;
      this.enumerate.push(new FormGroup(enumerateDetails));
    });

    fieldValues.fieldOwnership.map((item: any) => {
      const fieldOwnershipDetails = <any>{};
      fieldOwnershipDetails['fieldOwnId'] = new FormControl(item.fieldOwnId);
      fieldOwnershipDetails['fieldOwnCoOwner'] = new FormControl(
        item.fieldOwnCoOwner
      );
      fieldOwnershipDetails['fieldOwnCoPh'] = new FormControl(
        item.fieldOwnCoPh
      );
      fieldOwnershipDetails['ownerType'] = new FormControl(item.ownerType);
      this.fieldOwnership = this.fieldInfoForm.get(
        'fieldOwnership'
      ) as FormArray;
      this.fieldOwnership.push(new FormGroup(fieldOwnershipDetails));
    });

    this.testType = this.fieldInfoForm.get('testType') as FormArray;
    fieldValues.testType.forEach((listitem: any) => {
      if (listitem.hasOwnProperty('fieldId')) {
        let item = listitem;
        const testTypeDetails = <any>{};
        testTypeDetails['fieldId'] = new FormControl(item.fieldId);
        testTypeDetails['typeOfTest'] = new FormControl(item.typeOfTest);
        testTypeDetails['yesNo'] = new FormControl(item.yesNo);
        testTypeDetails['lastDone'] = new FormControl(item.lastDone);
        testTypeDetails['testResult'] = new FormControl(item.testResult);
        this.testType.push(new FormGroup(testTypeDetails));
      } else {
        listitem.map((item: any) => {
          const testTypeDetails = <any>{};
          testTypeDetails['fieldId'] = new FormControl(item.fieldId);
          testTypeDetails['typeOfTest'] = new FormControl(item.typeOfTest);
          testTypeDetails['yesNo'] = new FormControl(item.yesNo);
          testTypeDetails['lastDone'] = new FormControl(item.lastDone);
          testTypeDetails['testResult'] = new FormControl(item.testResult);
          this.testType.push(new FormGroup(testTypeDetails));
        });
      }
    });
  }
  ngAfterViewInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setGeoLocation.bind(this));
    }
    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      if (this.router.url?.includes('/add/field-info')) {
        this.saveData();
        console.log(data.routeName);
      }
    });
  }

  setGeoLocation(position: { coords: { latitude: any; longitude: any } }) {
    const {
      coords: { latitude, longitude },
    } = position;
    if (this.selectedCoordinates.length) {
      if (
        this.selectedCoordinates[0][0][0] &&
        this.selectedCoordinates[0][0][1]
      ) {
        this.drawMap(
          this.selectedCoordinates[0][0][0],
          this.selectedCoordinates[0][0][1]
        );
      } else {
        this.drawMap(latitude, longitude);
      }
    } else {
      this.drawMap(latitude, longitude);
    }
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
    // L.tileLayer(
    //   'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
    //   { maxZoom: 19, attribution: 'google' }
    // ).addTo(map);

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

    map.addControl(
      new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
          remove: true,
          poly: {
            allowIntersection: false,
          },
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: false,
          },
          polyline: false,
          circle: false,
          rectangle: false,
          marker: false,
          circlemarker: false,
        },
      })
    );

    map.on(L.Draw.Event.CREATED, (event: any) => {
      console.log('Event.CREATED', event);

      var layer = event.layer;
      let drawnLatLng: any[] = [];
      let arr = layer.getLatLngs();
      arr[0].forEach((x: any) => {
        drawnLatLng.push([x.lat, x.lng]);
      });

      console.log('getLatLngs', layer.getLatLngs());
      let ob = {
        type: 'field-boundary',
        geometry: {
          coordinates: drawnLatLng,
          type: event.layerType,
        },
      };
      this.drawnCoordinates.push(ob);
      this.addPlannedFieldDetails();
      // this.addHistoFieldDetail();
      this.addFieldOwnershipDetail();
      this.addEnumerate();
      console.log(this.plannedFieldDetails);
      drawnItems.addLayer(layer);
      var pfd_last_index = -1;
      (
        this.fieldInfoForm.get('plannedFieldDetails') as FormArray
      ).controls.forEach((x: any, index: number) => {
        pfd_last_index = index;
      });
      let fimi_ob = {
        field_index: pfd_last_index,
        leaflet_id: layer._leaflet_id,
        coordinates: drawnLatLng,
      };
      this.fieldIndexMapIds.push(fimi_ob);
      var area_sq_meter = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      var area_hec = (area_sq_meter / 10000).toFixed(2);
      this.fieldArea.push(area_hec);
      (
        this.fieldInfoForm.get('plannedFieldDetails') as FormArray
      ).controls.forEach((x: any, index: number) => {
        if (pfd_last_index == index) {
          x.get('fieldArea').setValue(area_hec);
        }
      });
      // (
      //   this.fieldInfoForm.get('historicalFieldDetails') as FormArray
      // ).controls.forEach((x: any, index: number) => {
      //   if (pfd_last_index == index) {
      //     x.get('fieldArea').setValue(area_hec);
      //   }
      // });
      layer
        .bindPopup(
          `Field ID : ${pfd_last_index + 1} <br/> Area : ${area_hec} (Hectare)`
        )
        .openPopup();
    });

    map.on(L.Draw.Event.EDITED, (e: any) => {
      console.log('Event.EDITED', e);
      let layers = e.layers;
      console.log(this.fieldIndexMapIds);
      let fieldIndexMapIds_var = this.fieldIndexMapIds;
      var field_index = -1;
      var area_hec = '';
      var layer_latlngs = [] as any;
      layers.eachLayer(function (layer: any) {
        fieldIndexMapIds_var.forEach((x: any, index: number) => {
          if (layer._leaflet_id == x.leaflet_id) {
            field_index = x.field_index;
            layer_latlngs = layer.getLatLngs();
            let area_sq_meter = L.GeometryUtil.geodesicArea(
              layer.getLatLngs()[0]
            );
            area_hec = (area_sq_meter / 10000).toFixed(2);
            layer
              .bindPopup(
                `Field ID : ${field_index + 1
                } <br/> Area : ${area_hec} (Hectare)`
              )
              .openPopup();
          }
        });
      });
      let drawnLatLng: any[] = [];
      if (layer_latlngs.length && layer_latlngs[0]) {
        layer_latlngs[0].forEach((x: any) => {
          drawnLatLng.push([x.lat, x.lng]);
        });
        this.fieldIndexMapIds.forEach((x: any, index: number) => {
          if (field_index == x.field_index) {
            this.fieldIndexMapIds[index].coordinates = drawnLatLng;
          }
        });
      }
      (
        this.fieldInfoForm.get('plannedFieldDetails') as FormArray
      ).controls.forEach((x: any, index: number) => {
        if (field_index == index) {
          x.get('fieldArea').setValue(area_hec);
        }
      });
      // (
      //   this.fieldInfoForm.get('historicalFieldDetails') as FormArray
      // ).controls.forEach((x: any, index: number) => {
      //   if (field_index == index) {
      //     x.get('fieldArea').setValue(area_hec);
      //   }
      // });
    });

    map.on(L.Draw.Event.DELETED, (e: any) => {
      console.log('Event.DELETED', e);
      let layers = e.layers;
      let fieldIndexMapIds_var = this.fieldIndexMapIds;
      var field_index = -1;
      var fimi_index = -1;
      layers.eachLayer(function (layer: any) {
        fieldIndexMapIds_var.forEach((x: any, index: number) => {
          if (layer._leaflet_id == x.leaflet_id) {
            field_index = x.field_index;
            fimi_index = index;
          }
        });
      });
      if (field_index >= 0) {
        this.removePlannedFieldDetails(field_index);
        // this.removeHistoFieldDetail(field_index);
        this.removeFieldOwnershipDetail(field_index);
        this.removeEnumerate(field_index);
        if (fieldIndexMapIds_var[fimi_index]) {
          delete fieldIndexMapIds_var[fimi_index];
        }
      }
      var fieldIndexMapIds_v = fieldIndexMapIds_var.filter(function (el: any) {
        return el != null;
      });
      this.fieldIndexMapIds = fieldIndexMapIds_v;
    });

    map.on('draw:editvertex', (e: any) => {
      var poly = e.poly;
      var latlngs = poly.getLatLngs(); // here the polygon latlngs
      this.field_boundary = {
        type: 'field-boundary',
        geometry: {
          coordinates: latlngs,
          type: e.layerType,
        },
      };

      console.log('latlngs', this.field_boundary);
    });

    map.on('enterFullscreen', function () {
      if (window.console) window.console.log('enterFullscreen');
    });
    map.on('exitFullscreen', function () {
      if (window.console) window.console.log('exitFullscreen');
    });
    var locationlayerGroup = L.layerGroup().addTo(map);
    map.on('locationfound', function (e: any) {
      if (window.console) window.console.log('locationfound');
      locationlayerGroup.clearLayers();
      var circleOptions = {
        color: '#FFFFFF',
        weight: 0,
        opacity: 0,
        fill: true,
        fillColor: '#1A73E9',
        fillOpacity: 0.25,
      };
      var circle = L.circle(e.latlng, 15, circleOptions).addTo(
        locationlayerGroup
      );
      var myIcon = L.divIcon({ className: 'my-current-loc-icon' });
      L.marker(e.latlng, { icon: myIcon }).addTo(locationlayerGroup);
    });

    this.selectedCoordinates.forEach((x: any, index: number) => {
      var polygon = L.polygon(x);
      polygon
        .bindPopup(
          `Field ID : ${index + 1} <br/> Area : ${this.editFieldArea[index]
          } (Hectare)`
        )
        .openPopup();
      drawnItems.addLayer(polygon);
      map.fitBounds(polygon.getBounds());
      let fimi_ob = {
        field_index: index,
        leaflet_id: polygon._leaflet_id,
        coordinates: x,
      };
      this.fieldIndexMapIds.push(fimi_ob);
    });
  }

  createFieldDetails(): FormGroup {
    return this.formBuilder.group({
      fieldId: new FormControl('', [Validators.required]),
      fieldName: new FormControl('', [Validators.required]),
      fieldArea: new FormControl('', [Validators.required]),
      irrigationSystem: new FormControl('', [Validators.required]),
      waterSource: new FormControl('', [Validators.required]),
      crop: new FormControl('', [Validators.required]),
      soilQuality: new FormControl(' ', [Validators.required]),
      waterQuality: new FormControl(' ', [Validators.required]),
      yieldQuality: new FormControl(' ', [Validators.required]),
      expectedProduce: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]*$'),
        Validators.minLength(5),
      ]),
    });
  }

  getPlannedFieldDetailsControls() {
    return (this.fieldInfoForm.get('plannedFieldDetails') as FormArray)
      .controls;
  }

  addPlannedFieldDetails(): void {
    this.plannedFieldDetails = this.fieldInfoForm.get(
      'plannedFieldDetails'
    ) as FormArray;
    this.plannedFieldDetails.push(this.createFieldDetails());
  }

  removePlannedFieldDetails(index: any) {
    this.plannedFieldDetails.removeAt(index);
  }

  // createHistoFieldDetails(): FormGroup {
  //   return this.formBuilder.group({
  //     historicalSeason: new FormControl('', [Validators.required]),
  //     historicalCrops: new FormControl('', [Validators.required]),
  //     fieldId: new FormControl('', [Validators.required]),
  //     fieldArea: new FormControl('', [Validators.required]),
  //     irrigationSystem: new FormControl('', [Validators.required]),
  //     waterSource: new FormControl('', [Validators.required]),
  //     crop: new FormControl('', [Validators.required]),
  //     soilQuality: new FormControl(' ', [Validators.required]),
  //     waterQuality: new FormControl(' ', [Validators.required]),
  //     yieldQuality: new FormControl(' ', [Validators.required]),
  //   });
  // }

  // getHistoFieldDetailsControls() {
  //   return (this.fieldInfoForm.get('historicalFieldDetails') as FormArray)
  //     .controls;
  // }

  // addHistoFieldDetail(): void {
  //   this.historicalFieldDetails = this.fieldInfoForm.get(
  //     'historicalFieldDetails'
  //   ) as FormArray;
  //   this.historicalFieldDetails.push(this.createHistoFieldDetails());
  // }

  // removeHistoFieldDetail(index: any) {
  //   this.historicalFieldDetails.removeAt(index);
  // }

  createFieldOwnershipDetails(): FormGroup {
    return this.formBuilder.group({
      fieldOwnId: new FormControl('', [Validators.required]),
      ownerType: new FormControl('', []),
      fieldOwnCoOwner: new FormControl('', [Validators.required]),
      fieldOwnCoPh: new FormControl('', [Validators.required]),
    });
  }

  getFieldOwnershipDetailsControls() {
    return (this.fieldInfoForm.get('fieldOwnership') as FormArray).controls;
  }

  addFieldOwnershipDetail(): void {
    this.fieldOwnership = this.fieldInfoForm.get('fieldOwnership') as FormArray;
    this.fieldOwnership.push(this.createFieldOwnershipDetails());
  }

  removeFieldOwnershipDetail(index: any) {
    this.fieldOwnership.removeAt(index);
  }

  createEnumerate(): FormGroup {
    return this.formBuilder.group({
      fieldId: new FormControl('', [Validators.required]),
      waterSource: new FormControl('', [Validators.required]),
      boreDepth: new FormControl('', [Validators.required]),
      pumpDepth: new FormControl('', [Validators.required]),
    });
  }

  getEnumerateControls() {
    return (this.fieldInfoForm.get('enumerate') as FormArray).controls;
  }

  addEnumerate(): void {
    this.enumerate = this.fieldInfoForm.get('enumerate') as FormArray;
    this.enumerate.push(this.createEnumerate());
  }

  removeEnumerate(index: any) {
    this.enumerate.removeAt(index);
  }

  createTestType(): FormGroup {
    return this.formBuilder.group({
      fieldId: new FormControl('', [Validators.required]),
      typeOfTest: new FormControl('', [Validators.required]),
      yesNo: new FormControl('', [Validators.required]),
      lastDone: new FormControl('', [Validators.required]),
      testResult: new FormControl('', [Validators.required]),
    });
  }

  getTestTypeControls() {
    return (this.fieldInfoForm.get('testType') as FormArray).controls;
  }

  addTestType(): void {
    this.testType = this.fieldInfoForm.get('testType') as FormArray;
    this.testType.push(this.createTestType());
  }

  removeTestType(index: any) {
    this.testType.removeAt(index);
  }

  saveData() {
    let fieldArr = [] as any;
    let obj;
    var field_ui_id = 0;
    this.fieldIndexMapIds.forEach((x: any, i: number) => {
      field_ui_id = i + 1;
      this.fieldInfoForm.value.plannedFieldDetails[i].fieldId = i + 1;
      // this.fieldInfoForm.value.historicalFieldDetails[i].fieldId = i + 1;
      this.fieldInfoForm.value.enumerate[i].fieldId = i + 1;
      this.fieldInfoForm.value.fieldOwnership[i].fieldOwnId = i + 1;
      var drawnCoordinates_obj = {
        type: 'field-boundary',
        geometry: {
          coordinates: x.coordinates,
          type: 'Polygon',
        },
      } as any;
      var test_arr = [] as any;
      this.fieldInfoForm.value.testType.forEach((tdata: any, ti: number) => {
        if (tdata.fieldId == field_ui_id) {
          test_arr.push(tdata);
        }
      });
      let season_arr = this.fieldInfoForm.value.plannedSeason.split('##');
      let crop_arr = this.fieldInfoForm.value.plannedFieldDetails[i].crop?.split('##');
      let plannedFieldDetails = this.fieldInfoForm.value.plannedFieldDetails[i];
      plannedFieldDetails.crop = crop_arr[1];

      obj = {
        field_ui_id: field_ui_id,
        crop_season_id: season_arr[0],
        crop_id: crop_arr[0],
        field_name: this.fieldInfoForm.value.plannedFieldDetails[i].fieldName,
        field_boundary: drawnCoordinates_obj,
        field_area_ha:
          this.fieldInfoForm.value.plannedFieldDetails[i].fieldArea,
        field_address: 'test',
        planned_season_detail: {
          plannedSeason: season_arr[1],
          plannedCrops: this.fieldInfoForm.value.plannedCrops,
          plannedFieldDetails: plannedFieldDetails,
          // plannedFieldDetails: this.fieldInfoForm.value.plannedFieldDetails[i],
        },
        historical_season_detail: {
          // historicalSeason: this.fieldInfoForm.value.historicalSeason,
          // historicalCrops: this.fieldInfoForm.value.historicalCrops,
          // historicalFieldDetails:
          //   this.fieldInfoForm.value.historicalFieldDetails[i],
        },
        field_ownership_detail: this.fieldInfoForm.value.fieldOwnership[i],
        enumerate_planned_season: this.fieldInfoForm.value.enumerate[i],
        test_on_fields: test_arr || '', //this.fieldInfoForm.value.testType[i] || '',
        undertaking_cultivation: {
          uc: this.fieldInfoForm.value.cropCycleOnReports,
        },
        is_required_yn: true,
      };
      fieldArr.push(obj);
    });

    console.log('fieldArr : ', fieldArr);
    if (!fieldArr.length) {
      this.toastr.error('Please Plot at least One Field', 'Error!');
      return;
    } else {
      if (this.farmerId) {
        localStorage.setItem('edit-field-info', JSON.stringify(fieldArr));
        localStorage.setItem(
          'edit-field-info-form',
          JSON.stringify(this.fieldInfoForm.value)
        );
      } else {
        localStorage.setItem('field-info', JSON.stringify(fieldArr));
        localStorage.setItem(
          'field-info-form',
          JSON.stringify(this.fieldInfoForm.value)
        );
      }
      const url = `/add/${this.nextRoute}/${this.farmerId}`;
      this.router.navigate([url]);
    }
  }

  SoilQualityRating(soilQualityStar: any, i: number) {
    this.selectedSoilQualityStar[i] = soilQualityStar;
  }

  WaterQualityRating(waterQualityStar: any, i: number) {
    this.selectedWaterQualityStar[i] = waterQualityStar;
  }

  YieldQualityRating(yieldQualityStar: any, i: number) {
    this.selectedYieldQualityStar[i] = yieldQualityStar;
  }

  HistoSoilQualityRating(soilQualityStar: any) {
    this.selectedHistoSoilQualityStar = soilQualityStar;
  }

  HistoWaterQualityRating(waterQualityStar: any) {
    this.selectedHistoWaterQualityStar = waterQualityStar;
  }

  HistoYieldQualityRating(yieldQualityStar: any) {
    this.selectedHistoYieldQualityStar = yieldQualityStar;
  }

  validateNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  validateDecimalNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode > 31 && (charCode < 48 || charCode > 57) && charCode != 46) ||
      (charCode == 46 && e.target.value.indexOf('.') !== -1)
    ) {
      return false;
    }
    return true;
  }

  numbersOnlyValidator(event: any) {
    const pattern = /^[0-9\-]*$/;
    if (!pattern.test(event.target.value)) {
      event.target.value = event.target.value.replace(/[^0-9\-]/g, '');
    }
  }

  ngOnDestroy() { }

  /* START: functions used indexed-db ============================================ */
  openFileModalPopup(type: string, fileIndex: number) {
    this.fileUpload.fileFor = type;    
    this.fileUpload.new.imageMultiple = [];
    this.fileUpload.new.isMultiple = false;
    this.fileUpload.new.fileIndex = fileIndex;
    this.fileUpload.imageHeading1 = 'Front Image';

    if (type === this.fileUploadFileFor.ownershipPicture) {
      this.fileUpload.popupTitle = 'Upload Ownership Documents';
      this.fileUpload.imageHeading1 = 'Ownership Documents';
      this.fileUpload.new.isMultiple = true;
      var fCount = this.getFileCount(
        this.indexedDBFileNameManage.ownershipPicture.count + '_' + this.fileUpload.new.fileIndex,
        this.indexedDBFileNameManage.ownershipPicture.front + '_' + this.fileUpload.new.fileIndex
      );
      for (let fIndex = 0; fIndex <= fCount; fIndex++) {
        this.dbService
          .getByIndex(
            this.indexedDBName,
            'fileFor',
            `${this.indexedDBFileNameManage.ownershipPicture.front + '_' + this.fileUpload.new.fileIndex + '_' + fIndex}`
          )
          .subscribe((farmer: any) => {
            let imageSrc =
              farmer?.file ||
              this.commonService.fetchFarmerDocument(
                this.indexedDBFileNameManage.ownershipPicture.front + '_' + this.fileUpload.new.fileIndex + '_' + fIndex
              );
            if (imageSrc) {
              let type = 'file';
              if (imageSrc.includes('.png') || imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('.gif')) {
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
          });
      }
    } else if (type === this.fileUploadFileFor.testPicture) {
      this.fileUpload.popupTitle = 'Upload Test Reports';
      this.fileUpload.imageHeading1 = 'Test Reports';
      this.fileUpload.new.isMultiple = true;
      var fCount = this.getFileCount(
        this.indexedDBFileNameManage.testPicture.count + '_' + this.fileUpload.new.fileIndex,
        this.indexedDBFileNameManage.testPicture.front + '_' + this.fileUpload.new.fileIndex
      );
      for (let fIndex = 0; fIndex <= fCount; fIndex++) {
        this.dbService
          .getByIndex(
            this.indexedDBName,
            'fileFor',
            `${this.indexedDBFileNameManage.testPicture.front + '_' + this.fileUpload.new.fileIndex + '_' + fIndex}`
          )
          .subscribe((farmer: any) => {
            let imageSrc =
              farmer?.file ||
              this.commonService.fetchFarmerDocument(
                this.indexedDBFileNameManage.testPicture.front + '_' + this.fileUpload.new.fileIndex + '_' + fIndex
              );
            if (imageSrc) {
              let type = 'file';
              if (imageSrc.includes('.png') || imageSrc.includes('.jpg') || imageSrc.includes('.jpeg') || imageSrc.includes('.gif')) {
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
          });
      }
    }
    $('#fileUploadModalPopup').modal('show');
  }

  onFileChange(event: any, type = '', fileIndex: number) {
    if (event.target.files && event.target.files.length) {
      this.fileUpload.new.fileIndex = fileIndex;      
      for (let findex = 0; findex < event.target.files.length; findex++) {
        const file = event.target.files[findex];        
        // if (file.size > 300000) {
        //   this.toastr.error('Image size can be upto 300KB Maximum.', 'Error!');
        //   return;
        // }
        // if (file.type.split('/')[0] != 'image') {
        //   this.toastr.error('Only Image files are allowed.', 'Error!');
        //   return;
        // }

        /* START: reading file and Patching the Selected File */
        const reader = new FileReader();
        let selectedImageFor = '';
        reader.readAsDataURL(file);
        reader.onload = () => {
          const imageSrc: any = reader.result;
          if (
            this.fileUpload.fileFor === this.fileUploadFileFor.ownershipPicture
          ) {
            if (type === 'FRONT_IMAGE') {
              let type = 'file';
              if (imageSrc.includes('data:image/')) {
                type = 'image';                
              }
              let imgObj = {
                file: imageSrc,
                type: type,
                name: file.name,
              };
              this.fileUpload.new.imageMultiple.push(imgObj);
              selectedImageFor = this.indexedDBFileNameManage.ownershipPicture.front + '_' + this.fileUpload.new.fileIndex + '_' + (findex+this.fileUpload.new.imageMultiple.length);
            }
          } else if (
            this.fileUpload.fileFor === this.fileUploadFileFor.testPicture
          ) {
            if (type === 'FRONT_IMAGE') {
              let type = 'file';
              if (imageSrc.includes('data:image/')) {
                type = 'image';
              }
              let imgObj = {
                file: imageSrc,
                type: type,
                name: file.name,
              };
              this.fileUpload.new.imageMultiple.push(imgObj);
              selectedImageFor = this.indexedDBFileNameManage.testPicture.front + '_' + this.fileUpload.new.fileIndex + '_' + (findex+this.fileUpload.new.imageMultiple.length);
            }
          }
          /* START: ngx-indexed-db feature to store files(images/docs) */
          // if file already exist then delete then add
          this.dbService
            .getByIndex(this.indexedDBName, 'fileFor', selectedImageFor)
            .subscribe((file: any) => {
              if (file && file !== undefined && Object.keys(file).length && (this.fileUpload.fileFor !== this.fileUploadFileFor.ownershipPicture && this.fileUpload.fileFor !== this.fileUploadFileFor.testPicture)) {
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
      let difkey = '';
      if (
        this.fileUpload.fileFor === this.fileUploadFileFor.ownershipPicture
      ) {
        difkey = this.indexedDBFileNameManage.ownershipPicture.count + '_' + this.fileUpload.new.fileIndex;
      } else if (
        this.fileUpload.fileFor === this.fileUploadFileFor.testPicture
      ) {
        difkey = this.indexedDBFileNameManage.testPicture.count + '_' + this.fileUpload.new.fileIndex;
      }
      let fieldInfoFiles: any = localStorage.getItem(this.localStoragePageName);
      if (fieldInfoFiles) {
        fieldInfoFiles = JSON.parse(fieldInfoFiles);
      } else {
        fieldInfoFiles = {};
      }
      fieldInfoFiles[difkey] = this.fileUpload.new.imageMultiple.length;
      localStorage.setItem(this.localStoragePageName, JSON.stringify(fieldInfoFiles));
    }
  }

  getFileCount(ckey = '', fkey = '') {
    var fCount = 0;
    let fieldInfoFiles: any = localStorage.getItem(this.localStoragePageName);
    if (fieldInfoFiles) {
      fieldInfoFiles = JSON.parse(fieldInfoFiles);
      if (fieldInfoFiles.hasOwnProperty(ckey)) {
        fCount = fieldInfoFiles[ckey];
      }
    }
      let farmerFiles: any = localStorage.getItem('farmer-files');
      if (farmerFiles) {
        farmerFiles = JSON.parse(farmerFiles);
        for (let ffi = 0; ffi < Object.keys(farmerFiles).length; ffi++) {
          if (farmerFiles.hasOwnProperty(fkey + '_' + ffi)) {
            fCount++;
          }
        }
      }
    return fCount;
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
