import { Component, OnInit } from '@angular/core';
import { formatDate } from '@angular/common';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import * as mapboxgl from 'mapbox-gl';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';
import { ToastrService } from 'ngx-toastr';
import { NgxIndexedDBService } from 'ngx-indexed-db';

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
  allDraftFarmers = [] as any;
  overlayData = [] as any;
  dtOptions: DataTables.Settings = {};
  searchValue = '';
  lsn_tv_show = false;

  filterType = 'this_month';
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
    const A = localStorage.getItem('filter-value');
    if (!A) {
      this.filterType = 'this_month';
    }
  }

  ngOnInit(): void {
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

    // let obj_search = JSON.parse(localStorage.getItem('search-value') as any);
    // if (obj_search && obj_search.minDate != '' && obj_search.maxDate != '') {
    //   this.searchValue = obj_search.searchValue;
    //   $.fn['dataTable'].ext.search.push(
    //     (settings: any, data: any, dataIndex: any) => {
    //       const regDate = data[3];
    //       if (regDate && (obj_search.minDate || obj_search.maxDate)) {
    //         if (
    //           formatDate(regDate, 'yyyy-MM-dd', 'en_IN') >=
    //             formatDate(obj_search.minDate, 'yyyy-MM-dd', 'en_IN') &&
    //           formatDate(obj_search.maxDate, 'yyyy-MM-dd', 'en_IN') >=
    //             formatDate(regDate, 'yyyy-MM-dd', 'en_IN')
    //         ) {
    //           return true;
    //         }
    //       }
    //       return false;
    //     }
    //   );
    // }

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
  }

  filterFarms(type: string) {
    this.selectedViewType = type;
    if (type == 'EXISTING_FARMS_LIST_VIEW') {
      if (!this.allExistingFarmers) this.getExistingFarmers('');
    } else if (type == 'EXISTING_FARMS_MAP_VIEW') {
      this.overlayMap('EXISTING_FARMS_MAP_VIEW');
    } else if (type == 'FARMS_PIPELINE_LIST_VIEW') {
      this.getFarmersPipeline();
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      this.overlayMap('FARMS_PIPELINE_MAP_VIEW');
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
    this.dbService.clear('registerFarmer').subscribe((successDeleted) => {
      console.log('success? ', successDeleted);
    });

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

  // selectlive(event: any) {
  //   let minDate = '' as any;
  //   let maxDate = '' as any;
  //   let last_date = new Date();
  //   if (event.target.value === 'today') {
  //     minDate = maxDate = new Date();
  //   } else if (event.target.value === 'this_week') {
  //     maxDate = new Date();
  //     last_date.setDate(last_date.getDate() - 7);
  //     minDate = last_date;
  //   } else if (event.target.value === 'two_week') {
  //     maxDate = new Date();
  //     last_date.setDate(last_date.getDate() - 14);
  //     minDate = last_date;
  //   } else if (event.target.value === 'three_week') {
  //     maxDate = new Date();
  //     last_date.setDate(last_date.getDate() - 21);
  //     minDate = last_date;
  //   } else if (event.target.value === 'this_month') {
  //     maxDate = new Date();
  //     last_date.setDate(last_date.getDate() - 30);
  //     minDate = last_date;
  //   }
  //   const obj_search1 = {
  //     minDate: minDate,
  //     maxDate: maxDate,
  //     searchValue: event.target.value,
  //   };
  //   localStorage.setItem('search-value', JSON.stringify(obj_search1));
  //   window.location.reload();
  // }

  overlayMap(type: string) {
    this.spinner.show();
    this.overlayData.length = 0; // clear data
    let mapViewType = '';
    let useData = [] as any;
    if (type == 'EXISTING_FARMS_MAP_VIEW') {
      mapViewType = 'existing_farmers_mapbox';
      //useData = mapData['features'];
      if (!this.allExistingFarmers) this.getExistingFarmers('');
      useData = this.allExistingFarmers;
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      mapViewType = 'farms_pipeline_mapbox';
      //useData = mapData['features'];
      if (!this.allExistingFarmers) this.getExistingFarmers('');
      useData = this.allExistingFarmers;
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
        map.loadImage(
          'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
          (error: any, image: any) => {
            if (error) {
              throw error;
            }
            map.addImage('custom-marker', image);
          }
        );
        if (useData.length) {
          useData.forEach((elem: any, index: number) => {
            // prepare popup
            elem['fieldInfo'].forEach((f_elem: any, f_index: number) => {
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
              const popupDescription = `<div class="field_popup" style="width:260px;">
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Id</label>
               <p class="text-capitalize">${elem['farmerId']}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Farmer Name</label>
               <p class="text-capitalize">${elem['farmerDetails'].firstName} ${
                elem['farmerDetails'].middleName
              } ${elem['farmerDetails'].lastName} </p>
             </div>
           </div>
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Date of registration</label>
               <p class="text-capitalize">${formatDate(
                 elem['registrationDate'],
                 'EE, MMM d, y',
                 'en_IN'
               )}</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Address</label>
               <p class="text-capitalize">${elem.address.addressLine1} ${
                elem.address.addressLine2
              } ${elem.address.pincode}</p>
             </div>
           </div>        
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Visit Land</label>
               <p class="text-capitalize">
                 <a href="https://maps.google.com?q=${
                   coordinates_arr[0][0][1]
                 },${coordinates_arr[0][0][0]}
                 " target="_blank">Take Me</a> 
                </p> 
              </div> 
              <div class="col-md-6 text-left d-none" >
                <a routerLink="/edit/demographic-info/${
                  elem['farmerId']
                }"  class="btn btn-sm mt-2 btn-farmer p-1">View Profile</a>
              </div>
            </div>
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

                let line_h = h;
                line_h.push(h[0]);
                map.addSource(`line_source_figure${i}_${index}_${f_index}`, {
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
                  id: `figure${i}_${index}_${f_index}`,
                  type: 'fill',
                  source: `figure${i}_${index}_${f_index}`,
                  layout: {},
                  paint: {
                    'fill-outline-color': 'red',
                    'fill-opacity': 1,
                    'fill-color': 'transparent',
                  },
                });

                // Add a layer showing the fields.
                map.addLayer({
                  id: `line_figure${i}_${index}_${f_index}`,
                  type: 'line',
                  source: `line_source_figure${i}_${index}_${f_index}`,
                  layout: {},
                  paint: {
                    'line-color': 'red',
                    'line-width': 3,
                  },
                });
                // Add a layer(marker) showing the field location.
                map.addLayer({
                  id: `icon_figure${i}_${index}_${f_index}`,
                  type: 'symbol',
                  source: `figure${i}_${index}_${f_index}`,
                  layout: {
                    'icon-image': 'custom-marker',
                  } as any,
                });

                // When a click event occurs on a feature in the places layer, open a popup at the
                // location of the feature, with description HTML from its properties.
                map.on('click', `icon_figure${i}_${index}_${f_index}`, (e) => {
                  new mapboxgl.Popup()
                    .setLngLat(h[0])
                    .setHTML(popupDescription)
                    .setMaxWidth('400px')
                    .addTo(map);
                });

                // Change the cursor to a pointer when the mouse is over the places layer.
                map.on(
                  'mouseenter',
                  `icon_figure${i}_${index}_${f_index}`,
                  () => {
                    map.getCanvas().style.cursor = 'pointer';
                  }
                );

                // Change it back to a pointer when it leaves.
                map.on(
                  'mouseleave',
                  `icon_figure${i}_${index}_${f_index}`,
                  () => {
                    map.getCanvas().style.cursor = '';
                  }
                );
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
    this.router.navigate(['/']);
  }

  showLeftSide(param: boolean) {
    this.lsn_tv_show = param;
  }
  onChangeFilter(event: any) {
    localStorage.setItem('filter-value', event.target.value);
    this.getExistingFarmers(event.target.value);
  }

  clearLocalStorageOnEditAndView() {
    localStorage.removeItem('farmer-details'); // related to view and edit of farmer
    localStorage.removeItem('farmer-files'); // related to s3 farmer documents uploaded

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
    this.dbService.clear('registerFarmer').subscribe((successDeleted) => {
      console.log('success? ', successDeleted);
    });
  }

  /* END: Non-API Function Calls */

  /* START: API Function Calls */
  getExistingFarmers(filterType: string) {
    this.spinner.show();
    this.commonService.getExistingFarmers(filterType).subscribe(
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
    this.allPipelineFarmers = [];
    return;
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
        this.toastr.error(
          `Failed to fetch farmer details, please try again...`
        );
      }
    );
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
        this.toastr.error(`Failed to fetch farmer files, please try again...`);
      }
    );
  }
  /* END: API Function Calls */
}
