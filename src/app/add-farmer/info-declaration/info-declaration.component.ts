import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-info-declaration',
  templateUrl: './info-declaration.component.html',
  styleUrls: ['./info-declaration.component.css'],
})
export class InfoDeclarationComponent implements OnInit {
  declarationForm = new FormGroup({});

  constructor() {}

  ngOnInit(): void {}
}
