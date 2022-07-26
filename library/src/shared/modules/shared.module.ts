import { NgModule } from '@angular/core';
import { MaterialModule } from './material-module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [MaterialModule, ReactiveFormsModule],
  exports: [MaterialModule, ReactiveFormsModule],
  providers: [],
  schemas: []
})
export class SharedModule {}
