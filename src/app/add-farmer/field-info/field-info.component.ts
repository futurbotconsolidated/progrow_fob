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
  crops,
  soilQuality,
  yesNo,
} from '../../shared/modal/global-field-values';
import { AddFarmerService } from '../add-farmer.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-field-info',
  templateUrl: './field-info.component.html',
  styleUrls: ['./field-info.component.css'],
})
export class FieldInfoComponent implements OnInit {
  SoilQualityStar: any[] = soilQuality;
  selectedSoilQualityStar: any;
  selectedWaterQualityStar: any;
  selectedYieldQualityStar: any;

  selectedHistoSoilQualityStar: any;
  selectedHistoWaterQualityStar: any;
  selectedHistoYieldQualityStar: any;

  nextRoute: any;
  fieldInfoForm = new FormGroup({});
  plannedFieldDetails!: FormArray;
  historicalFieldDetails!: FormArray;
  fieldOwnership!: FormArray;
  enumerate!: FormArray;
  testType!: FormArray;

  plannedSeasonList = <any>[];
  irrigationSystemList = <any>[];
  waterSourceList = <any>[];
  ownerShipTypeList = <any>[];
  cropCycleOnReportsList = <any>[];
  soilQualityList = <any>[];
  selectedCoordinates = <any>[];
  drawnCoordinates = <any>[];
  cropsList = <any>[];
  yesNoList = <any>[];
  field_boundary: any;
  count = 0;
  fieldArea = <any>[];
  editFieldArea = <any>[];
  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router,
    private toastr: ToastrService
  ) {
    this.fieldInfoForm = this.formBuilder.group({
      plannedSeason: new FormControl('', [Validators.required]),
      plannedCrops: new FormControl('', [Validators.required]),
      plannedFieldDetails: new FormArray([]),
      historicalFieldDetails: new FormArray([]),
      fieldOwnership: new FormArray([]),
      testType: new FormArray([this.createTestType()]),
      enumerate: new FormArray([]),
      cropCycleOnReports: new FormControl('', [Validators.required]), //radio
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
    this.cropsList = crops;
    this.soilQualityList = soilQuality;
    this.yesNoList = yesNo;

    this.selectedCoordinates = [];
    this.fieldArea = [];
    this.editFieldArea = [];

    let fieldInfo: any = localStorage.getItem('field-info-form');

    if (fieldInfo) {
      fieldInfo = JSON.parse(fieldInfo);
      this.bindItemsInEdit(fieldInfo);
    }

    let map_info: any = localStorage.getItem('field-info');
    map_info = JSON.parse(map_info);

    if (map_info) {
      this.editFieldArea = [];

      map_info.forEach((el: any) => {
        this.editFieldArea.push(el.field_area_ha);
        let arr = el.field_boundary.geometry.coordinates;
        let co: any = [];
        arr.forEach((x: any) => {
          console.log(el);

          co.push([x[0], x[1]]);
        });
        this.selectedCoordinates.push(co);
      });
    }
    console.log(this.selectedCoordinates);
  }

  bindItemsInEdit(fieldValues: any) {
    console.log(fieldValues.plannedFieldDetails);
    this.fieldInfoForm.patchValue(fieldValues);
    // this.fieldInfoForm.value.plannedSeason = fieldValues.plannedSeason;
    // this.fieldInfoForm.value.plannedCrops = fieldValues.plannedCrops;
    // this.fieldInfoForm.value.cropCycleOnReports =
    //   fieldValues.cropCycleOnReports;

    fieldValues.plannedFieldDetails.map((item: any) => {
      const plannedDetails = <any>{};
      plannedDetails['fieldId'] = new FormControl(item.fieldId);
      plannedDetails['fieldArea'] = new FormControl(item.fieldArea);
      plannedDetails['irrigationSystem'] = new FormControl(
        item.irrigationSystem
      );
      plannedDetails['waterSource'] = new FormControl(item.waterSource);
      plannedDetails['crop'] = new FormControl(item.crop);
      plannedDetails['soilQuality'] = new FormControl(item.soilQuality);
      plannedDetails['waterQuality'] = new FormControl(item.waterQuality);
      plannedDetails['yieldQuality'] = new FormControl(item.yieldQuality);
      plannedDetails['expectedProduce'] = new FormControl(item.expectedProduce);

      this.plannedFieldDetails = this.fieldInfoForm.get(
        'plannedFieldDetails'
      ) as FormArray;
      this.plannedFieldDetails.push(new FormGroup(plannedDetails));
    });

    fieldValues.historicalFieldDetails.map((item: any) => {
      const histDetails = <any>{};
      histDetails['fieldId'] = new FormControl(item.fieldId);
      histDetails['fieldArea'] = new FormControl(item.fieldArea);
      histDetails['irrigationSystem'] = new FormControl(item.irrigationSystem);
      histDetails['waterSource'] = new FormControl(item.waterSource);
      histDetails['crop'] = new FormControl(item.crop);
      histDetails['soilQuality'] = new FormControl(item.soilQuality);
      histDetails['waterQuality'] = new FormControl(item.waterQuality);
      histDetails['yieldQuality'] = new FormControl(item.yieldQuality);
      histDetails['historicalCrops'] = new FormControl(item.historicalCrops);
      histDetails['historicalSeason'] = new FormControl(item.historicalSeason);
      this.historicalFieldDetails = this.fieldInfoForm.get(
        'historicalFieldDetails'
      ) as FormArray;
      this.historicalFieldDetails.push(new FormGroup(histDetails));
    });

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

    fieldValues.testType.map((item: any) => {
      const testTypeDetails = <any>{};
      testTypeDetails['typeOfTest'] = new FormControl(item.typeOfTest);
      testTypeDetails['yesNo'] = new FormControl(item.yesNo);
      testTypeDetails['lastDone'] = new FormControl(item.lastDone);
      testTypeDetails['testResult'] = new FormControl(item.testResult);
      this.testType = this.fieldInfoForm.get('testType') as FormArray;
      this.testType.push(new FormGroup(testTypeDetails));
    });
  }
  ngAfterViewInit(): void {
    if (navigator.geolocation) {
      console.log(this);

      navigator.geolocation.getCurrentPosition(this.setGeoLocation.bind(this));
    }
  }

  setGeoLocation(position: { coords: { latitude: any; longitude: any } }) {
    const {
      coords: { latitude, longitude },
    } = position;

    this.drawMap(latitude, longitude);
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
      let co: any = [];
      arr[0].forEach((x: any) => {
        drawnLatLng.push([x.lat, x.lng]);
      });
      // drawnLatLng.push(co);

      console.log('getLatLngs', layer.getLatLngs());
      let ob = {
        type: 'field-boundary',
        geometry: {
          coordinates: drawnLatLng,
          type: event.layerType,
        },
      };
      this.drawnCoordinates.push(ob);

      this.count++;
      this.addPlannedFieldDetails();
      this.addHistoFieldDetail();
      this.addFieldOwnershipDetail();
      this.addEnumerate();

      drawnItems.addLayer(layer);
      var area_sq_meter = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      console.log(area_sq_meter);
      var area_hec = (area_sq_meter / 10000).toFixed(2);
      this.fieldArea.push(area_hec);

      layer
        .bindPopup(
          `Field ID : ${this.count} <br/> Area : ${area_hec} (Hectare)`
        )
        .openPopup();
    });

    map.on(L.Draw.Event.DELETED, (event: any) => {
      var layer = event.layer;
      this.count--;
      // this.removePlannedFieldDetails();
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
      console.log(this.editFieldArea[index]);

      var polygon = L.polygon(x).addTo(map);
      polygon
        .bindPopup(
          `Field ID : ${index + 1} <br/> Area : ${
            this.editFieldArea[index]
          } (Hectare)`
        )
        .openPopup();
      map.fitBounds(polygon.getBounds());
    });
  }

  createFieldDetails(): FormGroup {
    return this.formBuilder.group({
      fieldId: new FormControl('', [Validators.required]),
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

  createHistoFieldDetails(): FormGroup {
    return this.formBuilder.group({
      historicalSeason: new FormControl('', [Validators.required]),
      historicalCrops: new FormControl('', [Validators.required]),
      fieldId: new FormControl('', [Validators.required]),
      fieldArea: new FormControl('', [Validators.required]),
      irrigationSystem: new FormControl('', [Validators.required]),
      waterSource: new FormControl('', [Validators.required]),
      crop: new FormControl('', [Validators.required]),
      soilQuality: new FormControl(' ', [Validators.required]),
      waterQuality: new FormControl(' ', [Validators.required]),
      yieldQuality: new FormControl(' ', [Validators.required]),
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
    let url = `/add/${this.nextRoute}`;
    let fieldArr = [];
    console.log(this.count);
    let obj;
    for (var i = 0; i < this.count; i++) {
      this.fieldInfoForm.value.plannedFieldDetails[i].fieldId = i + 1;
      this.fieldInfoForm.value.historicalFieldDetails[i].fieldId = i + 1;
      this.fieldInfoForm.value.enumerate[i].fieldId = i + 1;
      this.fieldInfoForm.value.fieldOwnership[i].fieldOwnId = i + 1;

      obj = {
        field_boundary: this.drawnCoordinates[i],
        field_area_ha: this.fieldArea[i],
        field_address: 'test',
        planned_season_detail: {
          plannedSeason: this.fieldInfoForm.value.plannedSeason,
          plannedCrops: this.fieldInfoForm.value.plannedCrops,
          plannedFieldDetails: this.fieldInfoForm.value.plannedFieldDetails[i],
        },
        historical_season_detail: {
          historicalSeason: this.fieldInfoForm.value.historicalSeason,
          historicalCrops: this.fieldInfoForm.value.historicalCrops,
          historicalFieldDetails:
            this.fieldInfoForm.value.historicalFieldDetails[i],
        },
        field_ownership_detail: this.fieldInfoForm.value.fieldOwnership[i],
        enumerate_planned_season: this.fieldInfoForm.value.enumerate[i],
        testOnFields: this.fieldInfoForm.value.testType[i],
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
    // this.toastr.error('Please Plot at least One Field', 'Error!');
    // return;
  }

  SoilQualityRating(soilQualityStar: any) {
    this.selectedSoilQualityStar = soilQualityStar.displayValue;
    // let a = (this.fieldInfoForm.get('plannedFieldDetails') as FormArray)
    //   .controls;
    // console.log(a);

    // a.get('soilQuality').patchValue(soilQualityStar.displayValue);
    console.log('Value of SoilQualityStar', soilQualityStar.displayValue);
  }

  WaterQualityRating(waterQualityStar: any) {
    this.selectedWaterQualityStar = waterQualityStar.displayValue;
    console.log('Value of waterQualityStar', waterQualityStar.displayValue);
  }

  YieldQualityRating(yieldQualityStar: any) {
    this.selectedYieldQualityStar = yieldQualityStar.displayValue;
    console.log('Value of yieldQualityStar', yieldQualityStar.displayValue);
  }

  HistoSoilQualityRating(soilQualityStar: any) {
    this.selectedHistoSoilQualityStar = soilQualityStar.displayValue;
    console.log('Value of SoilQualityStar', soilQualityStar);
  }

  HistoWaterQualityRating(waterQualityStar: any) {
    this.selectedHistoWaterQualityStar = waterQualityStar.displayValue;
    console.log('Value of waterQualityStar', waterQualityStar);
  }

  HistoYieldQualityRating(yieldQualityStar: any) {
    this.selectedHistoYieldQualityStar = yieldQualityStar.displayValue;
    console.log('Value of yieldQualityStar', yieldQualityStar);
  }

  validateNo(e: any): boolean {
    const charCode = e.which ? e.which : e.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
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

  ngOnDestroy() {}
}
