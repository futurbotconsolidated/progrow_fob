import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-financial-planning',
  templateUrl: './financial-planning.component.html',
  styleUrls: ['./financial-planning.component.css'],
})
export class FinancialPlanningComponent implements OnInit {
  financialForm = new FormGroup({});
  constructor() {}

  ngOnInit(): void {}
}
