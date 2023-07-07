import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnInit
} from '@angular/core';
import { IdentityVerificationWithDetailsBankModel } from '@cybrid/cybrid-api-bank-angular';

@Component({
  selector: 'app-identity-content',
  templateUrl: './identity-content.component.html',
  styleUrls: ['../identity-verification.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdentityContentComponent implements OnInit {
  @Input() identity!: IdentityVerificationWithDetailsBankModel;

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    if (this.identity) {
      this.changeDetectorRef.detectChanges();
    }
  }
}
