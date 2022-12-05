import { NgModule } from '@angular/core';
import { Routes } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import {
  PriceListComponent,
  TradeComponent,
  AccountListComponent,
  AccountDetailsComponent,
  IdentityVerificationComponent,
  BankAccountConnectComponent,
  TransferComponent
} from '@components';

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
      },
      {
        path: 'account-list',
        component: AccountListComponent
      },
      {
        path: 'account-details',
        component: AccountDetailsComponent
      },
      {
        path: 'identity-verification',
        component: IdentityVerificationComponent
      },
      {
        path: 'bank-account-connect',
        component: BankAccountConnectComponent
      },
      {
        path: 'transfer',
        component: TransferComponent
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
