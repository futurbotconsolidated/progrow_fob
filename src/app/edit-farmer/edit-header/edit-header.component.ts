import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css'],
})
export class EditHeaderComponent implements OnInit {
  farmerId = '';
  demographicDisp = {} as any;
  constructor(private activatedRoute: ActivatedRoute) {
    const A: any = localStorage.getItem('farmer-details');

    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
      console.log(this.demographicDisp);
    }
  }
  ngOnInit(): void {
    this.loadData();
  }
  /* START: Non-API Function Calls */
  loadData() {
    this.farmerId = this.activatedRoute.snapshot.params['farmerid'];
  }
  /* END: Non-API Function Calls */
}
