import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

// Custom Modules
import { LibraryModule } from '../../../library/src/app/modules/library.module';

// Services
import { TokenService } from '../services/token/token.service';

// Components
import { DemoComponent } from '../components/demo/demo.component';
import { AppComponent } from '../components/app/app.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    LibraryModule
  ],
  declarations: [AppComponent, DemoComponent],
  providers: [TokenService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule {}
