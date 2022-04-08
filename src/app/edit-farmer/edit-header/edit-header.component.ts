import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css'],
})
export class EditHeaderComponent implements OnInit {
  /* START: Variables */
  farmerId = '';
  demographicDisp = {} as any;

  // indexed db variables
  displayFarmerProfileImage = '' as any;
  concatePage = 'demographic';
  indexedDBFileNameManage = {
    farmerProfile: { front: `${this.concatePage}_farmerProfileImage` },
  };
  /* END: Variables */

  constructor(
    private activatedRoute: ActivatedRoute,
    private dbService: NgxIndexedDBService,
    public commonService: CommonService
  ) {
    this.farmerId = this.activatedRoute.snapshot.params['farmerId'];
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
    }

    // patch farmer Profile image
    this.displayFarmerProfileImage = this.commonService.fetchFarmerDocument(
      this.indexedDBFileNameManage.farmerProfile.front
    );
  }

  ngOnInit(): void {}
}
