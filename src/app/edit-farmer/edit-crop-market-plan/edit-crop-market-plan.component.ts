import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-edit-crop-market-plan',
  templateUrl: './edit-crop-market-plan.component.html',
  styleUrls: ['./edit-crop-market-plan.component.css'],
})
export class EditCropMarketPlanComponent implements OnInit {
  cropMrktPlanDisp = {} as any;
  constructor(private commonService: CommonService) {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.cropMrktPlanDisp = JSON.parse(A).crop_market_plan;
    }
  }
  ngOnInit(): void {}
  // get Name from Master Json
  getDisplayName(dataProperty: string, id: any) {
    return this.commonService.getDisplayName('cropMarket', dataProperty, id);
  }
}
