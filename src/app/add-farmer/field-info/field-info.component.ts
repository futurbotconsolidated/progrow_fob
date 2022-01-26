import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';

// import 'leaflet';
declare const L: any;
import 'leaflet-draw';
import '../../../../node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import {
  season,
  irrigationSystem,
  waterSource,
  ownerShipType,
  cropCycleOnReports,
} from '../../shared/modal/global-field-values';
import { AddFarmerService } from '../add-farmer.service';
@Component({
  selector: 'app-field-info',
  templateUrl: './field-info.component.html',
  styleUrls: ['./field-info.component.css'],
})
export class FieldInfoComponent implements OnInit {
  nextRoute: any;
  fieldInfoForm = new FormGroup({});
  plannedFieldDetails!: FormArray;
  historicalFieldDetails!: FormArray;
  fieldOwnership!: FormArray;
  enumerate!: FormArray;
  plannedSeasonList = <any>[];
  irrigationSystemList = <any>[];
  waterSourceList = <any>[];
  ownerShipTypeList = <any>[];
  cropCycleOnReportsList = <any>[];
  field_boundary: any;
  count = 0;
  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.fieldInfoForm = this.formBuilder.group({
      historicalSeason: new FormControl('rabi_2021', [Validators.required]),
      plannedSeason: new FormControl('rabi_2021', [Validators.required]),
      plannedCrops: new FormControl('', [Validators.required]),
      historicalCrops: new FormControl('', [Validators.required]),
      plannedFieldDetails: new FormArray([]),
      historicalFieldDetails: new FormArray([]),
      fieldOwnership: new FormArray([]),
      enumerate: new FormArray([]),
      cropCycleOnReports: new FormControl('high_yield', [Validators.required]), //radio
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }

  ngOnInit(): void {
    this.plannedSeasonList = season;
    this.irrigationSystemList = irrigationSystem;
    this.waterSourceList = waterSource;
    this.ownerShipTypeList = ownerShipType;
    this.cropCycleOnReportsList = cropCycleOnReports;

    let fieldInfo: any = localStorage.getItem('field-info-form');
    if (fieldInfo) {
      fieldInfo = JSON.parse(fieldInfo);
      this.fieldInfoForm.patchValue(fieldInfo);
      console.log(fieldInfo);
    }
    // let map_info: any = localStorage.getItem('field-info');
    // console.log(JSON.parse(map_info));
    // map_info = JSON.parse(map_info);

    // if (map_info.length > 0) {
    //   console.log(map_info.field_boundary);
    //   map_info.forEach((el: any) => {
    //     let arr = el.field_boundary.geometry.coordinates;
    //     console.log(arr[0]);

    //     let latArr: any = [];
    //     let lngArr: any = [];
    //     arr[0].forEach((x: any) => {
    //       console.log(x);

    //       latArr.push(x.lat);

    //       lngArr.push(x.lng);
    //     });
    //     console.log(latArr, lngArr);
    //   });
    // }
    // drawnItems = L.featureGroup().addTo(map);

    // var drawnItems = new L.FeatureGroup();
    // map.addLayer(drawnItems);

    // drawnItems.addLayer(
    //   new L.Illustrate.Pointer(L.latLng(41.7868010411136, -87.60601043701172), [
    //     new L.Point(0, 0),
    //     new L.Point(100, -100),
    //     new L.Point(400, -100)
    //   ])
    // );
  }
  ngAfterViewInit(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(this.setGeoLocation.bind(this));
    }
  }

  setGeoLocation(position: { coords: { latitude: any; longitude: any } }) {
    const {
      coords: { latitude, longitude },
    } = position;

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
    L.tileLayer(
      'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
      { maxZoom: 19, attribution: 'google' }
    ).addTo(map);

    map.addControl(
      new L.Control.Draw({
        edit: {
          featureGroup: drawnItems,
          poly: {
            allowIntersection: false,
          },
        },
        draw: {
          polygon: {
            allowIntersection: false,
            showArea: false,
          },
        },
      })
    );

    map.on(L.Draw.Event.CREATED, (event: any) => {
      var layer = event.layer;
      console.log('getLatLngs', layer.getLatLngs());

      this.field_boundary = {
        type: 'field-boundary',
        geometry: {
          coordinates: event.layer._latlngs,
          type: event.layerType,
        },
      };
      this.count++;
      this.addPlannedFieldDetails();
      this.addHistoFieldDetail();
      this.addFieldOwnershipDetail();
      this.addEnumerate();

      drawnItems.addLayer(layer);
    });

    map.on(L.Draw.Event.DELETED, (event: any) => {
      var layer = event.layer;
      console.log(layer._bounds, 'DELETED');
      this.count--;
      // this.removeFieldDetail();
    });

    map.on('draw:editvertex', (e: any) => {
      var poly = e.poly;
      var latlngs = poly.getLatLngs(); // here the polygon latlngs
      console.log('latlngs', latlngs);
    });

    map.on('enterFullscreen', function () {
      if (window.console) window.console.log('enterFullscreen');
    });
    map.on('exitFullscreen', function () {
      if (window.console) window.console.log('exitFullscreen');
    });
  }

  createFieldDetails(): FormGroup {
    return this.formBuilder.group({
      fieldId: new FormControl('', [Validators.required]),
      fieldArea: new FormControl('', [Validators.required]),
      irrigationSystem: new FormControl('Relation', [Validators.required]),
      waterSource: new FormControl('Education', [Validators.required]),
      crop: new FormControl('', [Validators.required]),
      expectedProduce: new FormControl('', [Validators.required]),
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

  createHistoFieldDetails(): FormGroup {
    return this.formBuilder.group({
      fieldId: new FormControl('', [Validators.required]),
      fieldArea: new FormControl('', [Validators.required]),
      irrigationSystem: new FormControl('Relation', [Validators.required]),
      waterSource: new FormControl('Education', [Validators.required]),
      crop: new FormControl('', [Validators.required]),
    });
  }

  getHistoFieldDetailsControls() {
    return (this.fieldInfoForm.get('historicalFieldDetails') as FormArray)
      .controls;
  }

  addHistoFieldDetail(): void {
    this.historicalFieldDetails = this.fieldInfoForm.get(
      'historicalFieldDetails'
    ) as FormArray;
    this.historicalFieldDetails.push(this.createHistoFieldDetails());
  }

  removeHistoFieldDetail(index: any) {
    this.historicalFieldDetails.removeAt(index);
  }

  createFieldOwnershipDetails(): FormGroup {
    return this.formBuilder.group({
      fieldOwnId: new FormControl('', [Validators.required]),
      ownerType: new FormControl([]),
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

  saveData() {
    let url = `/add/${this.nextRoute}`;
    let formValue = this.fieldInfoForm.value;
    let fieldArr = [];
    console.log(this.count);
    let obj;
    for (var i = 0; i < this.count; i++) {
      obj = {
        field_boundary: this.field_boundary,
        field_area_ha: '20',
        field_address: 'test',
        planned_season_detail: {
          plannedSeason: this.fieldInfoForm.value.plannedSeason,
          plannedCrops: this.fieldInfoForm.value.plannedCrops,
          plannedFieldDetails: this.fieldInfoForm.value.plannedFieldDetails[0],
        },
        historical_season_detail: {
          historicalSeason: this.fieldInfoForm.value.historicalSeason,
          historicalCrops: this.fieldInfoForm.value.historicalCrops,
          historicalFieldDetails:
            this.fieldInfoForm.value.historicalFieldDetails[0],
        },
        field_ownership_detail: this.fieldInfoForm.value.fieldOwnership[0],
        enumerate_planned_season: this.fieldInfoForm.value.enumerate[0],
        undertaking_cultivation: {
          uc: this.fieldInfoForm.value.cropCycleOnReports,
        },
        is_required_yn: true,
      };
      fieldArr.push(obj);
    }
    console.log(fieldArr);

    localStorage.setItem('field-info', JSON.stringify(fieldArr));
    localStorage.setItem(
      'field-info-form',
      JSON.stringify(this.fieldInfoForm.value)
    );
    this.router.navigate([url]);
  }

  ngOnDestroy() {}
}
