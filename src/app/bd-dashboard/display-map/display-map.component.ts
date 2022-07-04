import { Component, OnInit, Output, Input, EventEmitter, ElementRef } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../shared/common.service';
import *  as  farmerD from '../../shared/modal/farmerRegister.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { OAuthService } from 'angular-oauth2-oidc';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import * as turf from "@turf/turf";

import {
  FormBuilder,
  // FormControl,
  // FormGroup,
  Validators,
} from '@angular/forms';

import * as Jquery from 'jquery';
declare var $: any;

@Component({
  selector: 'app-display-map',
  templateUrl: './display-map.component.html',
  styleUrls: ['./display-map.component.css'],
})
export class DisplayMapComponent implements OnInit {
  allFieldData = {} as any;
  fieldData = {} as any;
  filterForm: any;
  isSubmitted = false;
  ubds: any;
  countr = false;
  darl: any;
  map: any;
  checkfullMap: any;
  checkgeoL: any;
  checkMyLoc: any;
  mainloop = 0;
  identity: any;
  userInfo: any;
  draw_field_arr: any = [];
  popup_field_arr: any = [];
  map_loading = 0;
  map_first_time_load = 0;

  filters: any;
  displayFormScore = [] as any;
  displayFormSize = [] as any;
  cropObjectArray = [] as any;

  cropColors = {} as any;

  dropdownValues = [] as any;

  formScoreArray = [] as any;
  formSizeArray = [] as any;
  formCropArray = [] as any;

  LoadfilterData: any;

  cropReset = false;
  formScoreReset = false;
  formSizeReset = false;

  totalAreaAnalyzed = 0;

  minFieldSizeDetected = 0;
  maxFieldSizeDetected = 0;
  mdta: any;
  token: any;

  selectedType = 'CROP';
  allMainSelectedType = 'CROP';

  AllRenderFieldData = [] as any;
  displayRenderFieldData = [] as any;

  classficationCounts = {
    farms: {},
    area: {},
    yield: {},
  } as any;
  allBranches: any = [];
  popup_branch_arr: any = [];

  constructor(
    private commonService: CommonService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private fb: FormBuilder,
    public oauthService: OAuthService,
    private http: HttpClient,
    private dbService: NgxIndexedDBService,
    private _elementRef: ElementRef,
    private toastr: ToastrService

  ) {
    if (this.oauthService.getIdentityClaims()) {
      this.userInfo = this.oauthService.getIdentityClaims();
    }
    this.formScoreArray = this.commonService.getLocalBaseData().formScoreArray;
    this.formSizeArray = this.commonService.getLocalBaseData().formSizeArray;
    this.cropColors = this.commonService.getLocalBaseData().cropColors;

    this.filters = localStorage.getItem('selectedFilters');
    this.filters = JSON.parse(this.filters);
    if (!this.filters) {
      this.getFilterMeta();
      // this.router.navigate(['/filter-map']);
    }
    if (this.filters?.crop) {
      this.filters.crop.sort();

      if (Array.isArray(this.filters.crop) && this.filters.crop) {
        this.filters.crop.forEach((x: any) => {
          let crop_color_key = x?.toString().toLowerCase().trim().replaceAll(' ', '_');
          if (!this.classficationCounts.farms[crop_color_key]) {
            this.classficationCounts.farms[crop_color_key] = 0;
            this.classficationCounts.area[crop_color_key] = 0;
            this.classficationCounts.yield[crop_color_key] = 0;
          }
        });
      }
    }
    this.cropObjectArray = JSON.parse(localStorage.getItem('cropObjectArray') as any);
    this.cropObjectArray?.forEach((co: any) => {
      let crop_color_key = co?.crop_disp?.toString().toLowerCase().trim().replaceAll(' ', '_');
      if (!(this.cropColors[crop_color_key]?.backgroundColor)) {
        let randomColor = Math.floor(Math.random() * 16777215).toString(16);
        if (randomColor == '547621') {
          randomColor = Math.floor(Math.random() * 16777215).toString(16);
        }
        let crop_obj = {
          backgroundColor: '#' + randomColor,
          color: '#FFFFFF',
          pricePerKg: 80,
        };
        this.cropColors[crop_color_key] = crop_obj;
        console.log('Crop Colors : ', crop_obj);
      }
    });

    if (
      this.filters &&
      Array.isArray(this.filters.formScore) &&
      this.filters.formScore.length
    ) {
      this.filters.formScore.sort();
      this.filters.formScore.forEach((x: any) => {
        this.displayFormScore.push(
          this.formScoreArray
            .filter((y: any) => x == y.id)
            .map((z: any) => {
              return z.displayName;
            })
        );
      });
    }

    if (
      this.filters &&
      Array.isArray(this.filters.formSize) &&
      this.filters.formSize.length
    ) {
      this.filters.formSize.sort();
      this.filters.formSize.forEach((x: any) => {
        this.displayFormSize.push(
          this.formSizeArray
            .filter((y: any) => x == y.id)
            .map((z: any) => {
              return z.displayName;
            })
        );
      });
    }
  }

  ngOnInit(): void {
    localStorage.setItem('saveroute', '/bd/display-map');
    this.filterForm = this.fb.group({
      state: [this.filters?.state || '', Validators.required],
      district: [this.filters?.district || '', Validators.required],
      block: [this.filters?.block || '', Validators.required],
      areaOfInterest: [this.filters?.areaOfInterest || '', Validators.required],
      nameOfVillage: [this.filters?.nameOfVillage || '', Validators.required],
      season_id: [this.filters?.season_id || '', Validators.required],
      season_name: this.filters?.season_name || '',
      season_year: this.filters?.season_year || '',
      crop: [this.filters?.crop || [], Validators.required],
      formScore: [this.filters?.formScore || [], Validators.required],
      formSize: [this.filters?.formSize || [], Validators.required],
    });

    // if: filters not exist redirect filter-map else: read selected filters from localstorage
    let loadfilterData = localStorage.getItem('selectedFilters');
    if (!loadfilterData || !this.cropObjectArray.length) {
      $('#viewFilterbox').css('display', 'none');
      $('#editFilterbox').css('display', 'block');
      // this.router.navigate(['/filter-map']);
      // return;
    } else {
      this.LoadfilterData = JSON.parse(loadfilterData);
    }

    this.loadData();

    this.map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoicHVybmFyYW0iLCJhIjoiY2tpenBvZWpsMDNlaTMzcWpiZ2liZjEydiJ9.Mdj1w5dXDfCGCpIH5MlI2g',
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v11?optimize=true',
      center: [71.30950927734375, 26.993983884259237],
      zoom: 14,
      maxZoom: 22,
      minZoom: 1,
      scrollZoom: false,
      boxZoom: false,
      doubleClickZoom: false,
    });

    this.checkfullMap = new mapboxgl.NavigationControl();

    this.checkgeoL = new mapboxgl.FullscreenControl({
      container: <HTMLElement>document.getElementById('farmLayer'),
    });

    this.checkMyLoc = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    });
    this.checkMyLoc.on('geolocate', () => {
      this.map.setZoom(14);
    });

  }

  get f() {
    return this.filterForm.controls;
  }
  loadItemsdata(mdata: any) {
    this.mdta = mdata;

    $(document).ready(() => {
      setTimeout(() => {
        const AMA = this.dropdownValues.filter((x: any) => x.state_value == this.mdta.state);
        this.filters.districts = Array.isArray(AMA) && AMA.length ? AMA[0].districts : [];

        const BVA: any = this.filters.districts.filter((x: any) => x.district_value == this.mdta.block);
        this.filters.blocks = Array.isArray(BVA) && BVA.length ? BVA[0].blocks : [];

        const AOI: any = this.filters.blocks.filter((x: any) => x.block_value == this.mdta.block);
        this.filters.areaOfInterests = Array.isArray(AOI) && AOI.length ? AOI[0].area_of_interests : [];

        const SESA: any = this.filters.areaOfInterests.filter((x: any) => x.area_of_interest_value == this.mdta.areaOfInterest);

        this.filters.nameOfVillages = Array.isArray(SESA) && SESA.length ? SESA[0].nameOfVillages : [];
        // let nov: any = this.filters.nameOfVillages.filter((x: any) => x.nameOfVillage == this.mdta.nameOfVillage);
        this.filters.seasons = Array.isArray(SESA) && SESA.length ? SESA[0].season : [];

        let A: any = this.filters.seasons.filter((x: any) => x.season_id == this.mdta.season_id);
        this.filters.crops = Array.isArray(A) && A.length ? A[0].crops : [];
        if (this.filters?.crops.length) {
          localStorage.setItem('cropObjectArray', JSON.stringify(this.filters.crops));
        }
        if (A.length && A[0]?.name && A[0]?.year) {
          this.filterForm.get('season_name').setValue(A[0]?.name);
          this.filterForm.get('season_year').setValue(A[0]?.year);
        } else {
          this.filterForm.get('season_name').setValue('');
          this.filterForm.get('season_year').setValue('');
        }
      }, 2000);
    });
  }

  loadData() {
    if (this.LoadfilterData) {
      this.loadItemsdata(this.LoadfilterData);
      this.getFieldFieldUrl();
    }

    this.getMasterData();
  }

  Number(value: any) {
    return Number(value);
  }

  ibds(topRight: any, bottomLeft: any, point: any) {
    let isLongInRange: boolean;
    let isLatiInRange: boolean;
    isLongInRange = point.long >= bottomLeft.lng && point.long <= topRight.lng;
    isLatiInRange = point.lat >= bottomLeft.lat && point.lat <= topRight.lat;
    return isLongInRange && isLatiInRange;
  }

  overlayMap() {
    if (this.displayRenderFieldData.length > 0) {
      var newbounds2 = this.map.getBounds();
      this.displayRenderFieldData.forEach((elem: any, index: number) => {
        if (index == 0) {
          this.map_loading = 1;
          this.spinner.show();
        }
        var nnh = elem['geometry'].coordinates[0][0];
        nnh.long = nnh[0];
        nnh.lat = nnh[1];
        this.ibds(newbounds2._ne, newbounds2._sw, nnh) ? (this.countr = true) : (this.countr = false);
        elem['geometry'].coordinates.forEach((h: any, i: number) => {
          if (this.countr) {
            if (!this.map.getLayer(`figure${i}_${index}`)) {
              this.draw_field_arr.push(`figure${i}_${index}`);
              this.map.addSource(`figure${i}_${index}`, {
                type: 'geojson',
                data: {
                  type: 'Feature',
                  geometry: {
                    type: 'Polygon',
                    coordinates: [h],
                  },
                } as any,
              });

              this.map.addLayer({
                id: `figure${i}_${index}`,
                type: 'fill',
                source: `figure${i}_${index}`,
                layout: {},
                paint: {
                  'fill-color': elem.fillColor
                },
              });

              if (!(this.popup_field_arr.indexOf(`figure${i}_${index}`) > -1)) {
                this.popup_field_arr.push(`figure${i}_${index}`);
                let marker_lnglat: any = h[0];
                if ('object' == typeof (marker_lnglat[0])) {
                  marker_lnglat = marker_lnglat[0];
                }
                var distance: any = 999999999999;
                var branch_name: any = '';
                this.allBranches.forEach((branch: any, index: number) => {
                  if (branch?.branch_data?.lat || branch?.branch_data?.long) {
                    let lat = parseFloat(branch.branch_data.lat);
                    let long = parseFloat(branch.branch_data.long);
                    if (!(this.popup_branch_arr.indexOf(branch?.branch_unique_id) > -1)) {
                      this.popup_branch_arr.push(branch?.branch_unique_id);
                      let popupDescription = `<div class="field_popup">
                          <div class="row">
                            <div class="col-md-12 text-left">
                              <label class="fw-bold">Branch</label>
                              <p class="text-capitalize">${branch?.branch_name}</p>
                            </div>
                          </div>
                        </div>`;
                      // Draw a marker
                      new mapboxgl.Marker({ color: "#00FF00" })
                        .setLngLat([long, lat])
                        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupDescription))
                        .addTo(this.map);
                    }
                    var options: any = {
                      units: 'kilometers'
                    }; // units can be degrees, radians, miles, or kilometers, just be sure to change the units in the text box to match.               
                    let dis: any = turf.distance(marker_lnglat, [long, lat], options);
                    // console.log('dis : ', dis);
                    if (parseFloat(distance) >= parseFloat(dis)) {
                      distance = dis;
                      branch_name = branch?.branch_name;
                    }
                  }
                });
                if (distance == 999999999999) {
                  distance = 'N/A';
                } else {
                  distance = distance?.toFixed(1);
                }

                let display_map_pin = localStorage.getItem('display_map_pin');
                if (display_map_pin) {
                  new mapboxgl.Marker().setLngLat(marker_lnglat).addTo(this.map);
                }

                const seasonDetails = elem.season.filter((x: any) => x.season_name.toLowerCase() == this.filters.season_name.toLowerCase() && String(x.season_year) == String(this.filters.season_year))[0];
                let crop_color_key = seasonDetails?.crop.toString().toLowerCase().trim().replaceAll(' ', '_');

                let owener_details = '';
                let owener_option = '';
                if (elem?.owner_details && 'object' == typeof (elem?.owner_details)) {
                  elem.owner_details.forEach((owner_detail: any) => {
                    if (owner_detail?.owner_name) {
                      owener_option = owener_option + `<div class="col-md-6 text-left"><label class="fw-bold">Owner Name</label><p class="text-capitalize">${owner_detail.owner_name}</p></div>`;
                      if (owner_detail?.kcc_bank_name) {
                        owener_option = owener_option + `<div class="col-md-6 text-left"><label class="fw-bold">KCC Bank Name</label><p class="text-capitalize">${owner_detail.kcc_bank_name}</p></div>`;
                      }
                      if (owner_detail?.caste) {
                        owener_option = owener_option + `<div class="col-md-6 text-left"><label class="fw-bold">Caste</label><p class="text-capitalize">${owner_detail.caste}</p></div>`;
                      }
                      if (owner_detail?.land_owned) {
                        owener_option = owener_option + `<div class="col-md-6 text-left"><label class="fw-bold">Land Owned</label><p class="text-capitalize">${owner_detail.land_owned}(Hectare)</p></div>`;
                      }
                    }
                  });
                  if (owener_option) {
                    owener_details = `<div class="row">${owener_option}</div>`;
                  }
                } else {
                  // console.log('Invalid Format : ', 'Owner Details : ', elem?.owner_details);
                }

                let owener_input = `<div class="row">
        <div class="col-md-6 text-left">
          <label class="fw-bold">First Name</label>
          <p class="text-capitalize">
          <input placeholder="Enter First Name" style="width: 100%;" type="text" id="fname" name="fname">
          </p>
        </div>
        <div class="col-md-6 text-left">
          <label class="fw-bold">Last Name</label>
          <p class="text-capitalize">
          <input placeholder="Enter Last Name" style="width: 100%;" type="text" id="lname" name="lname">
          </p>
        </div>
        </div>`;

                let popupDescription = `<div class="field_popup" style="width:260px;height:250px;overflow-x:hidden;overflow-y:auto;">${owener_input}
                                      <div class="row">
                                      <div class="col-md-6 text-left">
                                        <label class="fw-bold">Land In(Hectare)</label>
                                        <p class="text-capitalize">
                                        <input placeholder="Enter Land In Hectare" style="width: 100%;" type="text" id="lholding" name="lholding">
                                        </p>
                                      </div>
                                      <div class="col-md-6 text-left">
                                        <label class="fw-bold">Phone Number</label>
                                        <p class="text-capitalize">
                                        <input placeholder="Enter Phone No." style="width: 100%;" type="text" id="pnum" name="pnum" maxlength="10" oninput="this.value = this.value.replace(/[^0-9.]/g, '');" />
                                        </p>
                                      </div>
                                      </div>

                                      <div class="row">
                                      <div class="col-md-6 text-left">
                                        <label class="fw-bold">Khasra Number</label>
                                        <p class="text-capitalize">
                                        <input id="khasraNo" placeholder="Khasra (274/8730, 995)" style="width: 100%;" type="text" id="landid" name="landid" value="${elem['khasraNum'] ?? ''}"/>
                                        </p>
                                      </div>

                                      <div class="col-md-6">
                                        <label class="fw-bold">Produce Value</label>
                                        <p id="prodValue">${(Number(seasonDetails?.Yield_Kg_per_Ha) * Number(elem['area-Ha']) * this.cropColors[crop_color_key]?.pricePerKg).toFixed(2)} ₹</p>
                                      </div>

                                    </div>
                                    <div class="row">
                                      <div class="col-md-6 text-left">
                                        <label class="fw-bold">Land Document</label>
                                        <p class="text-capitalize">
                                          <a style="color:#2EADC4" id="ownerDoc" href="${elem['url'] ?? ''}" target="_blank">Download</a>
                                        </p>
                                      </div>
                                      <div class="col-md-6 text-left">
                                        <label class="fw-bold">Visit Land</label>
                                        <p class="text-capitalize">
                                          <a style="color:#2EADC4" href="https://maps.google.com?q=${elem['geometry']
                    .coordinates[0][0][1]
                  },${elem['geometry'].coordinates[0][0][0]
                  }
                                          " target="_blank">Take Me</a>
                                        </p>
                                      </div>
                                    </div>

                                    <div class="row">
                                      <div class="col-md-6 text-left">
                                        <label class="fw-bold">Area Of Interest</label>
                                        <p id="AreaInterest" class="text-capitalize">${this.fieldData.area_of_interest}</p>
                                      </div>
                                      <div class="col-md-6 text-left">
                                        <label class="fw-bold">Aggregate Produce</label>
                                        <p class="text-capitalize" id="Yield_Kg_per_Ha">${((Number(elem['area-Ha']) * Number(seasonDetails.Yield_Kg_per_Ha)) / 1000)?.toFixed(2)} Tonnes</p>
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
                                    <div class="row">
                                      <div class="col-md-6">
                                        <label class="fw-bold">Season</label>
                                        <p>${this.filters?.season_name} ${this.filters?.season_year}</p>
                                      </div>
                                      <div class="col-md-6">
                                        <label class="fw-bold">Crop Type</label>
                                        <p>${seasonDetails?.crop}</p>
                                      </div>
                                    </div>
                                    <div class="row">
                                      <div class="col-md-6">
                                        <label class="fw-bold">Land A/C New</label>
                                        <p>${elem?.land_acc_number_new}</p>
                                      </div>
                                      <div class="col-md-6">
                                        <label class="fw-bold">Land A/C Old</label>
                                        <p>${elem?.land_acc_number_old}</p>
                                      </div>
                                    </div>
                                    <div class="row">
                                      <div class="col-md-6">
                                        <label class="fw-bold">Land Type</label>
                                        <p>${elem?.land_type}</p>
                                      </div>
                                      <div class="col-md-6">
                                        <label class="fw-bold">Branch</label>
                                        <p>${branch_name || 'N/A'}</p>
                                      </div>
                                      <div class="col-md-6">
                                        <label class="fw-bold">Branch Distance</label>
                                        <p>${distance || 'N/A'}(KM)</p>
                                      </div>
                                    </div>${owener_details}

                                    <div style="width:100%;text-align:center">
                                    <a style="text-align:center;margin: 0.4em; font-size: .8rem; padding: 0.4rem 1.3rem; border-radius: 5px; box-shadow: none; background: #2eadc4; text-transform: uppercase; cursor: pointer; min-width: 130px; transition: all .35s ease-in; font-weight: 600; color: #fff;" id="regFarmer">Register</a>
                                    </div>

                                    </div>`;

                this.map.on('click', `figure${i}_${index}`, () => {
                  let ogp = new mapboxgl.Popup({ className: "field-popup" })
                    .setLngLat(h[0])
                    .setHTML(popupDescription)
                    .setMaxWidth('400px')
                    .addTo(this.map);

                  ogp.getElement().addEventListener('click', (e) => {
                    var trget = (e.target as HTMLInputElement).id;

                    if (trget == 'regFarmer') {

                      let popFname = $(e.currentTarget).find('#fname').val();
                      let popLname = $(e.currentTarget).find('#lname').val();
                      let popLholding = $(e.currentTarget).find('#lholding').val();
                      let popPnum: any = $(e.currentTarget).find('#pnum').val();
                      let popYield = $(e.currentTarget).find('#Yield_Kg_per_Ha').text();
                      let popprodValue = $(e.currentTarget).find('#prodValue').text();
                      let popAreaInterest = $(e.currentTarget).find('#AreaInterest').val();
                      let popkhasraNo = $(e.currentTarget).find('#khasraNo').val();
                      let popDocUrl = $(e.currentTarget).find('#ownerDoc').attr("href");

                      let postModel = farmerD.farmerModel as Object;
                      let tempJ = JSON.stringify(postModel);
                      let prseJ = JSON.parse(tempJ);

                      prseJ.mobile = popPnum;
                      prseJ.demographic_info.farmerDetails.firstName = popFname;
                      prseJ.demographic_info.farmerDetails.lastName = popLname;
                      prseJ.demographic_info.address.mobileNumber = popPnum;
                      prseJ.field_info[0].field_area_ha = popLholding;

                      prseJ.field_info[0].planned_season_detail.plannedFieldDetails.predicted_produce = popYield;
                      prseJ.field_info[0].planned_season_detail.plannedFieldDetails.produce_value = popprodValue;
                      prseJ.demographic_info.area_of_interest = popAreaInterest;
                      prseJ.field_info[0].field_boundary.geometry.coordinates = h;

                      prseJ.field_info[0].field_ownership_detail.khasraNo = popkhasraNo
                      prseJ.field_info[0].field_ownership_detail.ownership_document_url = popDocUrl

                      prseJ.created_by = this.userInfo["name"];
                      prseJ.updated_by = this.userInfo["name"];

                      //console.log('postModel : ', postModel);
                      console.log('prseJ : ', prseJ);

                      if (!popFname || !popLname || !popPnum || !popLholding) {
                        //ogp.remove()
                        this.toastr.error('Error', 'Please provide all the details', { timeOut: 3000, });
                      } else if (popPnum.length != 10 || parseInt(popPnum) != popPnum) {
                        this.toastr.error('Error', 'Please provide valid phone number!', { timeOut: 3000, });
                      } else {
                        if (confirm("Are you sure you want to proceed?") == true) {
                          this.commonService.postFarmerData(prseJ).subscribe((data: any) => {
                            console.log('post Farmer Data : ', data);
                            if (data.message == 'Mobile Number already exist') {
                              //ogp.remove()
                              this.toastr.error('Mobile Number already exist', data.message, { timeOut: 3000, });
                            } else {
                              ogp.remove()
                              this.toastr.success('Farmer Register Success', data.message, { timeOut: 3000, });
                            }
                          },
                            (error: any) => {
                              this.spinner.hide();
                              if (error?.statusText == 'Unauthorized') {
                                this.logOut();
                                return;
                              }
                            });
                        } else {
                          this.toastr.error('Error', 'You cancelled', { timeOut: 3000, });
                        }
                      }
                    }
                  });
                });

                this.map.on('mouseenter', `figure${i}_${index}`, () => {
                  this.map.getCanvas().style.cursor = 'pointer';
                });

                this.map.on('mouseleave', `figure${i}_${index}`, () => {
                  this.map.getCanvas().style.cursor = '';
                });
              }
            }
          } else {
            let itm = `figure${i}_${index}`;
            if (this.map.getLayer(itm)) {
              this.map.removeLayer(itm);
              this.map.removeSource(itm);
              let dfi = this.draw_field_arr.indexOf(itm);
              if (dfi) {
                delete this.draw_field_arr[dfi];
              }
            }
          }
        });

        if (index == this.displayRenderFieldData.length - 1) {
          this.draw_field_arr = this.draw_field_arr.filter((dfa: any) => {
            return dfa !== null;
          });
          console.log('Draw Field : ', this.draw_field_arr.length);
          console.log('Field Popup : ', this.popup_field_arr.length);
          this.map_loading = 0;
          if (this.map_first_time_load) {
            this.spinner.hide();
          }
        }
      });
    }
  }

  onLoadFilterData() {
    this.AllRenderFieldData = [];
    this.displayRenderFieldData = [];
    if (
      this.filters?.state == this.fieldData?.state_name &&
      this.filters?.district == this.fieldData?.district_name &&
      this.filters?.block == this.fieldData?.block_name //&&
      // this.filters?.areaOfInterest == this.fieldData?.area_of_interest 
    ) {
      console.log('Features : ', this.fieldData['features'].length);
      this.fieldData['features'].forEach((elem: any, findex: number) => {
        let formScorePassed = false;
        let formSizePassed = false;
        let resSeason: any = [];
        elem.season.forEach((x: any, sindex: number) => {
          let crop_arr = this.filters?.crop.filter((y: any) => y.toString().toLowerCase().trim().replaceAll(' ', '_') == x?.crop.toString().toLowerCase().trim().replaceAll(' ', '_'));
          if (x?.season_name.toLowerCase() == this.filters?.season_name.toLowerCase() &&
            String(x?.season_year) == String(this.filters?.season_year) &&
            crop_arr.length
          ) {
            resSeason.push(x);
          }
        });
        if (!resSeason || (Array.isArray(resSeason) && !resSeason.length)) {
          return;
        }

        if (
          Array.isArray(this.filters.formSize) &&
          this.filters.formSize.length
        ) {
          const A = Number(elem['area-Ha']);
          this.filters.formSize.forEach((x: any) => {
            const B = this.formSizeArray.filter(
              (y: any) => String(x) == String(y.id)
            )[0];
            if (B.type == 'LEES_THAN' && A < B.to) {
              formSizePassed = true;
            } else if (B.type == 'BETWEEN' && A >= B.from && A <= B.to) {
              formSizePassed = true;
            } else if (B.type == 'GREATER_THAN' && A > B.from) {
              formSizePassed = true;
            }
          });
        } else {
          formSizePassed = true;
        }

        if (
          Array.isArray(this.filters.formScore) &&
          this.filters.formScore.length
        ) {
          const A = Number(elem['aggregate_frcm_score']);
          this.filters.formScore.forEach((x: any) => {
            const B = this.formScoreArray.filter(
              (y: any) => String(x) == String(y.id)
            )[0];
            if (B.type == 'LEES_THAN' && A < B.to) {
              formScorePassed = true;
            } else if (B.type == 'BETWEEN' && A >= B.from && A <= B.to) {
              formScorePassed = true;
            } else if (B.type == 'GREATER_THAN' && A > B.from) {
              formScorePassed = true;
            }
          });
        } else {
          formScorePassed = true;
        }

        if (formScorePassed && formSizePassed) {
          this.AllRenderFieldData.push(elem);
          const areaHa = Number(elem['area-Ha']);
          this.totalAreaAnalyzed += areaHa;
          this.minFieldSizeDetected =
            this.minFieldSizeDetected == 0
              ? areaHa
              : areaHa < this.minFieldSizeDetected
                ? areaHa
                : this.minFieldSizeDetected;

          this.maxFieldSizeDetected =
            this.maxFieldSizeDetected == 0
              ? areaHa
              : areaHa > this.maxFieldSizeDetected
                ? areaHa
                : this.maxFieldSizeDetected;

          resSeason.forEach((x: any) => {
            let crop_color_key = x?.crop?.toString().toLowerCase().trim().replaceAll(' ', '_');
            this.classficationCounts.farms[crop_color_key] += 1;
            this.classficationCounts.area[crop_color_key] += Number(elem['area-Ha']);
            this.classficationCounts.yield[crop_color_key] += Number(x.Yield_Kg_per_Ha);
          });
        }
      });
    } else {
      this.spinner.hide();
      console.log('Sorry, no data found.');
      alert('Sorry, no data found.');
      return;
    }
    console.log('AllRenderFieldData : ', this.AllRenderFieldData.length);
    if (!this.AllRenderFieldData.length) {
      this.spinner.hide();
      console.log('Sorry, no data found..');
      alert('Sorry, no data found..');
      return;
    } else {
      this.onChangeMainFilter('', 'CROP', {});
    }
  }

  onChangeMainFilter(event: any, type: string, inputObj: any) {
    this.spinner.show();
    this.draw_field_arr = [];
    this.popup_field_arr = [];
    this.map_loading = 0;
    this.map_first_time_load = 0;

    this.map = new mapboxgl.Map({
      accessToken:
        'pk.eyJ1IjoicHVybmFyYW0iLCJhIjoiY2tpenBvZWpsMDNlaTMzcWpiZ2liZjEydiJ9.Mdj1w5dXDfCGCpIH5MlI2g',
      container: 'map',
      style: 'mapbox://styles/mapbox/satellite-streets-v11?optimize=true',
      center: [71.30950927734375, 26.993983884259237],
      zoom: 14,
      maxZoom: 22,
      minZoom: 1,
      scrollZoom: false,
      boxZoom: false,
      doubleClickZoom: false,
    });

    if (type == 'SUB_CROP' || type == 'SUB_FARM_SIZE' || type == 'SUB_FRCM_SCORE') {
      var hlb = document.getElementsByClassName('higlightBtn');
      Array.prototype.forEach.call(hlb, function (itm, index) {
        itm.className = 'btn btn-sm m-1 nohiglightBtn';
      });

      if (event?.target?.classList.contains('higlightBtn')) {
        event.target.className = 'btn btn-sm m-1 nohiglightBtn';
      } else {
        event.target.className = 'btn btn-sm m-1 higlightBtn';
      }
    } else {
      var hlb = document.getElementsByClassName('higlightBtn');
      Array.prototype.forEach.call(hlb, function (itm, index) {
        itm.className = 'btn btn-sm m-1 nohiglightBtn';
      });
    }

    if (event?.target?.value == 'CROP') {
      this.selectedType = 'CROP';
    } else if (event?.target?.value == 'FARM_SIZE') {
      this.selectedType = 'FARM_SIZE';
    } else if (event?.target?.value == 'FRCM_SCORE') {
      this.selectedType = 'FRCM_SCORE';
    } else if (type == 'CROP' || type == 'SUB_CROP') {
      this.selectedType = 'CROP';
    } else if (type == 'FARM_SIZE' || type == 'SUB_FARM_SIZE') {
      this.selectedType = 'FARM_SIZE';
    } else if (type == 'FRCM_SCORE' || type == 'SUB_FRCM_SCORE') {
      this.selectedType = 'FRCM_SCORE';
    }

    this.displayRenderFieldData = [];
    this.AllRenderFieldData.forEach((elem: any) => {
      if (this.selectedType == 'CROP') {
        let resCrop: any = [];
        if (type == 'SUB_CROP') {
          resCrop = elem.season.filter(
            (x: any) => inputObj?.crop_value.toString().toLowerCase().trim().replaceAll(' ', '_') == x?.crop.toString().toLowerCase().trim().replaceAll(' ', '_')
          );
        } else {
          elem.season.forEach((x: any, sindex: number) => {
            let crop_arr = this.filters?.crop.filter((y: any) => y.toString().toLowerCase().trim().replaceAll(' ', '_') == x?.crop.toString().toLowerCase().trim().replaceAll(' ', '_'));
            if (crop_arr.length) {
              resCrop.push(x);
            }
          });
        }
        if (!resCrop || (Array.isArray(resCrop) && !resCrop.length)) {
          return;
        } else {
          let crop_color_key = resCrop[0]?.crop.toString().toLowerCase().trim().replaceAll(' ', '_');
          elem['fillColor'] = this.cropColors[crop_color_key]?.backgroundColor || '#72F736';
        }
      } else if (this.selectedType == 'FARM_SIZE') {
        if (type == 'SUB_FARM_SIZE') {
          const A = Number(elem['area-Ha']);
          const B = this.formSizeArray.filter(
            (y: any) => String(inputObj?.id) == String(y?.id)
          )[0];
          if (
            (B.type == 'LEES_THAN' && A < B.to) ||
            (B.type == 'BETWEEN' && A >= B.from && A <= B.to) ||
            (B.type == 'GREATER_THAN' && A > B.from)
          ) {
            elem['fillColor'] = B.backgroundColor;
          } else {
            return;
          }
        } else {
          const A = Number(elem['area-Ha']);
          const B = this.formSizeArray.filter((y: any) =>
            this.filters.formSize.includes(String(y?.id))
          );
          if (Array.isArray(B) && B.length) {
            B.forEach((i: any) => {
              if (
                (i.type == 'LEES_THAN' && A < i.to) ||
                (i.type == 'BETWEEN' && A >= i.from && A <= i.to) ||
                (i.type == 'GREATER_THAN' && A > i.from)
              ) {
                elem['fillColor'] = i.backgroundColor;
              } else {
                return;
              }
            });
          } else {
            return;
          }
        }
      } else if (this.selectedType == 'FRCM_SCORE') {
        if (type == 'SUB_FRCM_SCORE') {
          const A = Number(elem['aggregate_frcm_score']);
          const B = this.formScoreArray.filter(
            (y: any) => String(inputObj.id) == String(y.id)
          )[0];
          if (
            (B.type == 'LEES_THAN' && A < B.to) ||
            (B.type == 'BETWEEN' && A >= B.from && A <= B.to) ||
            (B.type == 'GREATER_THAN' && A > B.from)
          ) {
            elem['fillColor'] = B.backgroundColor;
          } else {
            return;
          }
        } else {
          const A = Number(elem['aggregate_frcm_score']);
          const B = this.formScoreArray.filter((y: any) =>
            this.filters.formScore.includes(String(y.id))
          );
          if (Array.isArray(B) && B.length) {
            B.forEach((i: any) => {
              if (
                (i.type == 'LEES_THAN' && A < i.to) ||
                (i.type == 'BETWEEN' && A >= i.from && A <= i.to) ||
                (i.type == 'GREATER_THAN' && A > i.from)
              ) {
                elem['fillColor'] = i.backgroundColor;
              } else {
                return;
              }
            });
          } else {
            return;
          }
        }
      } else {
        return;
      }

      this.displayRenderFieldData.push(elem);
    });
    console.log('DisplayField : ' + this.selectedType + ' : ' + (inputObj?.crop_value || inputObj?.id || '') + ' : ', this.displayRenderFieldData.length);
    if (!this.displayRenderFieldData.length) {
      this.spinner.hide();
      console.log('Sorry, no data found..');
      alert('Sorry, no data found..');
      return;
    } else {
      if (this.displayRenderFieldData[0]?.geometry?.coordinates[0][0]) {
        var centrCoord1 = this.displayRenderFieldData[0]?.geometry?.coordinates[0][0];
        if ('object' == typeof (centrCoord1[0])) {
          centrCoord1 = centrCoord1[0];
        }
        this.map.flyTo({
          center: centrCoord1,
        });
      }

      this.map.once('moveend', () => {
        if (!this.map_loading) {
          this.overlayMap();
        }
      });

      if (
        !this.map.hasControl(this.checkfullMap) &&
        !this.map.hasControl(this.checkgeoL) &&
        !this.map.hasControl(this.checkMyLoc)
      ) {
        this.map.addControl(this.checkfullMap);
        this.map.addControl(this.checkgeoL);
        this.map.addControl(this.checkMyLoc);
      }

      this.map.on('load', () => {
        this.map_loading = 0;
        this.map_first_time_load = 1;
        this.spinner.hide();
      });

      this.map.on('idle', () => {
        this.map_loading = 0;
        this.map_first_time_load = 1;
        this.spinner.hide();
      });

      this.map.on('mousemove', () => {
        if (!this.map_loading && !this.map_first_time_load) {
          this.overlayMap();
        }
      });

      this.map.on('rotate', () => {
        if (!this.map_loading && !this.map_first_time_load) {
          this.overlayMap();
        }
      });

      this.map.on('error', () => {
        console.log('A error event occurred.');
      });

      this.map.on('resize', () => {
        this.map_first_time_load = 0;
        if (!this.map_loading) {
          this.overlayMap();
        }
      });

      this.map.on('drag', () => {
        this.map_first_time_load = 0;
        if (!this.map_loading) {
          this.overlayMap();
        }
      });

      $(document).ready(() => {
        setTimeout(() => {
          this.map.on('zoom', () => {
            this.map_first_time_load = 0;
            if (!this.map_loading) {
              this.overlayMap();
            }
          });

          this.map.on('move', () => {
            if (!this.map_loading && !this.map_first_time_load) {
              this.overlayMap();
            }
          });

        }, 2000);
      });

    }
  }

  logOut() {
    localStorage.removeItem('cropObjectArray');
    localStorage.removeItem('selectedFilters');
    localStorage.removeItem('localMetadata');
    localStorage.removeItem('saveroute');

    this.oauthService.revokeTokenAndLogout();
    this.oauthService.logOut();
    this.router.navigate(['/']);
  }

  onChangeFilter(event: any, type: string, value: any) {
    console.log('event: ', event.target.value, ' type: ', type, 'value: ', value);
    const FORM_DATA = this.filterForm.value;
    console.log('FORM_DATA: ', FORM_DATA);

    if(this.filters == null){
      this.filters = [];
    }

    if (type == 'state') {
      FORM_DATA['state'] = event.target.value;
      this.filterForm.get('state').setValue(event.target.value);

      this.filters.districts = [];
      this.filters.blocks = [];
      this.filters.areaOfInterests = [];
      this.filters.nameOfVillages = [];
      this.filters.seasons = [];
      this.filters.crops = [];
      this.filterForm.get('season_id').setValue('');

      const A = this.dropdownValues.filter(
        (x: any) => x.state_value == FORM_DATA['state']
      );
      this.filters.districts = Array.isArray(A) && A.length ? A[0].districts : [];
    } else if (type == 'district') {
      FORM_DATA['district'] = event.target.value;
      this.filterForm.get('district').setValue(event.target.value);

      this.filters.blocks = [];
      this.filters.areaOfInterests = [];
      this.filters.nameOfVillages = [];
      this.filters.seasons = [];
      this.filters.crops = [];
      this.filterForm.get('season_id').setValue('');

      const A: any = this.filters.districts.filter(
        (x: any) => x.district_value == FORM_DATA['district']
      );
      this.filters.blocks = Array.isArray(A) && A.length ? A[0].blocks : [];
    } else if (type == 'block') {
      FORM_DATA['block'] = event.target.value;
      this.filterForm.get('block').setValue(event.target.value);

      this.filters.areaOfInterests = [];
      this.filters.nameOfVillages = [];
      this.filters.seasons = [];
      this.filters.crops = [];
      this.filterForm.get('season_id').setValue('');

      const A: any = this.filters.blocks.filter(
        (x: any) => x.block_value == FORM_DATA['block']
      );
      this.filters.areaOfInterests =
        Array.isArray(A) && A.length ? A[0].area_of_interests : [];
    } else if (type == 'area_of_interest') {
      FORM_DATA['areaOfInterest'] = event.target.value;
      this.filterForm.get('areaOfInterest').setValue(event.target.value);

      this.filters.nameOfVillages = [];
      this.filters.seasons = [];
      this.filters.crops = [];
      this.filterForm.get('season_id').setValue('');

      const A: any = this.filters.areaOfInterests.filter(
        (x: any) => x.area_of_interest_value == FORM_DATA['areaOfInterest']
      );
      this.filters.nameOfVillages = Array.isArray(A) && A.length ? A[0].name_of_villages : [];
      this.filters.seasons = Array.isArray(A) && A.length ? A[0].season : [];
    } else if (type == 'name_of_village') {
      FORM_DATA['nameOfVillage'] = event.target.value;
      this.filterForm.get('nameOfVillage').setValue(event.target.value);

    } else if (type == 'season') {
      FORM_DATA['season_id'] = event.target.value;
      this.filterForm.get('season_id').setValue(event.target.value);

      this.filters.crops = [];
      const A: any = this.filters.seasons.filter(
        (x: any) => x.season_id == FORM_DATA['season_id']
      );
      this.filters.crops = Array.isArray(A) && A.length ? A[0].crops : [];
      if (this.filters?.crops.length) {
        localStorage.setItem('cropObjectArray', JSON.stringify(this.filters.crops));
      }
      if (A.length) {
        this.filterForm.get('season_name').setValue(A[0].name);
        this.filterForm.get('season_year').setValue(A[0].year);
      } else {
        this.filterForm.get('season_name').setValue('');
        this.filterForm.get('season_year').setValue('');
      }
    }
    Jquery('#cropdiv').find('input').each(function () {
      Jquery(this).prop('checked', false);
    });
    Jquery('#formScorediv').find('input').each(function () {
      Jquery(this).prop('checked', false);
    });
    Jquery('#formSizediv').find('input').each(function () {
      Jquery(this).prop('checked', false);
    });
  }

  filterData() {
    this.isSubmitted = true;
    if (this.filterForm.invalid) {
      const invalid = [];
      const controls = this.filterForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }
    } else {
      const filterSelections = this.filterForm.getRawValue();
      localStorage.setItem('selectedFilters', JSON.stringify(filterSelections));
      localStorage.setItem('saveroute', '/bd/display-map');
      this.router.navigate(['/bd/display-map']).then(() => {
        window.location.reload();
      });
    }
  }

  arrayPush(event: any, formCntrlName: any, formVal: any) {
    formVal = String(formVal);
    let aryValCurr = this.filterForm.controls[formCntrlName].value;
    let aryValNew: any = [];
    if (Array.isArray(aryValCurr)) {
      aryValNew = [...aryValCurr];
    } else if (aryValCurr) {
      aryValNew = String(aryValCurr).split(',');
    }
    if (event.target.value == 'all') {
      aryValNew = [];
      let allArr: any = [];
      if (formCntrlName == 'crop') {
        this.filters.crops.forEach((x: any) => {
          allArr.push(x.crop_value);
        });
        if (event.target.checked) {
          Jquery('#cropdiv').find('input').each(function () {
            Jquery(this).prop('checked', true);
          });
        } else {
          Jquery('#cropdiv').find('input').each(function () {
            Jquery(this).prop('checked', false);
          });
        }
      } else if (formCntrlName == 'formScore') {
        this.formScoreArray.forEach((x: any) => {
          allArr.push(x.id.toString());
        });
        if (event.target.checked) {
          Jquery('#formScorediv').find('input').each(function () {
            Jquery(this).prop('checked', true);
          });
        } else {
          Jquery('#formScorediv').find('input').each(function () {
            Jquery(this).prop('checked', false);
          });
        }
      } else if (formCntrlName == 'formSize') {
        this.formSizeArray.forEach((x: any) => {
          allArr.push(x.id.toString());
        });
        if (event.target.checked) {
          Jquery('#formSizediv').find('input').each(function () {
            Jquery(this).prop('checked', true);
          });
        } else {
          Jquery('#formSizediv').find('input').each(function () {
            Jquery(this).prop('checked', false);
          });
        }
      }
      if (event.target.checked) {
        allArr.forEach((formVal: any) => {
          aryValNew.push(formVal);
        });
      }
    } else {
      if (aryValNew.includes(formVal) && !event.target.checked) {
        aryValNew.splice(aryValNew.indexOf(formVal), 1);
      } else {
        aryValNew.push(formVal);
      }

      if (formCntrlName == 'crop') {
        if (event.target.checked) {
          let all_flag = true;
          Jquery('#cropdiv').find('input').each(function () {
            if (Jquery(this).val() != 'all' && !Jquery(this).is(':checked')) {
              all_flag = false;
            }
          });
          Jquery('#cropall').prop('checked', all_flag);
        } else {
          Jquery('#cropall').prop('checked', false);
        }
      } else if (formCntrlName == 'formScore') {
        if (event.target.checked) {
          let all_flag = true;
          Jquery('#formScorediv').find('input').each(function () {
            if (Jquery(this).val() != 'all' && !Jquery(this).is(':checked')) {
              all_flag = false;
            }
          });
          Jquery('#formScoreall').prop('checked', all_flag);
        } else {
          Jquery('#formScoreall').prop('checked', false);
        }
      } else if (formCntrlName == 'formSize') {
        if (event.target.checked) {
          let all_flag = true;
          Jquery('#formSizediv').find('input').each(function () {
            if (Jquery(this).val() != 'all' && !Jquery(this).is(':checked')) {
              all_flag = false;
            }
          });
          Jquery('#formSizeall').prop('checked', all_flag);
        } else {
          Jquery('#formSizeall').prop('checked', false);
        }
      }
    }

    this.filterForm.get(formCntrlName).setValue(aryValNew);
    if (this.filterForm.controls[formCntrlName].pristine) {
      this.filterForm.get(formCntrlName).markAsDirty();
    }
    console.log(formCntrlName + ' : ', aryValNew);
  }

  ShowEditbox() {
    this.getFilterMeta();
    console.log('filters : ', this.filters);
    if (this.filters != null) {
      let A = this.dropdownValues.filter(
        (x: any) => x.state_value.toString().toLowerCase().replace(/\s/g, "") == this.filters.state.toString().toLowerCase().replace(/\s/g, "")
      );
      this.filters.districts = Array.isArray(A) && A.length ? A[0].districts : [];
      A = this.filters.districts.filter(
        (x: any) => x.district_value == this.filters.district
      );
      this.filters.blocks = Array.isArray(A) && A.length ? A[0].blocks : [];
      A = this.filters.blocks.filter(
        (x: any) => x.block_value == this.filters.block
      );
      this.filters.areaOfInterests = Array.isArray(A) && A.length ? A[0].area_of_interests : [];
      A = this.filters.areaOfInterests.filter(
        (x: any) => x.area_of_interest_value == this.filters.areaOfInterest
      );
      this.filters.nameOfVillages = Array.isArray(A) && A.length ? A[0].name_of_villages : [];
      this.filters.seasons = Array.isArray(A) && A.length ? A[0].season : [];
      A = this.filters.seasons.filter(
        (x: any) => x.season_id == this.filters.season_id
      );
      this.filters.crops = Array.isArray(A) && A.length ? A[0].crops : [];
    } else {
      //this.filters = [];
    }
    $('#viewFilterbox').css('display', 'none');
    $('#editFilterbox').css('display', 'block');
  }

  resetEditBox() {
    localStorage.removeItem('cropObjectArray');
    localStorage.removeItem('selectedFilters');
    localStorage.removeItem('localMetadata');
    //localStorage.removeItem('saveroute');
    window.location.reload();
    //this.router.navigate(['/filter-map']);
  }

  regFarmer() {
    console.log('regFarmer');
  }

  getFilterMeta() {
    let isMetaDataExist = localStorage.getItem('localMetadata');
    if (!isMetaDataExist) {
      this.spinner.show();
      this.commonService.getFilterMeta().subscribe(
        (res: any) => {
          if (res?.data) {
            localStorage.setItem('localMetadata', JSON.stringify(res.data));
            this.dropdownValues = res.data;
          }
          this.spinner.hide();
        },
        (error: any) => {
          this.spinner.hide();
          if (error?.statusText == 'Unauthorized') {
            this.logOut();
            return;
          }
        }
      );
    } else {
      this.dropdownValues = JSON.parse(isMetaDataExist);
    }
  }

  getFieldFieldUrl() {
    this.spinner.show();
    if (this.filters?.block && this.filters?.nameOfVillage) {
      const input_obj = {
        "area": this.filters?.block,
        "village": this.filters?.nameOfVillage,
      };
      this.commonService.postAreaOfInterest(input_obj).subscribe(
        (resData: any) => {
          if (resData && 'object' == typeof (resData) && resData?.signedUrl) {
            this.commonService.getFieldData(resData.signedUrl).subscribe(
              (data: any) => {
                console.log('data : ', data);
                if (data && 'object' == typeof (data)) {
                  this.allFieldData = data;
                  this.fieldData = data;
                  this.onLoadFilterData();
                } else {
                  console.log('API is not fetch data !');
                  this.spinner.hide();
                  alert('Sorry, no data found..');
                }
              },
              (error: any) => {
                this.spinner.hide();
                if (error?.statusText == 'Unauthorized') {
                  this.logOut();
                  return;
                }
              }
            );
          } else {
            console.log('API is not fetch signed URL !');
            this.spinner.hide();
            alert('Sorry, no data found..');
          }
        },
        (error: any) => {
          this.spinner.hide();
          if (error?.statusText == 'Unauthorized') {
            this.logOut();
            return;
          }
        }
      );
    }
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

}
