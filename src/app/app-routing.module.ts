import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ThreeSceneComponent } from './threescene/threescene.component';
import { LandingComponent } from './landing/landing.component';
import { EmergencyComponent } from './emergency.component';

const routes: Routes = [
  {
    path: '',
    component: LandingComponent
  },
  {
    path: 'final-report',
    component: EmergencyComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
