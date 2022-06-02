import { NgModule } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { PriceListComponent } from '../components/price-list/price-list.component';
import { TradeComponent } from '../components/trade/trade.component';

const routes = [
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
        path: 'buy',
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
