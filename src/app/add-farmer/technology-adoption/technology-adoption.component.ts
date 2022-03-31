import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'app-technology-adoption',
  templateUrl: './technology-adoption.component.html',
  styleUrls: ['./technology-adoption.component.css'],
})
export class TechnologyAdoptionComponent implements OnInit {
  /* START: Varaibles ---------------------------------------------*/
  private observableSubscription: any;
  technologyAdoptionForm = new FormGroup({});
  technologyAdoptionMaster = <any>{};
  nextRoute: any;
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle =
    SaveStatus.Idle;

  farmerId = ''; // edit feature
  /* END: Varaibles ---------------------------------------------*/

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.technologyAdoptionMaster = data.technologyAdoption; // read master data

    this.technologyAdoptionForm = this.formBuilder.group({
      farmYieldImprovisation: new FormControl('', [Validators.required]),
      payForTechnology: new FormControl('', [Validators.required]),
      payForTechnologyComment: new FormControl('', [Validators.required]),
      tissueCulture: new FormControl(),
    });

    // add dynamic form controls
    this.technologyAdoptionMaster['technologyOpinions'].forEach((x: any) => {
      this.technologyAdoptionForm.addControl(
        x.formCntrlName,
        new FormControl('')
      );
    });

    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }

  /* START: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */
  ngOnInit(): void {
    // -----------------------start auto save --------------------
    // draft feature is not required in edit operation
    if (!this.farmerId) {
      this.technologyAdoptionForm.valueChanges
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
          draft_farmer_new['technology_adoption'] = form_values;
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
      let editForm: any = localStorage.getItem('edit-technology-adoption');
      if (editForm) {
        editForm = JSON.parse(editForm);
        this.technologyAdoptionForm.patchValue(editForm);
      } else {
        const A: any = localStorage.getItem('farmer-details');
        if (A) {
          const B = JSON.parse(A).technology_adoption;
          this.technologyAdoptionForm.patchValue(B);
        }
      }
    } else {
      let techAdopt: any = localStorage.getItem('technology-adoption');
      if (techAdopt) {
        techAdopt = JSON.parse(techAdopt);
        this.technologyAdoptionForm.patchValue(techAdopt);
      }
    }

    //--------------------------EDIT--------
    this.farmerId = this.activatedRoute.snapshot.params['farmerId'] || '';
  }
  ngAfterViewInit(): void {
    /** subscribe to Observables, which are triggered from header selections*/
    this.observableSubscription = this.addFarmerService
      .getMessage()
      .subscribe((data) => {
        this.nextRoute = data.routeName;
        if (this.router.url?.includes('/add/technology-adoption')) {
          this.saveData();
          console.log(data.routeName);
        }
      });
  }

  ngOnDestroy(): void {
    /** unsubscribe from Observables*/
    this.observableSubscription.unsubscribe();
  }
  /* END: Angular LifeCycle/Built-In Function Calls--------------------------------------------- */

  /* START: NON-API Function Calls-------------------------------------------------------------- */
  saveData() {
    if (this.farmerId) {
      localStorage.setItem(
        'edit-technology-adoption',
        JSON.stringify(this.technologyAdoptionForm.value)
      );
    } else {
      localStorage.setItem(
        'technology-adoption',
        JSON.stringify(this.technologyAdoptionForm.value)
      );
    }
    const url = `/add/${this.nextRoute}/${this.farmerId}`;
    this.router.navigate([url]);
  }
  /* END: NON-API Function Calls-------------------------------------------------------------- */
}
