import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditFarmerComponent } from './edit-farmer/edit-farmer.component';
import { EditHeaderComponent } from './edit-header/edit-header.component';
import { SummaryComponent } from './summary/summary.component';
import { EditFarmerRoutingModule } from './edit-farmer-routing.module';
import { EditDemographicInfoComponent } from './edit-demographic-info/edit-demographic-info.component';
import { EditFieldInfoComponent } from './edit-field-info/edit-field-info.component';
import { EditFinancialPlanningComponent } from './edit-financial-planning/edit-financial-planning.component';
import { EditCropMarketPlanComponent } from './edit-crop-market-plan/edit-crop-market-plan.component';
import { EditFpoComponent } from './edit-fpo/edit-fpo.component';
import { EditTechAdoptionComponent } from './edit-tech-adoption/edit-tech-adoption.component';
import { EditCoApplicantComponent } from './edit-co-applicant/edit-co-applicant.component';
import { EditDeclarationComponent } from './edit-declaration/edit-declaration.component';



@NgModule({
  declarations: [EditFarmerComponent, EditHeaderComponent, SummaryComponent, EditDemographicInfoComponent, EditFieldInfoComponent, EditFinancialPlanningComponent, EditCropMarketPlanComponent, EditFpoComponent, EditTechAdoptionComponent, EditCoApplicantComponent, EditDeclarationComponent],
  imports: [
    CommonModule,
    EditFarmerRoutingModule
  ]
})
export class EditFarmerModule { }
