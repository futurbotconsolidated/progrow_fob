import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-edit-header',
  templateUrl: './edit-header.component.html',
  styleUrls: ['./edit-header.component.css'],
})
export class EditHeaderComponent implements OnInit {
  /* START: Variables */
  farmerId = '';
  demographicDisp = {} as any;
  /* END: Variables */

  constructor(private activatedRoute: ActivatedRoute) {
    this.farmerId = this.activatedRoute.snapshot.params['farmerId'];
    const A: any = localStorage.getItem('farmer-details');
    if (A) {
      this.demographicDisp = JSON.parse(A).demographic_info;
    }
  }

  ngOnInit(): void {}
}
