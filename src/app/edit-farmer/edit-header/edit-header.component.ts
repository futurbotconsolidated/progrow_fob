import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css'],
})
export class EditHeaderComponent implements OnInit {
  demographicDisp = {} as any;
  constructor() {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
      console.log(this.demographicDisp);
    }
  }
  ngOnInit(): void {}
}
