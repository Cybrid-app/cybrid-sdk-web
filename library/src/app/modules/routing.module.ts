import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { PriceListComponent, TradeComponent } from '@components';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'app/price-list',
    pathMatch: 'full'
  },
  {
    path: 'app',
    redirectTo: 'app/price-list'
  },
  {
    path: 'app',
    children: [
      {
        path: 'price-list',
        component: PriceListComponent
      },
      {
        path: 'trade',
        component: TradeComponent
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'app/price-list'
  }
];

@NgModule({
  imports: [RouterTestingModule.withRoutes(routes)],
  exports: [RouterTestingModule]
})
export class RoutingModule {}
