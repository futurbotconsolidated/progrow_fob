import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { religion } from '../../shared/modal/global-field-values';
import { gender } from '../../shared/modal/global-field-values';

@Component({
  selector: 'app-demographic-info',
  templateUrl: './demographic-info.component.html',
  styleUrls: ['./demographic-info.component.css'],
})
export class DemographicInfoComponent implements OnInit {
  religionList = <any>[];
  genderList = <any>[];
  demographicInfoForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    PANnumber: new FormControl('', [Validators.required]),
    middleName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    dob: new FormControl('', [Validators.required]),
    gender: new FormControl('male', [Validators.required]),
    religion: new FormControl('hindu', [Validators.required]),
  });

  constructor() {}

  ngOnInit(): void {
    this.religionList = religion;
    this.genderList = gender;
    console.log(this.religionList);
  }
  onSubmit() {
    console.log(this.demographicInfoForm.value);
  }
}
