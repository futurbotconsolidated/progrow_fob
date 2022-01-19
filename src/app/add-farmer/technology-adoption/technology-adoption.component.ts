import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';
import { Router } from '@angular/router';

import { technologyAdoptionBoolean } from '../../shared/modal/global-field-values';
import { AddFarmerService } from '../add-farmer.service';

@Component({
  selector: 'app-technology-adoption',
  templateUrl: './technology-adoption.component.html',
  styleUrls: ['./technology-adoption.component.css'],
})
export class TechnologyAdoptionComponent implements OnInit {
  technologyAdoptionForm = new FormGroup({});
  technologyAdoptionBooleanList = <any>[];
  nextRoute: any;

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.technologyAdoptionForm = this.formBuilder.group({
      farmYieldImprovisation: new FormControl('yes', [Validators.required]),
      farmCaseStudies: new FormControl('yes', [Validators.required]),
      payForTechnology: new FormControl('yes', [Validators.required]),
      payForTechnologyComment: new FormControl('', [Validators.required]),
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }
  ngOnInit(): void {
    this.technologyAdoptionBooleanList = technologyAdoptionBoolean;
  }

  saveData() {
    let url = `/add/${this.nextRoute}`;
    console.log(url);
    localStorage.setItem(
      'technology-adoption',
      JSON.stringify(this.technologyAdoptionForm.value)
    );
    this.router.navigate([url]);
  }
}
