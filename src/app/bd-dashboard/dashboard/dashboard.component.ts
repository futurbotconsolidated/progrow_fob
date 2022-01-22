import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import * as mapboxgl from 'mapbox-gl';
import { NgxSpinnerService } from 'ngx-spinner';
import { CommonService } from '../../shared/common.service';
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

  /* END: Variables */

  constructor(
    public oauthService: OAuthService,
    public commonService: CommonService,
    private spinner: NgxSpinnerService
  ) {
    this.userInfo = this.oauthService.getIdentityClaims();
  }

  ngOnInit(): void {
    this.loadData();
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
      if (!this.allPipelineFarmers) this.getFarmersPipeline();
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      this.overlayMap('FARMS_PIPELINE_MAP_VIEW');
    }
  }

  overlayMap(type: string) {
    this.spinner.show();
    this.overlayData.length = 0; // clear data
    let mapViewType = '';
    let useData = [] as any;
    if (type == 'EXISTING_FARMS_MAP_VIEW') {
      mapViewType = 'existing_farmers_mapbox';
      useData = mapData['features'];
    } else if (type == 'FARMS_PIPELINE_MAP_VIEW') {
      mapViewType = 'farms_pipeline_mapbox';
      useData = mapData['features'];
    }
    //  Start Overlay Code
    // TO MAKE THE MAP APPEAR YOU MUST ADD  YOUR ACCESS TOKEN FROM https://account.mapbox.com
    const map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoicHVybmFyYW0iLCJhIjoiY2tpenBvZWpsMDNlaTMzcWpiZ2liZjEydiJ9.Mdj1w5dXDfCGCpIH5MlI2g',
      container: mapViewType, // container ID
      style: 'mapbox://styles/mapbox/satellite-v9?optimize=true', // style URL
      zoom: 14, // starting zoom
      center: [71.43395031003963, 27.04756708332954],
    });

    // geojson coordinates
    map.on('load', () => {
      useData.forEach((elem: any, index: number) => {
        // prepare popup
        const popupDescription = `<div class="field_popup" style="width:260px;">
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Owner Name</label>
               <p class="text-capitalize">###</p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Land Record Id</label>
               <p class="text-capitalize">###</p>
             </div>
           </div>
           <div class="row">
             <div class="col-md-6 text-left">
               <label class="fw-bold">Land Document</label>
               <p class="text-capitalize">
                 <a href="https://bhunaksha.raj.nic.in/08/plotreportRJ.jsp?state=08&giscode=1508804350166906168001&plotno=673" target="_blank">Download</a>
               </p>
             </div>
             <div class="col-md-6 text-left">
               <label class="fw-bold">Visit Land</label>
               <p class="text-capitalize">
                 <a href="https://maps.google.com?q=${
                   elem['geometry'].coordinates[0][0][1]
                 },${elem['geometry'].coordinates[0][0][0]}
                 " target="_blank">Take Me</a>
               </p>
             </div>
           </div>
           <div class="row">
             <div class="col-md-6">
               <label class="fw-bold">Farm Size</label>
               <p>${Number(elem['area-Ha'])?.toFixed(2)} Ha</p>
             </div>
             <div class="col-md-6">
               <label class="fw-bold">FRCM Score</label>
               <p>${Number(elem['aggregate_frcm_score'])?.toFixed(2)}</p>
             </div>
           </div>
         </div>`;

        elem['geometry'].coordinates.forEach((h: any, i: number) => {
          // Add Source
          map.addSource(`figure${i}_${index}`, {
            type: 'geojson',
            data: {
              type: 'Feature',
              geometry: {
                type: 'Polygon',
                coordinates: [h],
              },
            } as any,
          });

          // Add a layer showing the fields.
          map.addLayer({
            id: `figure${i}_${index}`,
            type: 'fill',
            source: `figure${i}_${index}`,
            layout: {},
            paint: {
              'fill-color': 'red',
              'fill-opacity': 0.8,
            },
          });

          // When a click event occurs on a feature in the places layer, open a popup at the
          // location of the feature, with description HTML from its properties.
          map.on('click', `figure${i}_${index}`, (e) => {
            new mapboxgl.Popup()
              .setLngLat(h[0])
              .setHTML(popupDescription)
              .setMaxWidth('400px')
              .addTo(map);
          });

          // Change the cursor to a pointer when the mouse is over the places layer.
          map.on('mouseenter', `figure${i}_${index}`, () => {
            map.getCanvas().style.cursor = 'pointer';
          });

          // Change it back to a pointer when it leaves.
          map.on('mouseleave', `figure${i}_${index}`, () => {
            map.getCanvas().style.cursor = '';
          });
        });

        if (index == useData.length - 1) {
          this.spinner.hide();
        }
      });
    });

    map.addControl(new mapboxgl.NavigationControl()); // Add map controls
    map.addControl(new mapboxgl.FullscreenControl()); // Add map full screen
  }
  /* END: Non-API Function Calls */

  /* START: API Function Calls */
  getExistingFarmers() {
    this.spinner.show();
    this.commonService.getExistingFarmers().subscribe(
      (res: any) => {
        this.spinner.hide();
        if (res.message != 'Success' || !res.status) {
          alert('Failed to fetch existing farmers data, please try again...');
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
}
