import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { data } from '../../shared/fob_master_data';
import { AddFarmerService } from '../add-farmer.service';

@Component({
  selector: 'app-technology-adoption',
  templateUrl: './technology-adoption.component.html',
  styleUrls: ['./technology-adoption.component.css'],
})
export class TechnologyAdoptionComponent implements OnInit {
  /* START: Variable */
  technologyAdoptionForm = new FormGroup({});
  technologyAdoptionMaster = <any>{};
  nextRoute: any;
  /* END: Variable */

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.technologyAdoptionForm = this.formBuilder.group({
      farmYieldImprovisation: new FormControl('', [Validators.required]),
      farmCaseStudies: new FormControl('', [Validators.required]),
      payForTechnology: new FormControl('', [Validators.required]),
      payForTechnologyComment: new FormControl('', [Validators.required]),
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }
  ngOnInit(): void {
    this.technologyAdoptionMaster = data.technologyAdoption; // read master data
    let techAdopt: any = localStorage.getItem('technology-adoption');
    if (techAdopt) {
      techAdopt = JSON.parse(techAdopt);
      this.technologyAdoptionForm.patchValue(techAdopt);
      console.log(techAdopt);
    }
  }

  saveData() {
    const url = `/add/${this.nextRoute}`;
    console.log(url);
    localStorage.setItem(
      'technology-adoption',
      JSON.stringify(this.technologyAdoptionForm.value)
    );
    this.router.navigate([url]);
  }
}
