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
  selector: 'app-technology-adoption',
  templateUrl: './technology-adoption.component.html',
  styleUrls: ['./technology-adoption.component.css'],
})
export class TechnologyAdoptionComponent implements OnInit {
  /* START: Variable */
  technologyAdoptionForm = new FormGroup({});
  technologyAdoptionMaster = <any>{};
  nextRoute: any;
  saveStatus: SaveStatus.Saving | SaveStatus.Saved | SaveStatus.Idle = SaveStatus.Idle;
  /* END: Variable */

  constructor(
    private formBuilder: FormBuilder,
    private addFarmerService: AddFarmerService,
    public router: Router
  ) {
    this.technologyAdoptionMaster = data.technologyAdoption; // read master data

    this.technologyAdoptionForm = this.formBuilder.group({
      farmYieldImprovisation: new FormControl('', [Validators.required]),
      farmCaseStudies: new FormControl('', [Validators.required]),
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

    this.addFarmerService.getMessage().subscribe((data) => {
      this.nextRoute = data.routeName;
      this.saveData();
    });
  }

  ngOnInit(): void {
    // -----------------------start auto save --------------------
    this.technologyAdoptionForm.valueChanges
    .pipe(
      tap(() => {
        this.saveStatus = SaveStatus.Saving;
      })
    )
    .subscribe(async (form_values) => {
      let draft_farmer_new = {} as any;
      if(localStorage.getItem('draft_farmer_new')){
        draft_farmer_new = JSON.parse(localStorage.getItem('draft_farmer_new') as any);    
      }
      draft_farmer_new['technology_adoption'] = form_values;
      localStorage.setItem('draft_farmer_new', JSON.stringify(draft_farmer_new));
      this.saveStatus = SaveStatus.Saved;
      if (this.saveStatus === SaveStatus.Saved) {
        this.saveStatus = SaveStatus.Idle;
      }
    });
    // -----------------------End auto save --------------------    
    let techAdopt: any = localStorage.getItem('technology-adoption');
    if (techAdopt) {
      techAdopt = JSON.parse(techAdopt);
      this.technologyAdoptionForm.patchValue(techAdopt);
    }
  }

  saveData() {
    const url = `/add/${this.nextRoute}`;
    console.log(url);
    localStorage.setItem(
      'technology-adoption',
      JSON.stringify(this.technologyAdoptionForm.value)
    );
    this.router.navigate([url]);
  }
}
