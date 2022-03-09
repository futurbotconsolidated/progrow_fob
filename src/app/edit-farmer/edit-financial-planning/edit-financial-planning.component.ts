import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-financial-planning',
  templateUrl: './edit-financial-planning.component.html',
  styleUrls: ['./edit-financial-planning.component.css'],
})
export class EditFinancialPlanningComponent implements OnInit {
  financialPlanDisp = {} as any;
  constructor() {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.financialPlanDisp = JSON.parse(A).financial_planning;
    }
  }

  ngOnInit(): void {}
}
