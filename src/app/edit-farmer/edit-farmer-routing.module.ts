import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { EditFarmerComponent } from './edit-farmer/edit-farmer.component';
import { SummaryComponent } from './summary/summary.component';
import { EditDemographicInfoComponent } from './edit-demographic-info/edit-demographic-info.component';
import { EditFieldInfoComponent } from './edit-field-info/edit-field-info.component';
import { EditFinancialPlanningComponent } from './edit-financial-planning/edit-financial-planning.component';
import { EditCropMarketPlanComponent } from './edit-crop-market-plan/edit-crop-market-plan.component';
import { EditFpoComponent } from './edit-fpo/edit-fpo.component';
import { EditTechAdoptionComponent } from './edit-tech-adoption/edit-tech-adoption.component';
import { EditCoApplicantComponent } from './edit-co-applicant/edit-co-applicant.component';
import { EditDeclarationComponent } from './edit-declaration/edit-declaration.component';

const routes: Routes = [
  {
    path: 'summary/:farmerid',
    component: SummaryComponent,
  },
  {
    path: 'demographic-info/:farmerid',
    component: EditDemographicInfoComponent,
  },
  {
    path: 'field-info/:farmerid',
    component: EditFieldInfoComponent,
  },
  {
    path: 'financial-plan/:farmerid',
    component: EditFinancialPlanningComponent,
  },
  {
    path: 'crop-market-plan/:farmerid',
    component: EditCropMarketPlanComponent,
  },
  {
    path: 'fop/:farmerid',
    component: EditFpoComponent,
  },
  {
    path: 'tech-adoption/:farmerid',
    component: EditTechAdoptionComponent,
  },
  {
    path: 'co-applicant/:farmerid',
    component: EditCoApplicantComponent,
  },
  {
    path: 'declaration/:farmerid',
    component: EditDeclarationComponent,
  },
];

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class EditFarmerRoutingModule {}
