import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-fpo',
  templateUrl: './edit-fpo.component.html',
  styleUrls: ['./edit-fpo.component.css'],
})
export class EditFpoComponent implements OnInit {
  produceAggrDisp = {} as any;
  constructor() {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.produceAggrDisp = JSON.parse(A).produce_aggregator;
    }
  }
  ngOnInit(): void {}
}
