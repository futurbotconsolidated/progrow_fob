import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionaryComponent } from './questionary/questionary.component';
import { AddFarmerRoutingModule } from './add-farmer-routing.module';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ConceptCardsComponent } from './concept-cards/concept-cards.component';
import { DemographicInfoComponent } from './demographic-info/demographic-info.component';
import { FieldInfoComponent } from './field-info/field-info.component';
import { FinancialPlanningComponent } from './financial-planning/financial-planning.component';
import { CropMarketPlanComponent } from './crop-market-plan/crop-market-plan.component';
import { ProduceAggregatorComponent } from './produce-aggregator/produce-aggregator.component';
import { TechnologyAdoptionComponent } from './technology-adoption/technology-adoption.component';
import { CoApplicantComponent } from './co-applicant/co-applicant.component';
import { InfoDeclarationComponent } from './info-declaration/info-declaration.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
@NgModule({
  declarations: [
    QuestionaryComponent,
    HeaderComponent,
    SidenavComponent,
    ConceptCardsComponent,
    DemographicInfoComponent,
    FieldInfoComponent,
    FinancialPlanningComponent,
    CropMarketPlanComponent,
    ProduceAggregatorComponent,
    TechnologyAdoptionComponent,
    CoApplicantComponent,
    InfoDeclarationComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    AddFarmerRoutingModule,
    ReactiveFormsModule,
    FormsModule,
  ],
})
export class AddFarmerModule {}
