import { Component, OnInit } from '@angular/core';
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

  constructor() {
    this.technologyAdoptionMaster = data.technologyAdoption; // read master data
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.techAdoptionDisp = JSON.parse(A).technology_adoption;
    }
  }

  ngOnInit(): void {}
}
