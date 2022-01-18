import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';

import 'leaflet';
declare const L: any;
import 'leaflet-draw';
import '../../../../node_modules/leaflet-draw/dist/leaflet.draw-src.js';
import {
  season,
  irrigationSystem,
  waterSource,
  ownerShipType,
} from '../../shared/modal/global-field-values';
@Component({
  selector: 'app-field-info',
  templateUrl: './field-info.component.html',
  styleUrls: ['./field-info.component.css'],
})
export class FieldInfoComponent implements OnInit {
  fieldInfoForm = new FormGroup({});
  fieldDetails!: FormArray;
  historicalFieldDetails!: FormArray;
  fieldOwnership!: FormArray;
  enumerate!: FormArray;
  plannedSeasonList = <any>[];
  irrigationSystemList = <any>[];
  waterSourceList = <any>[];
  ownerShipTypeList = <any>[];

  constructor(private formBuilder: FormBuilder) {
    this.fieldInfoForm = this.formBuilder.group({
      historicalSeason: new FormControl('rabi_2021', [Validators.required]),
      plannedSeason: new FormControl('rabi_2021', [Validators.required]),
      plannedCrops: new FormControl('', [Validators.required]),
      historicalCrops: new FormControl('', [Validators.required]),
      fieldDetails: new FormArray([]),
      historicalFieldDetails: new FormArray([this.createHistoFieldDetails()]),
      fieldOwnership: new FormArray([]),
      enumerate: new FormArray([]),
      // innovativeWaysFarming: [Array()],
    });
  }

  ngOnInit(): void {
    this.plannedSeasonList = season;
    this.irrigationSystemList = irrigationSystem;
    this.waterSourceList = waterSource;
    this.ownerShipTypeList = ownerShipType;
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
      }),
      drawnItems = L.featureGroup().addTo(map);
    L.tileLayer(
      'http://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}',
      { maxZoom: 18, attribution: 'google' }
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
      console.log(layer._bounds);
      this.addFieldDetail();
      this.addFieldOwnershipDetail();
      this.addEnumerate();
      drawnItems.addLayer(layer);
    });

    map.on(L.Draw.Event.DELETED, (event: any) => {
      var layer = event.layer;
      console.log(layer._bounds, 'DELETED');
      // this.removeFieldDetail();
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
    return (this.fieldInfoForm.get('fieldDetails') as FormArray).controls;
  }

  addFieldDetail(): void {
    this.fieldDetails = this.fieldInfoForm.get('fieldDetails') as FormArray;
    this.fieldDetails.push(this.createFieldDetails());
  }

  removeFieldDetail(index: any) {
    this.fieldDetails.removeAt(index);
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
}
