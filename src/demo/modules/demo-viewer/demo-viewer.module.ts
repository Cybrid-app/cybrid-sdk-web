import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoViewerRoutingModule } from './demo-viewer.routing.module';

import { DemoDetailsComponent, DemoViewerComponent } from './components';
import { ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '@modules';
import { DemoViewerService } from './services/demo-viewer.service';

@NgModule({
  declarations: [DemoViewerComponent, DemoDetailsComponent],
  imports: [
    CommonModule,
    DemoViewerRoutingModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  providers: [DemoViewerService]
})
export class DemoViewerModule {}
