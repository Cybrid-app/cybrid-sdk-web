import {
  Injector,
  NgModule,
  DoBootstrap,
  CUSTOM_ELEMENTS_SCHEMA,
  ErrorHandler
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import {
  HTTP_INTERCEPTORS,
  HttpClientModule,
  HttpClient
} from '@angular/common/http';
import { createCustomElement } from '@angular/elements';

// Modules
import { ApiModule, Configuration } from '@cybrid/cybrid-api-bank-angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../src/shared/modules/material-module';

// Services
import { AuthService } from '../../../../src/shared/services/auth/auth.service';
import { EventService } from '../../../../src/shared/services/event/event.service';
import { ErrorService } from '../../../../src/shared/services/error/error.service';
import { ConfigService } from '../../../../src/shared/services/config/config.service';
import { AssetService } from '../../../../src/shared/services/asset/asset.service';
import { ErrorInterceptor } from '../../../../src/shared/interceptors/error/error.interceptor';
import { RetryInterceptor } from '../../../../src/shared/interceptors/auth/retry.interceptor';

// Components
import { PriceListComponent } from '../components/price-list/price-list.component';

// Utility
import { environment } from '../../environments/environment';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { AssetPipe } from '../../../../src/shared/pipes/asset.pipe';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [PriceListComponent, AssetPipe],
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
    MaterialModule
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
    EventService,
    AssetService,
    { provide: HTTP_INTERCEPTORS, useClass: RetryInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    { provide: ErrorHandler, useClass: ErrorService }
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LibraryModule implements DoBootstrap {
  constructor(private injector: Injector) {}

  ngDoBootstrap() {
    const PriceListElement = createCustomElement(PriceListComponent, {
      injector: this.injector
    });
    customElements.define('cybrid-price-list', PriceListElement);
  }
}
