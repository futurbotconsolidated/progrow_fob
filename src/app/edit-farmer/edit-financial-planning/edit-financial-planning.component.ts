import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-financial-planning',
  templateUrl: './edit-financial-planning.component.html',
  styleUrls: ['./edit-financial-planning.component.css'],
})
export class EditFinancialPlanningComponent implements OnInit {
  financialInfo = {} as any;
  constructor() {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      this.financialInfo = JSON.parse(A).financial_planning;
      console.log(this.financialInfo?.loanReqPlaned);
    }
  }

  ngOnInit(): void {}
}
