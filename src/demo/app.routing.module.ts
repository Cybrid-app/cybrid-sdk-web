import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { authGuard } from './guards';
import { LoginComponent } from './components';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'demo',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./modules/demo-viewer/demo-viewer.module').then(
        (m) => m.DemoViewerModule
      )
  },
  {
    path: '',
    redirectTo: 'demo',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'demo',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
