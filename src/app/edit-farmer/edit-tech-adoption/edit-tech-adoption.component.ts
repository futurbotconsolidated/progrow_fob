import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../shared/common.service';

@Component({
  selector: 'app-edit-tech-adoption',
  templateUrl: './edit-tech-adoption.component.html',
  styleUrls: ['./edit-tech-adoption.component.css'],
})
export class EditTechAdoptionComponent implements OnInit {
  techAdoptionDisp = {} as any;
  constructor(private commonService: CommonService) {
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
