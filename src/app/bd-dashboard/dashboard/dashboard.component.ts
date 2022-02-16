import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';
import { ToastrService } from 'ngx-toastr';

import { mapData } from '../../../assets/overlay_data';

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
  overlayData = [] as any;
  dtOptions: DataTables.Settings = {};
  /* END: Variables */

  constructor(
    public oauthService: OAuthService,
    public router: Router,
    public commonService: CommonService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService
  ) {
    localStorage.removeItem('farmer-details');
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  ngOnInit(): void {
    this.loadData();
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
      processing: true,
    };
  }

  /* START: Non-API Function Calls */
  loadData() {
    this.getExistingFarmers();
  }

  filterFarms(type: string) {
    this.selectedViewType = type;
    if (type == 'EXISTING_FARMS_LIST_VIEW') {
      if (!this.allExistingFarmers) this.getExistingFarmers();
    } else if (type == 'EXISTING_FARMS_MAP_VIEW') {
      this.overlayMap('EXISTING_FARMS_MAP_VIEW');
    } else if (type == 'FARMS_PIPELINE_LIST_VIEW') {
      this.getFarmersPipeline();
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      this.overlayMap('FARMS_PIPELINE_MAP_VIEW');
    }
  }

  routePage() {
    localStorage.clear();
    this.router.navigate(['/add/concept-cards']);
  }

  overlayMap(type: string) {
    this.spinner.show();
    this.overlayData.length = 0; // clear data
    let mapViewType = '';
    let useData = [] as any;
    if (type == 'EXISTING_FARMS_MAP_VIEW') {
      mapViewType = 'existing_farmers_mapbox';
      //useData = mapData['features'];
      if (!this.allExistingFarmers) this.getExistingFarmers();
      useData = this.allExistingFarmers;
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      mapViewType = 'farms_pipeline_mapbox';
      //useData = mapData['features'];
      if (!this.allExistingFarmers) this.getExistingFarmers();
      useData = this.allExistingFarmers;
    }
    //  Start Overlay Code
    // TO MAKE THE MAP APPEAR YOU MUST ADD  YOUR ACCESS TOKEN FROM https://account.mapbox.com
    const map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoicHVybmFyYW0iLCJhIjoiY2tpenBvZWpsMDNlaTMzcWpiZ2liZjEydiJ9.Mdj1w5dXDfCGCpIH5MlI2g',
      container: mapViewType, // container ID
      style: 'mapbox://styles/mapbox/satellite-v9?optimize=true', // style URL
      zoom: 14, // starting zoom
      center: [77.73521840572359, 13.048329579932709],
    });
    if (mapViewType === 'existing_farmers_mapbox') {
      // geojson coordinates
      map.on('load', () => {
        useData.forEach((elem: any, index: number) => {
          // prepare popup
          elem['fieldInfo'].forEach((f_elem: any, f_index: number) => {
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
            const popupDescription = `<div class="field_popup" style="width:260px;">
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Id</label>
               <p class="text-capitalize">${elem['farmerId']}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Name</label>
               <p class="text-capitalize">${elem['farmerDetails'].firstName} ${elem['farmerDetails'].middleName} ${elem['farmerDetails'].lastName} </p>
             </div>
           </div>
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Date of registration</label>
               <p class="text-capitalize">${elem['registrationDate']}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Address</label>
               <p class="text-capitalize">${f_elem.field_address}</p>
             </div>
           </div>        
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Visit Land</label>
               <p class="text-capitalize">
                 <a href="https://maps.google.com?q=${coordinates_arr[0][0][1]},${coordinates_arr[0][0][0]}
                 " target="_blank">Take Me</a> </p> </div> </div>
                   </div>`;

            coordinates_arr.forEach((h: any, i: number) => {
              // Add Source
              map.addSource(`figure${i}_${index}_${f_index}`, {
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

              // Add a layer showing the fields.
              map.addLayer({
                id: `figure${i}_${index}_${f_index}`,
                type: 'fill',
                source: `figure${i}_${index}_${f_index}`,
                layout: {},
                paint: {
                  'fill-outline-color': 'red',
                  'fill-opacity': 1.0,
                },
              });
              // const el = document.createElement('div');
              // el.className = 'my-dash-marker';
              // new mapboxgl.Marker(el).setLngLat(h[0]).addTo(map);
              // When a click event occurs on a feature in the places layer, open a popup at the
              // location of the feature, with description HTML from its properties.
              map.on('click', `figure${i}_${index}_${f_index}`, (e) => {
                new mapboxgl.Popup()
                  .setLngLat(h[0])
                  .setHTML(popupDescription)
                  .setMaxWidth('400px')
                  .addTo(map);
              });

              // Change the cursor to a pointer when the mouse is over the places layer.
              map.on('mouseenter', `figure${i}_${index}_${f_index}`, () => {
                map.getCanvas().style.cursor = 'pointer';
              });

              // Change it back to a pointer when it leaves.
              map.on('mouseleave', `figure${i}_${index}_${f_index}`, () => {
                map.getCanvas().style.cursor = '';
              });
            });
          });

          // }
          if (index == useData.length - 1) {
            this.spinner.hide();
          }
        });
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
  /* END: Non-API Function Calls */

  /* START: API Function Calls */
  getExistingFarmers() {
    this.spinner.show();
    this.commonService.getExistingFarmers().subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.message != 'Success' || !res.status) {
          alert(`${res.message}`);
        } else {
          this.allExistingFarmers = res.data;
        }
      },
      (error: any) => {
        this.spinner.hide();
        alert('Failed to fetch existing farmers data, please try again...');
      }
    );
  }

  getFarmersPipeline() {
    // Other Variables
    const farmersPipeline = [
      // {
      //   area_of_interest: 'Chandan',
      //   farm_size: '2 - 4 Ha',
      //   crop_type: 'Mustard',
      //   frcm_score: '80-100',
      // },
      // {
      //   area_of_interest: 'Chandan',
      //   farm_size: '4 - 6 Ha',
      //   crop_type: 'Cumin',
      //   frcm_score: '60-80',
      // },
      // {
      //   area_of_interest: 'Chandan',
      //   farm_size: '6 - 8 Ha',
      //   crop_type: 'Mustard',
      //   frcm_score: '80-100',
      // },
      // {
      //   area_of_interest: 'Chandan',
      //   farm_size: '2 - 4 Ha',
      //   crop_type: 'Cumin',
      //   frcm_score: '60-80',
      // },
      // {
      //   area_of_interest: 'Chandan',
      //   farm_size: '4 - 6 Ha',
      //   crop_type: 'Mustard',
      //   frcm_score: '60-100',
      // },
    ] as any;

    this.allPipelineFarmers = farmersPipeline;
    return;
    this.spinner.show();
    this.commonService.getFarmersPipeline().subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.message != 'Success' || !res.status) {
          alert('Failed to fetch farmers pipeline data, please try again...');
        } else {
          this.allPipelineFarmers = res.data;
        }
      },
      (error: any) => {
        this.spinner.hide();
        alert('Failed to fetch farmers pipeline data, please try again...');
      }
    );
  }
  /* END: API Function Calls */

  getFarmerDetailsById(farmerId: any) {
    localStorage.removeItem('farmer-details');
    this.spinner.show();
    this.commonService.getFarmerDetailsById(farmerId).subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.message != 'Success' || !res.status) {
          this.toastr.error(`${res.message}!`);
        } else {
          localStorage.setItem('farmer-details', JSON.stringify(res.data));
          this.router.navigate([`/edit/demographic-info/${farmerId}`]);
        }
      },
      (error: any) => {
        this.spinner.hide();
        this.toastr.error(
          `Failed to fetch farmer details, please try again...`
        );
      }
    );
  }

  logOut() {
    this.oauthService.logOut();
    this.router.navigate(['/']);
  }
}
