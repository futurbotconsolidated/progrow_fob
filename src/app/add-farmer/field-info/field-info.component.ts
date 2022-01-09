import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

import 'leaflet';
declare const L: any;
import 'leaflet-draw';
import '../../../../node_modules/leaflet-draw/dist/leaflet.draw-src.js';

@Component({
  selector: 'app-field-info',
  templateUrl: './field-info.component.html',
  styleUrls: ['./field-info.component.css'],
})
export class FieldInfoComponent implements OnInit {
  fieldInfoForm = new FormGroup({});

  constructor() {}

  ngOnInit(): void {}

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
      this.addFieldArray();
      drawnItems.addLayer(layer);
    });
  }

  addFieldArray() {
    console.log('created Fields');
  }
}
