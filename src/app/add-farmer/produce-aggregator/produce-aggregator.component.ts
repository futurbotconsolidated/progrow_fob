import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

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

  farmerId = ''; // edit feature
  /* END: Variables */

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router,
    private activatedRoute: ActivatedRoute
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

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }
  ngOnInit(): void {
    this.produceAggregatorMaster = data.produceAggregator; // read master data
    // -----------------------start auto save --------------------
    // draft feature is not required in edit operation
    if (!this.farmerId) {
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
    }
    // -----------------------End auto save --------------------
    // if case is for EDIT and else case is for NEW/DRAFT
    if (this.farmerId) {
      let editForm: any = localStorage.getItem('edit-produce-aggregator');
      if (editForm) {
        editForm = JSON.parse(editForm);
        this.produceAggregatorForm.patchValue(editForm);
      } else {
        const A: any = localStorage.getItem('farmer-details');
        if (A) {
          const B = JSON.parse(A).produce_aggregator;
          this.produceAggregatorForm.patchValue(B);
        }
      }
    } else {
      let prodAggregator: any = localStorage.getItem('produce-aggregator');
      if (prodAggregator) {
        prodAggregator = JSON.parse(prodAggregator);
        this.produceAggregatorForm.patchValue(prodAggregator);
      }
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
    if (this.farmerId) {
      localStorage.setItem(
        'edit-produce-aggregator',
        JSON.stringify(this.produceAggregatorForm.value)
      );
    } else {
      localStorage.setItem(
        'produce-aggregator',
        JSON.stringify(this.produceAggregatorForm.value)
      );
    }
    const url = `/add/${this.nextRoute}/${this.farmerId}`;
    this.router.navigate([url]);
  }
}
