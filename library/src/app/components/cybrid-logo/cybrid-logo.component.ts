import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-cybrid-logo',
  templateUrl: './cybrid-logo.component.html'
})
export class CybridLogoComponent {
  // TODO When implementing global style variables map this to the 'primary' colour
  @Input() fill: string = '';
}
