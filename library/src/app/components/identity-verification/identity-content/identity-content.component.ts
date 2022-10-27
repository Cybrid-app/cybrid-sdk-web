import { Component, Input } from '@angular/core';
import { IdentityVerificationBankModel } from '@cybrid/cybrid-api-bank-angular';

@Component({
  selector: 'app-identity-content',
  templateUrl: './identity-content.component.html',
  styleUrls: ['../identity-verification.component.scss']
})
export class IdentityContentComponent {
  @Input() identity!: IdentityVerificationBankModel;
}
