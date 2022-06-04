import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// Custom Modules
import { LibraryModule } from '../../../library/src/app/modules/library.module';
import { SharedModule } from '../../shared/modules/shared.module';

// Services
import { ConfigService } from '../services/config/config.service';

// Components
import { DemoComponent } from '../components/demo/demo.component';
import { AppComponent } from '../components/app/app.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LibraryModule,
    SharedModule
  ],
  declarations: [AppComponent, DemoComponent],
  providers: [ConfigService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
