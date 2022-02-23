import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import {
  FormGroup,
  FormControl,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { data } from '../../shared/fob_master_data';
import { AddFarmerService } from '../add-farmer.service';
enum SaveStatus {
  Saving = 'Saving...',
  Saved = 'Saved.',
  Idle = '',
}
@Component({
  selector: 'app-produce-aggregator',
  templateUrl: './produce-aggregator.component.html',
  styleUrls: ['./produce-aggregator.component.css'],
})
export class ProduceAggregatorComponent implements OnInit {
  /* START: Variables */
  produceAggregatorForm = new FormGroup({});
  produceAggregatorMaster = <any>{};
  nextRoute: any;
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle =
    SaveStatus.Idle;
  /* END: Variables */

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.produceAggregatorForm = this.formBuilder.group({
      verticals: [Array()],
      associatedWithFPO: [Array()],
      enrolFPO: new FormControl('', [Validators.required]),
      followSuggestions: new FormControl('', [Validators.required]),
      consolidateLoans: new FormControl('', [Validators.required]),
    });

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
      console.log(this.nextRoute);
    });
  }
  ngOnInit(): void {
    this.produceAggregatorMaster = data.produceAggregator; // read master data
    // -----------------------start auto save --------------------
    this.produceAggregatorForm.valueChanges
      .pipe(
        tap(() => {
          this.saveStatus = SaveStatus.Saving;
        })
      )
      .subscribe(async (form_values) => {
        let draft_farmer_new = {} as any;
        if (localStorage.getItem('draft_farmer_new')) {
          draft_farmer_new = JSON.parse(
            localStorage.getItem('draft_farmer_new') as any
          );
        }
        draft_farmer_new['produce_aggregator'] = form_values;
        localStorage.setItem(
          'draft_farmer_new',
          JSON.stringify(draft_farmer_new)
        );
        this.saveStatus = SaveStatus.Saved;
        if (this.saveStatus === SaveStatus.Saved) {
          this.saveStatus = SaveStatus.Idle;
        }
      });
    // -----------------------End auto save --------------------
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
