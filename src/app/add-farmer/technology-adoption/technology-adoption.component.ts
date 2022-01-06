import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-technology-adoption',
  templateUrl: './technology-adoption.component.html',
  styleUrls: ['./technology-adoption.component.css'],
})
export class TechnologyAdoptionComponent implements OnInit {
  technologyAdoptionForm = new FormGroup({});

  constructor() {}

  ngOnInit(): void {}
}
