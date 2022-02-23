import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-edit-financial-planning',
  templateUrl: './edit-financial-planning.component.html',
  styleUrls: ['./edit-financial-planning.component.css'],
})
export class EditFinancialPlanningComponent implements OnInit {
  financialPlanDisp = {} as any;
  constructor(private commonService: CommonService) {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      this.financialPlanDisp = JSON.parse(A).financial_planning;
      // console.log(this.financialPlanDisp?.loanReqPlaned);
    }
  }

  ngOnInit(): void {}
  // get Name from Master Json
  getDisplayName(dataProperty: string, id: any, dataType: string) {
    return this.commonService.getDisplayName(dataType, dataProperty, id);
  }
}
