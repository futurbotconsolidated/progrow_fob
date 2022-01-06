import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-crop-market-plan',
  templateUrl: './crop-market-plan.component.html',
  styleUrls: ['./crop-market-plan.component.css'],
})
export class CropMarketPlanComponent implements OnInit {
  cropMarketPlanForm = new FormGroup({});

  constructor() {}

  ngOnInit(): void {}
}
