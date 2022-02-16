import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/common.service';
import { ActivatedRoute } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css'],
})
export class EditHeaderComponent implements OnInit {
  /* START: Variables */
  farmerId = '';
  demographicDisp = {} as any;
  /* END: Variables */

  constructor(
    private commonService: CommonService,
    private activatedRoute: ActivatedRoute
  ) {
    this.farmerId = this.activatedRoute.snapshot.params['farmerid'];

    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
    }
  }

  ngOnInit(): void {}
  /* START: Non-API Function Calls */
  // get Name from Master Json
  getDisplayName(dataProperty: string, id: any) {
    return this.commonService.getDisplayName('demoGraphic', dataProperty, id);
  }
  /* END: Non-API Function Calls */
}
