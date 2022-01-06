import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: AppComponent },
  { path: 'home', redirectTo: 'bd/dashboard', pathMatch: 'full' },
  { path: 'login', redirectTo: '', pathMatch: 'full' },
  {
    path: 'bd',
    loadChildren: () =>
      import('./bd-dashboard/bd-dashboard.module').then(
        (m) => m.BdDashboardModule
      ),
  },
  {
    path: 'add',
    loadChildren: () =>
      import('./add-farmer/add-farmer.module').then((m) => m.AddFarmerModule),
  },
  {
    path: 'edit',
    loadChildren: () =>
      import('./edit-farmer/edit-farmer.module').then(
        (m) => m.EditFarmerModule
      ),
  },
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
