import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AddFarmerService } from '../add-farmer.service';

@Component({
  selector: 'app-co-applicant',
  templateUrl: './co-applicant.component.html',
  styleUrls: ['./co-applicant.component.css'],
})
export class CoApplicantComponent implements OnInit {
  coApplicantForm = new FormGroup({});
  nextRoute: any;

  constructor(
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }

  ngOnInit(): void {}

  saveData() {
    let url = `/add/${this.nextRoute}`;
    console.log(url);
    localStorage.setItem(
      'co-applicant',
      JSON.stringify(this.coApplicantForm.value)
    );
    this.router.navigate([url]);
  }
}
