import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import * as turf from "@turf/turf";
import * as mapboxgl from 'mapbox-gl';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';
import { ToastrService } from 'ngx-toastr';
import { NgxIndexedDBService } from 'ngx-indexed-db';
declare var $: any;
// import { mapData } from '../../../assets/overlay_data';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  /* START: Variables */
  userInfo: any;
  selectedViewType = 'EXISTING_FARMS_LIST_VIEW';
  allExistingFarmers = [] as any;
  allPipelineFarmers = [] as any;
  allFarmerAppFarmers = [] as any;
  allDraftFarmers = [] as any;
  allBranches = [] as any;
  overlayData = [] as any;
  loanAccountData = [] as any;
  dtOptions: DataTables.Settings = {};
  searchValue = '';
  lsn_tv_show = false;
  tableMaxWidth: any = { 'max-width': '1000px' };
  filterType = 'this_month';
  score_farmer: any = [];
  audit_data: any = [];
  /* END: Variables */

  constructor(
    public oauthService: OAuthService,
    public router: Router,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private dbService: NgxIndexedDBService
  ) {
    localStorage.removeItem('farmer-details');
    this.userInfo = this.oauthService.getIdentityClaims();
    let filter_value = localStorage.getItem('filter-value');
    if (!filter_value) {
      this.filterType = 'this_month';
    } else {
      this.filterType = filter_value;
    }
  }

  ngOnInit(): void {
    localStorage.removeItem('saveroute');
    this.tableMaxWidth = { 'max-width': (window.innerWidth - 50) + 'px' };
    this.loadData();
    if (localStorage.getItem('draft_farmer_new')) {
      let draft_farmer_new = {} as any;
      draft_farmer_new = JSON.parse(
        localStorage.getItem('draft_farmer_new') as any
      );
      draft_farmer_new['DF_ID'] = Date.now();
      draft_farmer_new['registration_date'] = formatDate(
        new Date(),
        'MMMM d, y, h:mm:ss a z',
        'en_IN'
      ) as string;

      let draft_farmers = [] as any;
      if (localStorage.getItem('draft_farmers')) {
        draft_farmers = JSON.parse(
          localStorage.getItem('draft_farmers') as any
        );
      }
      draft_farmers.push(draft_farmer_new);
      localStorage.setItem('draft_farmers', JSON.stringify(draft_farmers));
      localStorage.removeItem('draft_farmer_new');
    }

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100, 200],
      processing: true,
    };
  }

  /* START: Non-API Function Calls */
  loadData() {
    this.clearLocalStorageOnEditAndView();
    this.getExistingFarmers(this.filterType);
    this.getMasterData();
  }

  filterFarms(type: string) {
    this.selectedViewType = type;
    if (type == 'EXISTING_FARMS_LIST_VIEW') {
      if (!this.allExistingFarmers) this.getExistingFarmers(this.filterType);
    } else if (type == 'EXISTING_FARMS_MAP_VIEW') {
      this.overlayMap('EXISTING_FARMS_MAP_VIEW');
    } else if (type == 'FARMS_PIPELINE_LIST_VIEW') {
      if (!this.allPipelineFarmers) this.getExistingFarmers(this.filterType);
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      this.overlayMap('FARMS_PIPELINE_MAP_VIEW');
    } else if (type == 'FARMER_APP_LIST_VIEW') {
      if (!this.allFarmerAppFarmers) this.getExistingFarmers(this.filterType);
    } else if (type == 'FARMER_APP_MAP_VIEW') {
      this.overlayMap('FARMER_APP_MAP_VIEW');
    } else if (type == 'DRAFT_FARMER_LIST_VIEW') {
      if (localStorage.getItem('draft_farmers')) {
        this.allDraftFarmers = JSON.parse(
          localStorage.getItem('draft_farmers') as any
        );
      }
    }
  }

  routePage() {
    // add
    localStorage.removeItem('demographic-info');
    localStorage.removeItem('demographic-info-form');
    localStorage.removeItem('field-info');
    localStorage.removeItem('field-info-form');
    localStorage.removeItem('crop-market-planing');
    localStorage.removeItem('financial-planing');
    localStorage.removeItem('produce-aggregator');
    localStorage.removeItem('technology-adoption');
    localStorage.removeItem('co-applicant');
    localStorage.removeItem('co-applicant-form');

    //  edit
    localStorage.removeItem('farmer-details'); // related to view and edit of farmer
    localStorage.removeItem('farmer-files'); // related to s3 farmer documents uploaded

    // clear indexed db data
    this.dbService.clear('registerFarmer').subscribe((successDeleted) => { });

    // clear file storage
    localStorage.removeItem('demo-info-files');
    localStorage.removeItem('field-info-files');

    // clear edit related localStorage variables before starting
    localStorage.removeItem('edit-demographic-info');
    localStorage.removeItem('edit-demographic-info-form');
    localStorage.removeItem('edit-field-info');
    localStorage.removeItem('edit-field-info-form');
    localStorage.removeItem('edit-financial-planing');
    localStorage.removeItem('edit-crop-market-planing');
    localStorage.removeItem('edit-technology-adoption');
    localStorage.removeItem('edit-produce-aggregator');
    localStorage.removeItem('edit-co-applicant');
    localStorage.removeItem('edit-co-applicant-form');

    this.router.navigate(['/add/concept-cards']);
  }

  routeLeadPage() {
    this.router.navigate(['/bd/display-map']);
  }
  overlayMap(type: string) {
    this.spinner.show();
    this.overlayData.length = 0; // clear data
    let mapViewType = '';
    let useData = [] as any;
    if (type == 'EXISTING_FARMS_MAP_VIEW') {
      mapViewType = 'existing_farmers_mapbox';
      if (!this.allExistingFarmers) this.getExistingFarmers(this.filterType);
      useData = this.allExistingFarmers;
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      mapViewType = 'farms_pipeline_mapbox';
      if (!this.allPipelineFarmers) this.getExistingFarmers(this.filterType);
      useData = this.allPipelineFarmers;
    } else if (type == 'FARMER_APP_MAP_VIEW') {
      mapViewType = 'farmer_app_mapbox';
      if (!this.allFarmerAppFarmers) this.getExistingFarmers(this.filterType);
      useData = this.allFarmerAppFarmers;
    }
    //  Start Overlay Code
    // TO MAKE THE MAP APPEAR YOU MUST ADD  YOUR ACCESS TOKEN FROM https://account.mapbox.com
    const map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoicHVybmFyYW0iLCJhIjoiY2tpenBvZWpsMDNlaTMzcWpiZ2liZjEydiJ9.Mdj1w5dXDfCGCpIH5MlI2g',
      container: mapViewType, // container ID
      style: 'mapbox://styles/mapbox/satellite-streets-v11?optimize=true', // style URL
      // style: 'mapbox://styles/mapbox/satellite-v9?optimize=true', // style URL
      zoom: 3, // starting zoom
      center: [78, 20],
    });
    if (mapViewType === 'existing_farmers_mapbox') {
      // geojson coordinates
      map.on('load', () => {
        let field_f_index = 0;
        if (useData.length) {
          useData.forEach((elem: any, index: number) => {
            // prepare popup
            elem['fieldInfo'].forEach((f_elem: any, f_index: number) => {
              field_f_index++;
              if (!f_elem?.field_boundary?.geometry?.coordinates.length) {
                return;
              }
              let coordinates_arr = [] as any;
              if (
                typeof f_elem.field_boundary.geometry.coordinates[0][0] ===
                'number'
              ) {
                let coordinates_a = [] as any;
                f_elem.field_boundary.geometry.coordinates.forEach(function (
                  latlng: any,
                  lli: number
                ) {
                  var ll_arr = [];
                  ll_arr.push(latlng[1]);
                  ll_arr.push(latlng[0]);
                  coordinates_a.push(ll_arr);
                });
                coordinates_arr.push(coordinates_a);
              } else {
                let coordinates_a = [] as any;
                f_elem.field_boundary.geometry.coordinates.forEach(function (
                  latlng: any,
                  lli: number
                ) {
                  latlng.forEach(function (ll: any, li: number) {
                    var ll_arr = [];
                    ll_arr.push(ll.lng);
                    ll_arr.push(ll.lat);
                    coordinates_a.push(ll_arr);
                  });
                });
                coordinates_arr.push(coordinates_a);
              }
              const popupDescription = `<div class="field_popup">
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Id</label>
               <p class="text-capitalize">${elem['farmerId']}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Name</label>
               <p class="text-capitalize">${elem['farmerDetails'].firstName} ${elem['farmerDetails'].middleName
                } ${elem['farmerDetails'].lastName} </p>
             </div>
           </div>
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Date Of Registration</label>
               <p class="text-capitalize">${formatDate(
                  elem['createdDate'],
                  'EE, MMM d, y',
                  'en_IN'
                )}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Address</label>
               <p class="text-capitalize">${elem.address.addressLine1.toString().replaceAll(',', ', ').replaceAll(',  ', ', ')} ${elem.address.addressLine2.toString().replaceAll(',', ', ').replaceAll(',  ', ', ')
                } ${elem.address.pincode}</p>
             </div>
           </div>        
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Visit Land</label>
               <p class="text-capitalize">
                 <a href="https://maps.google.com?q=${coordinates_arr[0][0][1]
                },${coordinates_arr[0][0][0]}
                 " target="_blank">Take Me</a> 
                </p> 
              </div> 
              <div class="col-md-6 text-left d-none" >
                <a routerLink="/edit/demographic-info/${elem['farmerId']
                }"  class="btn btn-sm mt-2 btn-farmer p-1">View Profile</a>
              </div>
            </div>
                  </div>`;

              coordinates_arr.forEach((h: any, i: number) => {
                // Add Source
                map.addSource(`figure${i}_${index}_${f_index}_${field_f_index}`, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: {
                      type: 'Polygon',
                      coordinates: [h],
                    },
                    properties: {},
                  } as any,
                });

                let line_h = h;
                line_h.push(h[0]);
                map.addSource(`line_source_figure${i}_${index}_${f_index}_${field_f_index}`, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: {
                      type: 'Polygon',
                      coordinates: [line_h],
                    },
                    properties: {},
                  } as any,
                });

                // Add a layer showing the fields.
                map.addLayer({
                  id: `figure${i}_${index}_${f_index}_${field_f_index}`,
                  type: 'fill',
                  source: `figure${i}_${index}_${f_index}_${field_f_index}`,
                  layout: {},
                  paint: {
                    'fill-outline-color': 'red',
                    'fill-opacity': 1,
                    'fill-color': 'transparent',
                  },
                });

                // Add a layer showing the fields.
                map.addLayer({
                  id: `line_figure${i}_${index}_${f_index}_${field_f_index}`,
                  type: 'line',
                  source: `line_source_figure${i}_${index}_${f_index}_${field_f_index}`,
                  layout: {},
                  paint: {
                    'line-color': 'red',
                    'line-width': 3,
                  },
                });

                // Create a default Marker and add it to the map.
                new mapboxgl.Marker().setLngLat(h[0]).setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupDescription)).addTo(map);
              });
            });

            // }
            if (index == useData.length - 1) {
              this.spinner.hide();
            }
          });
        } else {
          this.spinner.hide();
        }

        let b_circle_index = 0;
        if (this.allBranches.length) {
          this.allBranches.forEach((branch: any, index: number) => {
            if (branch?.branch_data?.lat || branch?.branch_data?.long) {
              b_circle_index++;
              let popupDescription = `<div class="field_popup">
                    <div class="row">
                      <div class="col-md-6 text-left">
                        <label class="fw-bold">Branch</label>
                        <p class="text-capitalize">${branch?.branch_name}</p>
                      </div>
                      <div class="col-md-6 text-left">
                        <label class="fw-bold">Branch ID</label>
                        <p class="text-capitalize">${branch?.branch_unique_id}</p>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-6 text-left">
                      <label class="fw-bold">Visit</label>
                      <p class="text-capitalize"><a href="${branch.branch_data?.map_url}" target="_blank">Take Me</a></p> 
                      </div>
                      <!--<div class="col-md-6 text-left">
                        <label class="fw-bold">Branch ID</label>
                        <p class="text-capitalize">${branch?.branch_unique_id}</p>
                      </div>-->
                    </div>
                  </div>`;
              // console.log('branch : '+index+' : ', branch);
              let lat = parseFloat(branch.branch_data.lat);
              let long = parseFloat(branch.branch_data.long);
              console.log('long : ', long, ' lat : ', lat);
              // Draw a marker
              new mapboxgl.Marker({ color: "#00FF00" })
                .setLngLat([long, lat])
                .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupDescription))
                .addTo(map);

              // draw a circle
              let _center = turf.point([long, lat]);
              let _radius = 25;
              let _options: any = {
                steps: 80,
                units: 'kilometers' // or "mile"
              };
              let _circle = turf.circle(_center, _radius, _options);
              map.addSource(`source_circle_${b_circle_index}`, {
                type: "geojson",
                data: _circle,
              });
              map.addLayer({
                id: `b_circle_${b_circle_index}`,
                type: "fill",
                source: `source_circle_${b_circle_index}`,
                paint: {
                  "fill-color": "#1A73E8",
                  "fill-opacity": 0.25,
                },
              });
            }
          });
        }
        // console.log('field_f_index : ', field_f_index);
        // console.log('getStyle sources : ', map.getStyle().sources);
      });
    } else if (mapViewType === 'farms_pipeline_mapbox') {
      // geojson coordinates
      map.on('load', () => {
        let field_f_index = 0;
        if (useData.length) {
          useData.forEach((elem: any, index: number) => {
            // prepare popup
            elem['fieldInfo'].forEach((f_elem: any, f_index: number) => {
              field_f_index++;
              if (!f_elem.field_boundary.geometry.coordinates.length) {
                return;
              }
              let coordinates_arr = [] as any;
              if (
                typeof f_elem.field_boundary.geometry.coordinates[0][0] ===
                'number'
              ) {
                let coordinates_a = [] as any;
                f_elem.field_boundary.geometry.coordinates.forEach(function (
                  latlng: any,
                  lli: number
                ) {
                  var ll_arr = [];
                  ll_arr.push(latlng[1]);
                  ll_arr.push(latlng[0]);
                  coordinates_a.push(ll_arr);
                });
                coordinates_arr.push(coordinates_a);
              } else {
                let coordinates_a = [] as any;
                f_elem.field_boundary.geometry.coordinates.forEach(function (
                  latlng: any,
                  lli: number
                ) {
                  latlng.forEach(function (ll: any, li: number) {
                    var ll_arr = [];
                    ll_arr.push(ll.lng);
                    ll_arr.push(ll.lat);
                    coordinates_a.push(ll_arr);
                  });
                });
                coordinates_arr.push(coordinates_a);
              }
              const popupDescription = `<div class="field_popup">
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Id</label>
               <p class="text-capitalize">${elem['farmerId']}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Name</label>
               <p class="text-capitalize">${elem['farmerDetails'].firstName} ${elem['farmerDetails'].middleName
                } ${elem['farmerDetails'].lastName} </p>
             </div>
           </div>
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Date of registration</label>
               <p class="text-capitalize">${formatDate(
                  elem['createdDate'],
                  'EE, MMM d, y',
                  'en_IN'
                )}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Address</label>
               <p class="text-capitalize">${elem.address.addressLine1} ${elem.address.addressLine2
                } ${elem.address.pincode}</p>
             </div>
           </div>        
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Visit Land</label>
               <p class="text-capitalize">
                 <a href="https://maps.google.com?q=${coordinates_arr[0][0][1]
                },${coordinates_arr[0][0][0]}
                 " target="_blank">Take Me</a> 
                </p> 
              </div> 
              <div class="col-md-6 text-left d-none" >
                <a routerLink="/edit/demographic-info/${elem['farmerId']
                }"  class="btn btn-sm mt-2 btn-farmer p-1">View Profile</a>
              </div>
            </div>
                  </div>`;

              coordinates_arr.forEach((h: any, i: number) => {
                // Add Source
                map.addSource(`figure${i}_${index}_${f_index}_${field_f_index}`, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: {
                      type: 'Polygon',
                      coordinates: [h],
                    },
                    properties: {},
                  } as any,
                });

                let line_h = h;
                line_h.push(h[0]);
                map.addSource(`line_source_figure${i}_${index}_${f_index}_${field_f_index}`, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: {
                      type: 'Polygon',
                      coordinates: [line_h],
                    },
                    properties: {},
                  } as any,
                });

                // Add a layer showing the fields.
                map.addLayer({
                  id: `figure${i}_${index}_${f_index}_${field_f_index}`,
                  type: 'fill',
                  source: `figure${i}_${index}_${f_index}_${field_f_index}`,
                  layout: {},
                  paint: {
                    'fill-outline-color': 'red',
                    'fill-opacity': 1,
                    'fill-color': 'transparent',
                  },
                });

                // Add a layer showing the fields.
                map.addLayer({
                  id: `line_figure${i}_${index}_${f_index}_${field_f_index}`,
                  type: 'line',
                  source: `line_source_figure${i}_${index}_${f_index}_${field_f_index}`,
                  layout: {},
                  paint: {
                    'line-color': 'red',
                    'line-width': 3,
                  },
                });

                // Create a default Marker and add it to the map.
                const marker1 = new mapboxgl.Marker().setLngLat(h[0]).setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupDescription)).addTo(map);
              });
            });

            // }
            if (index == useData.length - 1) {
              this.spinner.hide();
            }
          });
        } else {
          this.spinner.hide();
        }
        console.log('field_f_index : ', field_f_index);
        // console.log('getStyle sources : ', map.getStyle().sources);
      });
    } else if (mapViewType === 'farmer_app_mapbox') {
      console.log('farmer_app_mapbox');
      // geojson coordinates
      map.on('load', () => {
        let field_f_index = 0;
        if (useData.length) {
          useData.forEach((elem: any, index: number) => {
            // prepare popup
            elem['fieldInfo'].forEach((f_elem: any, f_index: number) => {
              field_f_index++;
              if (!f_elem.field_boundary.geometry.coordinates.length) {
                return;
              }
              let coordinates_arr = [] as any;
              if (
                typeof f_elem.field_boundary.geometry.coordinates[0][0] ===
                'number'
              ) {
                let coordinates_a = [] as any;
                f_elem.field_boundary.geometry.coordinates.forEach(function (
                  latlng: any,
                  lli: number
                ) {
                  var ll_arr = [];
                  ll_arr.push(latlng[1]);
                  ll_arr.push(latlng[0]);
                  coordinates_a.push(ll_arr);
                });
                coordinates_arr.push(coordinates_a);
              } else {
                let coordinates_a = [] as any;
                f_elem.field_boundary.geometry.coordinates.forEach(function (
                  latlng: any,
                  lli: number
                ) {
                  latlng.forEach(function (ll: any, li: number) {
                    var ll_arr = [];
                    ll_arr.push(ll.lng);
                    ll_arr.push(ll.lat);
                    coordinates_a.push(ll_arr);
                  });
                });
                coordinates_arr.push(coordinates_a);
              }
              const popupDescription = `<div class="field_popup">
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Id</label>
               <p class="text-capitalize">${elem['farmerId']}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Name</label>
               <p class="text-capitalize">${elem['farmerDetails'].firstName} ${elem['farmerDetails'].middleName
                } ${elem['farmerDetails'].lastName} </p>
             </div>
           </div>
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Date of registration</label>
               <p class="text-capitalize">${formatDate(
                  elem['createdDate'],
                  'EE, MMM d, y',
                  'en_IN'
                )}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Address</label>
               <p class="text-capitalize">${elem.address.addressLine1} ${elem.address.addressLine2
                } ${elem.address.pincode}</p>
             </div>
           </div>        
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Visit Land</label>
               <p class="text-capitalize">
                 <a href="https://maps.google.com?q=${coordinates_arr[0][0][1]
                },${coordinates_arr[0][0][0]}
                 " target="_blank">Take Me</a> 
                </p> 
              </div> 
              <div class="col-md-6 text-left d-none" >
                <a routerLink="/edit/demographic-info/${elem['farmerId']
                }"  class="btn btn-sm mt-2 btn-farmer p-1">View Profile</a>
              </div>
            </div>
                  </div>`;

              coordinates_arr.forEach((h: any, i: number) => {
                // Add Source
                map.addSource(`figure${i}_${index}_${f_index}_${field_f_index}`, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: {
                      type: 'Polygon',
                      coordinates: [h],
                    },
                    properties: {},
                  } as any,
                });

                let line_h = h;
                line_h.push(h[0]);
                map.addSource(`line_source_figure${i}_${index}_${f_index}_${field_f_index}`, {
                  type: 'geojson',
                  data: {
                    type: 'Feature',
                    geometry: {
                      type: 'Polygon',
                      coordinates: [line_h],
                    },
                    properties: {},
                  } as any,
                });

                // Add a layer showing the fields.
                map.addLayer({
                  id: `figure${i}_${index}_${f_index}_${field_f_index}`,
                  type: 'fill',
                  source: `figure${i}_${index}_${f_index}_${field_f_index}`,
                  layout: {},
                  paint: {
                    'fill-outline-color': 'red',
                    'fill-opacity': 1,
                    'fill-color': 'transparent',
                  },
                });

                // Add a layer showing the fields.
                map.addLayer({
                  id: `line_figure${i}_${index}_${f_index}_${field_f_index}`,
                  type: 'line',
                  source: `line_source_figure${i}_${index}_${f_index}_${field_f_index}`,
                  layout: {},
                  paint: {
                    'line-color': 'red',
                    'line-width': 3,
                  },
                });

                // Create a default Marker and add it to the map.
                const marker1 = new mapboxgl.Marker().setLngLat(h[0]).setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupDescription)).addTo(map);
              });
            });

            // }
            if (index == useData.length - 1) {
              this.spinner.hide();
            }
          });
        } else {
          this.spinner.hide();
        }
        console.log('field_f_index : ', field_f_index);
        // console.log('getStyle sources : ', map.getStyle().sources);
      });
    } else {
      map.on('load', () => {
        this.spinner.hide();
      });
    }
    map.addControl(new mapboxgl.NavigationControl()); // Add map controls
    map.addControl(new mapboxgl.FullscreenControl()); // Add map full screen
    setTimeout(function () {
      map.resize();
    }, 500);
  }

  editDraftFarmer(farmerId: any) {
    if (localStorage.getItem('draft_farmers')) {
      let draft_farmers = [] as any;
      draft_farmers = JSON.parse(localStorage.getItem('draft_farmers') as any);
      draft_farmers.forEach((dfarm: any, i: number) => {
        if (farmerId == dfarm.DF_ID) {
          localStorage.setItem('draft_farmer_new', JSON.stringify(dfarm));
          if (dfarm.demographic_info_form) {
            localStorage.setItem(
              'demographic-info-form',
              JSON.stringify(dfarm.demographic_info_form)
            );
          }
          if (dfarm.field_info_form) {
            localStorage.setItem(
              'field-info-form',
              JSON.stringify(dfarm.field_info_form)
            );
          }
          if (dfarm.field_info_coordinates) {
            localStorage.setItem(
              'field-info-coordinates',
              JSON.stringify(dfarm.field_info_coordinates)
            );
          }
          if (dfarm.crop_market_planing) {
            localStorage.setItem(
              'crop-market-planing',
              JSON.stringify(dfarm.crop_market_planing)
            );
          }
          if (dfarm.financial_planing) {
            localStorage.setItem(
              'financial-planing',
              JSON.stringify(dfarm.financial_planing)
            );
          }
          if (dfarm.produce_aggregator) {
            localStorage.setItem(
              'produce-aggregator',
              JSON.stringify(dfarm.produce_aggregator)
            );
          }
          if (dfarm.technology_adoption) {
            localStorage.setItem(
              'technology-adoption',
              JSON.stringify(dfarm.technology_adoption)
            );
          }
          if (dfarm.co_applicant_form) {
            localStorage.setItem(
              'co-applicant-form',
              JSON.stringify(dfarm.co_applicant_form)
            );
          }
          delete draft_farmers[i];
        }
      });
      let draft_farmers_list = [] as any;
      draft_farmers.forEach((dfarm: any, i: number) => {
        if (dfarm.length) {
          draft_farmers_list.push(dfarm);
        }
      });
      if (draft_farmers_list.length) {
        localStorage.setItem(
          'draft_farmers',
          JSON.stringify(draft_farmers_list)
        );
      } else {
        localStorage.removeItem('draft_farmers');
      }
      this.router.navigate(['/add/demographic-info']);
    }
  }

  logOut() {
    this.oauthService.logOut();
    this.router.navigate(['/home']);
  }

  showLeftSide(param: boolean) {
    this.lsn_tv_show = param;
    if (this.lsn_tv_show) {
      this.tableMaxWidth = { 'max-width': (window.innerWidth - 315) + 'px' };
    } else {
      this.tableMaxWidth = { 'max-width': (window.innerWidth - 50) + 'px' };
    }
  }
  onChangeFilter(event: any) {
    localStorage.setItem('filter-value', event.target.value);
    this.filterType = event.target.value;
    window.location.reload();
    //this.getExistingFarmers(event.target.value);
  }

  clearLocalStorageOnEditAndView() {
    localStorage.removeItem('farmer-details'); // related to view and edit of farmer
    localStorage.removeItem('farmer-files'); // related to s3 farmer documents uploaded

    localStorage.removeItem('demo-info-files');
    localStorage.removeItem('field-info-files');

    // clear edit related localStorage variables before starting
    localStorage.removeItem('edit-demographic-info');
    localStorage.removeItem('edit-demographic-info-form');
    localStorage.removeItem('edit-field-info');
    localStorage.removeItem('edit-field-info-form');
    localStorage.removeItem('edit-financial-planing');
    localStorage.removeItem('edit-crop-market-planing');
    localStorage.removeItem('edit-technology-adoption');
    localStorage.removeItem('edit-produce-aggregator');
    localStorage.removeItem('edit-co-applicant');
    localStorage.removeItem('edit-co-applicant-form');

    // clear indexed db data
    this.dbService.clear('registerFarmer').subscribe((successDeleted) => { });
  }

  openScoreModalPopup(farmer: any) {
    this.score_farmer = [];
    farmer?.fieldInfo.forEach((field: any) => {
      let score: any = [];
      Object.keys(field?.frcm_score).forEach((key: any) => {
        if (field?.frcm_score[key].toString().trim()) {
          let s_obj = {
            title: key.toString().trim().replaceAll('_', ' '),
            value: field?.frcm_score[key].toString().trim()
          };
          score.push(s_obj);
        }
      });
      this.score_farmer.push(score);
    });
    if (this.score_farmer.length) {
      this.audit_data = false;
    }
    $('#scoreModalPopup').modal('show');
  }
  
  openAuditModalPopup(farmerId: any) {
    this.getAuditData(farmerId);
  }

  /* END: Non-API Function Calls */

  /* START: API Function Calls */
  getExistingFarmers(filterType: string) {
    // this.allExistingFarmers.length = 0;
    this.spinner.show();
    this.commonService.getExistingFarmers(filterType).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.message != 'Success' || !res.status) {
          alert(`${res.message}`);
        } else {
          this.allExistingFarmers = [];
          this.allPipelineFarmers = [];
          this.allFarmerAppFarmers = [];

          res.data.forEach((farmer: any, index: number) => {
            let fa_frcm_score: any = 0;
            let fa_field_size: any = 0;
            let fa_ownership_document_url = '';
            let counter = 0;
            farmer.fieldInfo.forEach((field: any, index: number) => {
              if (field?.field_area_ha) {
                fa_field_size = parseFloat(fa_field_size) + parseFloat(field?.field_area_ha || 0);
              }

              if (field?.frcm_score?.aggregate_score) {
                counter = counter + 1;
                fa_frcm_score = parseFloat(fa_frcm_score) + parseFloat(field?.frcm_score?.aggregate_score);
              }
              if (field.field_ownership_detail?.ownership_document_url && field.field_ownership_detail?.ownership_document_url != 'Download') {
                fa_ownership_document_url = field.field_ownership_detail?.ownership_document_url;
              }
            });
            farmer.fa_field_size = fa_field_size;

            if (counter != 0) {
              farmer.fa_frcm_score = Math.round(fa_frcm_score / counter);
            } else {

              farmer.fa_frcm_score = 0;
            }
            farmer.fa_ownership_document_url = fa_ownership_document_url;
            if (farmer.data_source == 'FOB2_APP') {
              this.allFarmerAppFarmers.push(farmer);
            } else if (farmer.data_source == 'LEAD') {
              this.allPipelineFarmers.push(farmer);
            } else {
              this.allExistingFarmers.push(farmer);
            }
          });
          if (this.selectedViewType == 'EXISTING_FARMS_MAP_VIEW') {
            this.filterFarms(this.selectedViewType);
          }
        }
      },
      (error: any) => {
        this.spinner.hide();
        if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
          this.logOut();
          return;
        } else {
          alert('Failed to fetch existing farmers data, please try again...');
        }
      }
    );
  }

  getMasterData() {
    if (!this.allBranches.length) {
      let master_data = JSON.parse(localStorage.getItem('master-data') as any);
      if (!master_data) {
        this.spinner.show();
        this.commonService.getMasterData().subscribe(
          (res: any) => {
            this.spinner.hide();
            if (res && 'object' == typeof (res)) {
              if (res.message != 'Success' || !res.status) {
                console.log(`${res.message}`);
              } else if (res?.data) {
                localStorage.setItem('master-data', JSON.stringify(res.data));
                this.allBranches = res?.data?.branches;
              } else {
                console.log('Failed to fetch master data !');
              }
            } else {
              console.log('Failed to fetch master data !!');
            }
          },
          (error: any) => {
            this.spinner.hide();
            if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
              this.logOut();
              return;
            } else {
              console.log('Failed to fetch master data, please try again...');
            }
          }
        );
      } else if (master_data?.branches?.length) {
        this.allBranches = master_data.branches;
      }
    }
  }

  getAuditData(farmer_id: any) {
    this.spinner.show();
    this.commonService.getAudit(farmer_id).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res && 'object' == typeof (res)) {
          if (res.message != 'Success' || !res.status) {
            alert(`${res.message}`);
          } else if (res?.data) {
            this.audit_data = res.data;
            // console.log('audit_data : ', this.audit_data);            
            if (this.audit_data.length) {
              // console.log('updated_data : ', this.audit_data[0].updated_data, typeof(this.audit_data[0].updated_data));
              // this.audit_data[0].updated_data.forEach((x: any, index: number) => {
              //   console.log('x : ', x, typeof(x));
              // });
              this.score_farmer = false;
              $('#scoreModalPopup').modal('show');
            } else {
              alert('Data Not Found');
            }
          } else {
            console.log('Failed to fetch audit data !');
          }
        } else {
          console.log('Failed to fetch audit data !!');
        }
      },
      (error: any) => {
        this.spinner.hide();
        if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
          this.logOut();
          return;
        } else {
          console.log('Failed to fetch audit data, please try again...');
        }
      }
    );
  }
  downloadCsv() {
    this.spinner.show();
    this.commonService.getDownloadCsv(this.filterType).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.message != 'Success' || !res.status) {
          alert(`${res.message}`);
        } else {
          this.downloadFile(res.data);
        }
      },
      (error: any) => {
        if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
          this.logOut();
          return;
        } else {
          alert('Failed to fetch farmers CSV data, please try again...');
        }
      }
    );
  }

  downloadFile(data: any) {
    var filename = 'farmer_csv_data_' + Date.now();
    let array = typeof data != 'object' ? JSON.parse(data) : data;
    let csvData = '';
    for (let i = 0; i < array.length; i++) {
      let line = '';
      for (let j = 0; j < array[i].length; j++) {
        if ((array[i][j])?.toString().replace(/,/g, '')) {
          line += (array[i][j])?.toString().replace(/,/g, '') + ',';
        } else {
          line += ',';
        }
      }
      csvData += line + '\r\n';
    }
    let blob = new Blob(['\ufeff' + csvData], {
      type: 'text/csv;charset=utf-8;',
    });
    let dwldLink = document.createElement('a');
    let url = URL.createObjectURL(blob);
    let isSafariBrowser =
      navigator.userAgent.indexOf('Safari') != -1 &&
      navigator.userAgent.indexOf('Chrome') == -1;
    //if Safari open in new window to save file with random filename.
    if (isSafariBrowser) {
      dwldLink.setAttribute('target', '_blank');
    }
    dwldLink.setAttribute('href', url);
    dwldLink.setAttribute('download', filename + '.csv');
    dwldLink.style.visibility = 'hidden';
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
  }

  getFarmerDetailsById(farmerId: any, type: string) {
    this.clearLocalStorageOnEditAndView(); // clear unwanted localStorage data
    this.spinner.show();
    this.commonService.getFarmerDetailsById(farmerId).subscribe(
      (res: any) => {
        if (res.message != 'Success' || !res.status) {
          this.spinner.hide();
          this.toastr.error(`${res.message}!`);
        } else {
          this.getDocumentByFarmerId(farmerId, type); // read farmer related uploaded files
          localStorage.setItem('farmer-details', JSON.stringify(res.data));
        }
      },
      (error: any) => {
        this.spinner.hide();
        if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
          this.logOut();
          return;
        } else {
          this.toastr.error(
            `Failed to fetch farmer details, please try again...`
          );
        }
      }
    );
  }
  getLoanAccountById(farmerId: any, type: string, index: number) {
    if (confirm("Are you sure ? you want to send for loan")) {
      this.spinner.show();
      this.commonService.sendToMifin(farmerId).subscribe(
        (res: any) => {
          console.log('sendToMifin res : ', res)
          if (!res.status) { //res.message != 'Success' || 
            this.spinner.hide();
            this.toastr.error(`${res.message}!`);
          } else {
            this.spinner.hide();
            if (res.data.LAN) {
              this.loanAccountData[index] = res.data.LAN;
              this.toastr.success(`${res.message}!`);
            } else {
              this.toastr.error(`${res.message}!`);
            }
            // this.router.navigate(['/bd/dashboard']);
          }
        },
        (error: any) => {
          this.spinner.hide();
          if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
            this.logOut();
            return;
          } else {
            this.toastr.error(
              `Failed to fetch farmer details, please try again...`
            );
          }
        }
      );
    }
  }

  getDocumentByFarmerId(farmerId: any, type: string) {
    const inputObject = { farmerId };
    this.commonService.getDocumentByFarmerId(inputObject).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (type === 'view') {
          this.router.navigate([`/edit/demographic-info/${farmerId}`]);
        } else if (type === 'edit') {
          this.router.navigate([`/add/demographic-info/${farmerId}`]);
        }
        if (res.message != 'Success' || !res.status) {
          this.toastr.error(`${res.message}!`);
        } else {
          localStorage.setItem('farmer-files', JSON.stringify(res.data));
        }
      },
      (error: any) => {
        this.spinner.hide();
        if (error?.statusText.toString().toLowerCase() == 'unauthorized') {
          this.logOut();
          return;
        } else {
          this.toastr.error(`Failed to fetch farmer files, please try again...`);
        }
      }
    );
  }
  /* END: API Function Calls */
}
