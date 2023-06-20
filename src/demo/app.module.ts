import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  CommonModule,
  HashLocationStrategy,
  LocationStrategy
} from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Modules
import { HttpLoaderFactory } from '../../library/src/app/modules/library.module';
import { AppRoutingModule } from './app.routing.module';
import { SharedModule } from '../../library/src/shared/modules/shared.module';

// Services
import { ConfigService } from './services/config/config.service';
import { AuthService } from './services/auth/auth.service';
import { CustomerTokensService } from '@cybrid/cybrid-api-id-angular';

// Components
import { AppComponent } from './app.component';
import { LoginComponent } from './components';

import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe
} from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    SharedModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  declarations: [AppComponent, LoginComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    { provide: Window, useValue: window },
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    CustomerTokensService,
    TranslatePipe,
    ConfigService,
    AuthService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
