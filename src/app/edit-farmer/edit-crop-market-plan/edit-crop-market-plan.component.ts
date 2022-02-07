import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-crop-market-plan',
  templateUrl: './edit-crop-market-plan.component.html',
  styleUrls: ['./edit-crop-market-plan.component.css'],
})
export class EditCropMarketPlanComponent implements OnInit {
  cropMrktPlanDisp = {} as any;
  constructor() {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      this.cropMrktPlanDisp = JSON.parse(A).crop_market_plan;
      console.log(this.cropMrktPlanDisp);
    }
  }
  ngOnInit(): void {}
}
