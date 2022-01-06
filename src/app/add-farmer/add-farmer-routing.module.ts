import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { QuestionaryComponent } from './questionary/questionary.component';
import { ConceptCardsComponent } from './concept-cards/concept-cards.component';
import { InfoDeclarationComponent } from './info-declaration/info-declaration.component';
import { TechnologyAdoptionComponent } from './technology-adoption/technology-adoption.component';
import { ProduceAggregatorComponent } from './produce-aggregator/produce-aggregator.component';
import { CropMarketPlanComponent } from './crop-market-plan/crop-market-plan.component';
import { FinancialPlanningComponent } from './financial-planning/financial-planning.component';
import { FieldInfoComponent } from './field-info/field-info.component';
import { DemographicInfoComponent } from './demographic-info/demographic-info.component';
import { CoApplicantComponent } from './co-applicant/co-applicant.component';

const routes: Routes = [
  {
    path: 'questionary',
    component: QuestionaryComponent,
  },
  {
    path: 'concept-cards',
    component: ConceptCardsComponent,
  },
  {
    path: 'demographic-info',
    component: DemographicInfoComponent,
  },
  {
    path: 'field-info',
    component: FieldInfoComponent,
  },
  {
    path: 'financial-planning',
    component: FinancialPlanningComponent,
  },
  {
    path: 'crop-market-plan',
    component: CropMarketPlanComponent,
  },
  {
    path: 'produce-aggregator',
    component: ProduceAggregatorComponent,
  },
  {
    path: 'technology-adoption',
    component: TechnologyAdoptionComponent,
  },
  {
    path: 'co-applicant',
    component: CoApplicantComponent,
  },
  {
    path: 'info-declaration',
    component: InfoDeclarationComponent,
  },
];

@NgModule({
  declarations: [],
  exports: [RouterModule],
  imports: [CommonModule, RouterModule.forChild(routes)],
})
export class AddFarmerRoutingModule {}