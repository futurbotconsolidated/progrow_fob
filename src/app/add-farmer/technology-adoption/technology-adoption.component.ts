import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms';

import { technologyAdoptionBoolean } from '../../shared/modal/global-field-values';

@Component({
  selector: 'app-technology-adoption',
  templateUrl: './technology-adoption.component.html',
  styleUrls: ['./technology-adoption.component.css'],
})
export class TechnologyAdoptionComponent implements OnInit {
  technologyAdoptionForm = new FormGroup({});
  technologyAdoptionBooleanList = <any>[];

  constructor(private formBuilder: FormBuilder) {
    this.technologyAdoptionForm = this.formBuilder.group({
      farmYieldImprovisation: new FormControl('yes', [Validators.required]),
      farmCaseStudies: new FormControl('yes', [Validators.required]),
      payForTechnology: new FormControl('yes', [Validators.required]),
      payForTechnologyComment: new FormControl('', [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.technologyAdoptionBooleanList = technologyAdoptionBoolean;
  }
}
