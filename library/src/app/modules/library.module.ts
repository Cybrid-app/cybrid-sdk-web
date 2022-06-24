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

// Modules
import { ApiModule, Configuration } from '@cybrid/cybrid-api-bank-angular';
import {
  TranslateModule,
  TranslateLoader,
  TranslatePipe
} from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../src/shared/modules/material-module';

// Services
import { AuthService } from '../../../../src/shared/services/auth/auth.service';
import { EventService } from '../../../../src/shared/services/event/event.service';
import { ErrorService } from '../../../../src/shared/services/error/error.service';
import { ConfigService } from '../../../../src/shared/services/config/config.service';
import { QuoteService } from '../../../../src/shared/services/quote/quote.service';
import { AssetService } from '../../../../src/shared/services/asset/asset.service';
import { ErrorInterceptor } from '../../../../src/shared/interceptors/error/error.interceptor';
import { RetryInterceptor } from '../../../../src/shared/interceptors/auth/retry.interceptor';

// Components
import { AppComponent } from '../components/app/app.component';
import { PriceListComponent } from '../components/price-list/price-list.component';
import { TradeComponent } from '../components/trade/trade.component';
import { TradeConfirmComponent } from '../components/trade-confirm/trade-confirm.component';
import { TradeSummaryComponent } from '../components/trade-summary/trade-summary.component';

// Utility
import { environment } from '../../environments/environment';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AssetPipe } from '../../../../src/shared/pipes/asset/asset.pipe';
import { TruncatePipe } from '../../../../src/shared/pipes/truncate/tuncate.pipe';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    PriceListComponent,
    TradeComponent,
    TradeConfirmComponent,
    TradeSummaryComponent,
    AssetPipe,
    TruncatePipe
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
          basePath: environment.apiUrl,
          credentials: {
            BearerAuth: authService.getToken.bind(authService)
          }
        }),
      deps: [AuthService],
      multi: false
    },
    ConfigService,
    QuoteService,
    EventService,
    AssetService,
    AssetPipe,
    TruncatePipe,
    TranslatePipe,
    { provide: APP_BASE_HREF, useValue: '' },
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: ErrorHandler, useClass: ErrorService }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LibraryModule implements DoBootstrap {
  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const AppElement = createCustomElement(AppComponent, {
      injector: this.injector
    });
    customElements.define('cybrid-price-list', AppElement);
  }
}
