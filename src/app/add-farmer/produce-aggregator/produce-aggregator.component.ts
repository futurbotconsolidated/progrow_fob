import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-produce-aggregator',
  templateUrl: './produce-aggregator.component.html',
  styleUrls: ['./produce-aggregator.component.css'],
})
export class ProduceAggregatorComponent implements OnInit {
  produceAggregatorForm = new FormGroup({});

  constructor() {}

  ngOnInit(): void {}
}
