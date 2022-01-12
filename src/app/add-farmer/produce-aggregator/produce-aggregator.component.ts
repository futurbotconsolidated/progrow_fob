import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import {
  verticals,
  associatedWithFPO,
  enrolFPO,
  followSuggestions,
  consolidateLoans,
} from '../../shared/modal/global-field-values';
@Component({
  selector: 'app-produce-aggregator',
  templateUrl: './produce-aggregator.component.html',
  styleUrls: ['./produce-aggregator.component.css'],
})
export class ProduceAggregatorComponent implements OnInit {
  produceAggregatorForm = new FormGroup({});
  verticalsList = <any>[];
  associatedWithFPOList = <any>[];
  enrolFPOList = <any>[];
  followSuggestionsList = <any>[];
  consolidateLoansList = <any>[];

  constructor(private formBuilder: FormBuilder) {
    this.produceAggregatorForm = this.formBuilder.group({
      verticals: [Array()],
      associatedWithFPO: [Array()],
      enrolFPO: new FormControl('one', [Validators.required]),
      followSuggestions: new FormControl('yes', [Validators.required]),
      consolidateLoans: new FormControl('yes1', [Validators.required]),
    });
  }
  ngOnInit(): void {
    this.verticalsList = verticals;
    this.associatedWithFPOList = associatedWithFPO;
    this.enrolFPOList = enrolFPO;
    this.followSuggestionsList = followSuggestions;
    this.consolidateLoansList = consolidateLoans;
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
}
