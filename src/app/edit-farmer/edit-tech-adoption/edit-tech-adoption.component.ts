import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-tech-adoption',
  templateUrl: './edit-tech-adoption.component.html',
  styleUrls: ['./edit-tech-adoption.component.css'],
})
export class EditTechAdoptionComponent implements OnInit {
  techAdoptionDisp = {} as any;
  constructor() {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      this.techAdoptionDisp = JSON.parse(A).technology_adoption;
      console.log(this.techAdoptionDisp);
    }
  }

  ngOnInit(): void {}
}
