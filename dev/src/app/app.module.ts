import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

import { LibraryModule } from '../../../library/src/app/modules/library.module';
import { SharedModule } from '../../../library/src/shared/modules/shared.module';
import { ConfigService, ErrorService, AuthService } from './services';
import { CustomerTokensService } from '@cybrid/cybrid-api-id-angular';

import { AppComponent } from './app.component';
import { DemoComponent, LoginComponent } from './components';

@NgModule({
  declarations: [AppComponent, DemoComponent, LoginComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LibraryModule,
    SharedModule
  ],
  providers: [ConfigService, ErrorService, AuthService, CustomerTokensService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
