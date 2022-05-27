import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialModule } from './material-module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [MaterialModule, ReactiveFormsModule, FlexLayoutModule],
  exports: [MaterialModule, ReactiveFormsModule, FlexLayoutModule],
  providers: [],
  schemas: []
})
export class SharedModule {}
