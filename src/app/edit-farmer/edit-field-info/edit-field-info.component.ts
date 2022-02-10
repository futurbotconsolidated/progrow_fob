import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
declare const L: any;
import 'leaflet-draw';

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

  constructor(private spinner: NgxSpinnerService) {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      this.fieldInfo = JSON.parse(A).fieldInfo;
      console.log(this.fieldInfo);
    }
  }

  ngOnInit(): void {
    if (this.fieldInfo) {
      // this.spinner.show();
      this.fieldInfo.forEach((el: any) => {
        this.ownerShipDetails.push(el.field_ownership_detail);
        this.plannedDetails.push(el.planned_season_detail.plannedFieldDetails);
        this.historicalDetails.push(
          el.historical_season_detail.historicalFieldDetails
        );
        this.typesOfTests.push(el.testOnFields);
        this.enumerateDetails.push(el.enumerate_planned_season);
      });

      if (navigator.geolocation) {
        console.log(this);

        navigator.geolocation.getCurrentPosition(
          this.setGeoLocation.bind(this)
        );
      }

      this.fieldInfo.forEach((el: any) => {
        // this.addPlannedFieldDetails();
        // this.addHistoFieldDetail();
        // this.addFieldOwnershipDetail();
        // this.addEnumerate();

        let arr = el.field_boundary.geometry.coordinates;
        let co: any = [];
        arr.forEach((x: any) => {
          co.push([x[0], x[1]]);
        });

        this.selectedCoordinates.push(co);
      });
      console.log(this.selectedCoordinates);
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

    // hide controls
    // map.addControl(
    //   new L.Control.Draw({
    //     edit: {
    //       featureGroup: drawnItems,
    //       remove: true,
    //       poly: {
    //         allowIntersection: false,
    //       },
    //     },
    //     draw: {
    //       polygon: {
    //         allowIntersection: false,
    //         showArea: false,
    //       },
    //       polyline: false,
    //       circle: false,
    //       rectangle: false,
    //       marker: false,
    //       circlemarker: false,
    //     },
    //   })
    // );

    if (this.selectedCoordinates.length > 0) {
      var polygon = L.polygon(this.selectedCoordinates).addTo(map);
      // zoom the map to the polygon
      polygon.bindPopup(`${this.selectedCoordinates.length}`).openPopup();
      map.fitBounds(polygon.getBounds());
    } else {
      console.log('no lat lng');
    }
  }
}
