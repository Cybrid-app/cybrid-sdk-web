import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// Modules
import { LibraryModule } from '../../../library/src/app/modules/library.module';
import { SharedModule } from '../../../library/src/shared/modules/shared.module';

// Services
import { DemoConfigService } from '../services/demo-config/demo-config.service';
import { DemoErrorService } from '../services/demo-error/demo-error.service';

// Components
import { AppComponent } from '../components/app/app.component';
import { DemoComponent } from '../components/demo/demo.component';
import { LoginComponent } from '../components/login/login.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LibraryModule,
    SharedModule
  ],
  declarations: [AppComponent, DemoComponent, LoginComponent],
  providers: [DemoConfigService, DemoErrorService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class DemoModule {}
