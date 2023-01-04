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

import { ComponentGuard } from '@guards';

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
        component: PriceListComponent,
        canActivate: [ComponentGuard]
      },
      {
        path: 'trade',
        component: TradeComponent,
        canActivate: [ComponentGuard]
      },
      {
        path: 'account-list',
        component: AccountListComponent,
        canActivate: [ComponentGuard]
      },
      {
        path: 'account-details',
        component: AccountDetailsComponent,
        canActivate: [ComponentGuard]
      },
      {
        path: 'identity-verification',
        component: IdentityVerificationComponent,
        canActivate: [ComponentGuard]
      },
      {
        path: 'bank-account-connect',
        component: BankAccountConnectComponent,
        canActivate: [ComponentGuard]
      },
      {
        path: 'transfer',
        component: TransferComponent,
        canActivate: [ComponentGuard]
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
  exports: [RouterTestingModule],
  providers: [ComponentGuard]
})
export class RoutingModule {}
