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
} from '../../shared/modal/global-field-values';
import { AddFarmerService } from '../add-farmer.service';
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
  plannedSeasonList = <any>[];
  irrigationSystemList = <any>[];
  waterSourceList = <any>[];
  ownerShipTypeList = <any>[];
  cropCycleOnReportsList = <any>[];
  soilQualityList = <any>[];
  selectedCoordinates = <any>[];
  drawnCoordinates = <any>[];
  cropsList = <any>[];

  field_boundary: any;
  count = 0;
  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.fieldInfoForm = this.formBuilder.group({
      plannedSeason: new FormControl('kharif_2022', [Validators.required]),
      plannedCrops: new FormControl('', [Validators.required]),
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
    this.cropsList = crops;
    this.soilQualityList = soilQuality;
    this.selectedCoordinates = [];
    let fieldInfo: any = localStorage.getItem('field-info-form');
    // let mapInfo = <any>[];
    // mapInfo = localStorage.getItem('field-info');
    // let m = JSON.parse(mapInfo);
    // m.forEach((el: any) => {
    //   console.log(el.field_boundary.geometry.coordinates[0]);
    // });
    if (fieldInfo) {
      fieldInfo = JSON.parse(fieldInfo);
      this.fieldInfoForm.patchValue(fieldInfo);
      console.log(fieldInfo);
    }

    let map_info: any = localStorage.getItem('field-info');
    map_info = JSON.parse(map_info);

    if (map_info) {
      map_info.forEach((el: any) => {
        this.addPlannedFieldDetails();
        // this.addHistoFieldDetail();
        this.addFieldOwnershipDetail();
        this.addEnumerate();
        let arr = el.field_boundary.geometry.coordinates;
        let co: any = [];
        arr[0].forEach((x: any) => {
          co.push([x.lat, x.lng]);
        });
        this.selectedCoordinates.push(co);
      });
    }
    console.log(this.selectedCoordinates);

    // this.drawMap('','');
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
    L.tileLayer(
      'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
      { maxZoom: 19, attribution: 'google' }
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
      var layer = event.layer;
      console.log('getLatLngs', layer.getLatLngs());
      let ob = {
        type: 'field-boundary',
        geometry: {
          coordinates: event.layer._latlngs,
          type: event.layerType,
        },
      };
      this.drawnCoordinates.push(ob);

      this.count++;
      this.addPlannedFieldDetails();
      this.addHistoFieldDetail();
      this.addFieldOwnershipDetail();
      this.addEnumerate();
      layer.bindPopup(`Field ID : ${this.count} <br/> Area : `).openPopup();

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
      var radius = e.accuracy / 2;
      var circle1 = L.circle(e.latlng, radius).addTo(locationlayerGroup);
      circle1.setStyle({ color: 'red' });
    });

    console.log(this.selectedCoordinates);

    if (this.selectedCoordinates) {
      var polygon = L.polygon(this.selectedCoordinates).addTo(map);
      // zoom the map to the polygon
      polygon.bindPopup(`${this.selectedCoordinates.length}`).openPopup();
      map.fitBounds(polygon.getBounds());
    } else {
      console.log('no lat lng');
    }
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
        field_boundary: this.drawnCoordinates[i],
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
