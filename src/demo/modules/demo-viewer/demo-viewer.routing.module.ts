import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DemoDetailsComponent, DemoViewerComponent } from './components';

export const routes: Routes = [
  {
    path: '',
    component: DemoViewerComponent,
    children: [
      {
        path: ':id',
        component: DemoDetailsComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemoViewerRoutingModule {}
