import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/common.service';
import { data } from '../../shared/fob_master_data';

@Component({
  selector: 'app-edit-tech-adoption',
  templateUrl: './edit-tech-adoption.component.html',
  styleUrls: ['./edit-tech-adoption.component.css'],
})
export class EditTechAdoptionComponent implements OnInit {
  /* START: Variable */
  techAdoptionDisp = {} as any;
  technologyAdoptionMaster = <any>{};
  /* END: Variable */

  constructor(private commonService: CommonService) {
    this.technologyAdoptionMaster = data.technologyAdoption; // read master data

    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.techAdoptionDisp = JSON.parse(A).technology_adoption;
    }
  }

  ngOnInit(): void {}

  // get Name from Master Json
  getDisplayName(dataProperty: string, id: any) {
    return this.commonService.getDisplayName(
      'technologyAdoption',
      dataProperty,
      id
    );
  }
}
