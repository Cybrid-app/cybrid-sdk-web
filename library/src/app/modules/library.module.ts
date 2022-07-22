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
  RoutingService
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
  TradeSummaryComponent
} from '@components';

// Utility
import { environment } from '@environment';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AssetPipe, TruncatePipe } from '@pipes';

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
    LoadingComponent,
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
    RoutingService,
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
    customElements.define('cybrid-app', AppElement);
  }
}
