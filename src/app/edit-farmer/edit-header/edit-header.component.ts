import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css'],
})
export class EditHeaderComponent implements OnInit {
  farmerId = '';
  demographicDisp = {} as any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private commonService: CommonService
  ) {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
    }
  }
  ngOnInit(): void {
    this.loadData();
  }
  /* START: Non-API Function Calls */
  loadData() {
    this.farmerId = this.activatedRoute.snapshot.params['farmerid'];
  }
  // get Name from Master Json
  getDisplayName(dataProperty: string, id: any) {
    return this.commonService.getDisplayName('demoGraphic', dataProperty, id);
  }
  /* END: Non-API Function Calls */
}
