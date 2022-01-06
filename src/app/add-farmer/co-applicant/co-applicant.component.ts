import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-co-applicant',
  templateUrl: './co-applicant.component.html',
  styleUrls: ['./co-applicant.component.css'],
})
export class CoApplicantComponent implements OnInit {
  coApplicantForm = new FormGroup({});

  constructor() {}

  ngOnInit(): void {}
}
