import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-edit-fpo',
  templateUrl: './edit-fpo.component.html',
  styleUrls: ['./edit-fpo.component.css'],
})
export class EditFpoComponent implements OnInit {
  produceAggrDisp = {} as any;
  constructor(private commonService: CommonService) {
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.produceAggrDisp = JSON.parse(A).produce_aggregator;
    }
  }
  ngOnInit(): void {}

  // get Name from Master Json
  getDisplayName(dataProperty: string, id: any) {
    return this.commonService.getDisplayName(
      'produceAggregator',
      dataProperty,
      id
    );
  }
}
