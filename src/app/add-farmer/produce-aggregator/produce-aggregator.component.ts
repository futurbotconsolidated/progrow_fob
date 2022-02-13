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
  selector: 'app-produce-aggregator',
  templateUrl: './produce-aggregator.component.html',
  styleUrls: ['./produce-aggregator.component.css'],
})
export class ProduceAggregatorComponent implements OnInit {
  /* START: Variable */
  produceAggregatorForm = new FormGroup({});
  produceAggregatorMaster = <any>[];
  nextRoute: any;
  /* END: Variable */

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.produceAggregatorForm = this.formBuilder.group({
      verticals: [Array()],
      associatedWithFPO: [Array()],
      enrolFPO: new FormControl('one', [Validators.required]),
      followSuggestions: new FormControl('yes', [Validators.required]),
      consolidateLoans: new FormControl('yes1', [Validators.required]),
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }
  ngOnInit(): void {
    this.produceAggregatorMaster = data.produceAggregator; // read master data

    let prodAggregator: any = localStorage.getItem('produce-aggregator');
    if (prodAggregator) {
      prodAggregator = JSON.parse(prodAggregator);
      this.produceAggregatorForm.patchValue(prodAggregator);
      console.log(prodAggregator);
    }
  }

  selectCultivationAdvice(event: any, formCtlName: any, formVal: any) {
    formVal = String(formVal);
    let aryValCurr = this.produceAggregatorForm.controls[formCtlName].value;
    let aryValNew: any = [];
    if (Array.isArray(aryValCurr)) {
      aryValNew = [...aryValCurr];
    } else if (aryValCurr) {
      aryValNew = String(aryValCurr).split(',');
    }
    if (aryValNew.includes(formVal) && !event.target.checked) {
      aryValNew.splice(aryValNew.indexOf(formVal), 1);
    } else {
      aryValNew.push(formVal);
    }
    // update the form value
    // @ts-ignore: Object is possibly 'null'.
    this.produceAggregatorForm.get(formCtlName).setValue(aryValNew);
    if (this.produceAggregatorForm.controls[formCtlName].pristine) {
      // @ts-ignore: Object is possibly 'null'.
      this.produceAggregatorForm.get(formCtlName).markAsDirty();
    }
  }

  saveData() {
    const url = `/add/${this.nextRoute}`;
    console.log(url);
    localStorage.setItem(
      'produce-aggregator',
      JSON.stringify(this.produceAggregatorForm.value)
    );
    this.router.navigate([url]);
  }
}
