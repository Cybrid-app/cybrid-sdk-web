import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// Modules
import { LibraryModule } from '../../../../library/src/app/modules/library.module';
import { SharedModule } from '../../../../library/src/shared/modules/shared.module';

// Services
import { ConfigService } from '../../services/config/config.service';
import { ErrorService } from '../../services/error/error.service';
import { AuthService } from '../../services/auth/auth.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';
import { CustomerTokensService } from '@cybrid/cybrid-api-id-angular';

// Components
import { AppComponent } from '../../components/app/app.component';
import { DemoComponent } from '../../components/demo/demo.component';
import { LoginComponent } from '../../components/login/login.component';

@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LibraryModule,
    SharedModule
  ],
  declarations: [AppComponent, DemoComponent, LoginComponent],
  providers: [
    ConfigService,
    ErrorService,
    AuthService,
    LocalStorageService,
    CustomerTokensService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
