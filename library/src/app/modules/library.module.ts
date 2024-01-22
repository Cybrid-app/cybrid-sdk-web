import {
  Injector,
  NgModule,
  DoBootstrap,
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_BASE_HREF, CommonModule } from '@angular/common';
import { RoutingModule } from './routing.module';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpClient
} from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';

// Modules
import { MaterialModule } from '@modules';
import { ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorIntl } from '@angular/material/paginator';
import {
  TranslateModule,
  TranslateLoader,
  TranslatePipe
} from '@ngx-translate/core';
import { QRCodeModule } from 'angularx-qrcode';

import { ApiModule, Configuration } from '@cybrid/cybrid-api-bank-angular';

// Services
import {
  AuthService,
  EventService,
  ErrorService,
  ConfigService,
  QuoteService,
  AssetService,
  RoutingService,
  AccountService,
  IdentityVerificationService,
  BankAccountService,
  PriceService,
  DepositAddressService,
  ExternalWalletService
} from '@services';

// Interceptors
import { ErrorInterceptor, RetryInterceptor } from '@interceptors';

// Components
import {
  AppComponent,
  LoadingComponent,
  PriceListComponent,
  TradeComponent,
  TradeConfirmComponent,
  TradeSummaryComponent,
  AccountListComponent,
  TradingAccountDetailsComponent,
  FiatAccountDetailsComponent,
  AccountBalanceComponent,
  NavigationComponent,
  IdentityVerificationComponent,
  IdentityContentComponent,
  CustomerContentComponent,
  CybridLogoComponent,
  BankAccountConnectComponent,
  BankAccountConfirmComponent,
  TransferComponent,
  TransferConfirmComponent,
  TransferDetailsComponent,
  TransferSummaryComponent,
  BankAccountListComponent,
  BankAccountDisconnectComponent,
  BankAccountDetailsComponent,
  DepositAddressComponent,
  DepositAddressPaymentComponent,
  ExternalWalletListComponent
} from '@components';

// Utility
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AssetIconPipe, TruncatePipe, AssetFormatPipe } from '@pipes';
import { CustomPaginatorIntl } from '@utility';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    PriceListComponent,
    TradeComponent,
    TradeComponent,
    TradeConfirmComponent,
    TradeSummaryComponent,
    AccountBalanceComponent,
    AccountListComponent,
    TradingAccountDetailsComponent,
    FiatAccountDetailsComponent,
    LoadingComponent,
    NavigationComponent,
    IdentityVerificationComponent,
    IdentityContentComponent,
    CustomerContentComponent,
    CybridLogoComponent,
    BankAccountConnectComponent,
    BankAccountConfirmComponent,
    BankAccountListComponent,
    BankAccountDetailsComponent,
    BankAccountDisconnectComponent,
    TransferComponent,
    TransferConfirmComponent,
    TransferDetailsComponent,
    TransferSummaryComponent,
    DepositAddressComponent,
    DepositAddressPaymentComponent,
    ExternalWalletListComponent,
    AssetFormatPipe,
    TruncatePipe,
    AssetIconPipe,
    AssetFormatPipe
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    ApiModule,
    TranslateModule,
    ReactiveFormsModule,
    MaterialModule,
    RoutingModule,
    QRCodeModule
  ],
  providers: [
    {
      provide: Configuration,
      useFactory: (authService: AuthService) =>
        new Configuration({
          credentials: {
            BearerAuth: authService.getToken.bind(authService)
          }
        }),
      deps: [AuthService],
      multi: false
    },
    ConfigService,
    RoutingService,
    QuoteService,
    EventService,
    AssetService,
    PriceService,
    AccountService,
    DepositAddressService,
    ExternalWalletService,
    AssetIconPipe,
    IdentityVerificationService,
    BankAccountService,
    AssetFormatPipe,
    TruncatePipe,
    TranslatePipe,
    { provide: Window, useValue: window },
    { provide: APP_BASE_HREF, useValue: '' },
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: ErrorHandler, useClass: ErrorService },
    { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl },
    { provide: ErrorHandler, useClass: ErrorService },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: { hasBackdrop: true, disableClose: true, minWidth: '320px' }
    }
  ],
  exports: [LoadingComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LibraryModule implements DoBootstrap {
  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const AppElement = createCustomElement(AppComponent, {
      injector: this.injector
    });
    customElements.define('cybrid-app', AppElement);
  }
}
