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
import { ApiModule, Configuration } from '@cybrid/cybrid-api-bank-angular';
import {
  TranslateModule,
  TranslateLoader,
  TranslatePipe
} from '@ngx-translate/core';

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
  BankAccountService
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
  TradeBalanceComponent,
  AccountListComponent,
  AccountDetailsComponent,
  NavigationComponent,
  IdentityVerificationComponent,
  IdentityContentComponent,
  CustomerContentComponent,
  CybridLogoComponent,
  BankAccountConnectComponent,
  TransferComponent,
  TransferConfirmComponent,
  TransferDetailsComponent
} from '@components';

// Utility
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  AssetPipe,
  AssetIconPipe,
  TruncatePipe,
  AssetFormatPipe
} from '@pipes';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CustomPaginatorIntl } from '@utility';
import { TestAccountsService } from '../../shared/services/test-accounts/test-accounts.service';
import { TestTradeComponent } from '../components/test-trade/test-trade/test-trade.component';
import { TestPricesService } from '../../shared/test-prices/test-prices.service';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    PriceListComponent,
    TradeComponent,
    TestTradeComponent,
    TradeConfirmComponent,
    TradeSummaryComponent,
    TradeBalanceComponent,
    AccountListComponent,
    AccountDetailsComponent,
    LoadingComponent,
    NavigationComponent,
    IdentityVerificationComponent,
    IdentityContentComponent,
    CustomerContentComponent,
    CybridLogoComponent,
    BankAccountConnectComponent,
    TransferComponent,
    TransferConfirmComponent,
    TransferDetailsComponent,
    AssetPipe,
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
    RoutingModule
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
    TestAccountsService,
    TestPricesService,
    AccountService,
    AssetPipe,
    AssetIconPipe,
    IdentityVerificationService,
    BankAccountService,
    AssetFormatPipe,
    TruncatePipe,
    TranslatePipe,
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
