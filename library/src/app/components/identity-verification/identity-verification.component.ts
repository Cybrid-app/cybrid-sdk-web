import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject, map, Subject, take } from 'rxjs';

// Services
import { IdentityVerificationService } from '@services';
import { Customer } from '../../../shared/services/identity-verification/customer.model';

// Data
import IDENTITY from '../../../shared/services/identity-verification/identity.data.json';
import CUSTOMER from '../../../shared/services/identity-verification/customer.data.json';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit {
  customerDataResponseList = Object.keys(CUSTOMER);
  identityDataResponseList = Object.keys(IDENTITY);

  identityDataResponceForm!: FormGroup;

  message$ = new Subject();
  polling$ = new BehaviorSubject(false);

  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private identityVerificationService: IdentityVerificationService
  ) {}

  ngOnInit(): void {
    this.initializeDataForms();
  }

  startFlow(): void {
    this.identityVerificationService
      .getIdentityVerification(this.identityDataResponceForm.value)
      .pipe(
        map((res) => {
          'persona_inquiry_id' in res
            ? this.bootstrapPersona(res.persona_inquiry_id!)
            : this.handleCustomer(res as Customer);
        })
      )
      .subscribe();
  }

  initializeDataForms(): void {
    this.identityDataResponceForm = new FormGroup({
      customerData: new FormControl(this.customerDataResponseList[0], {
        nonNullable: true
      }),
      identityData: new FormControl(this.identityDataResponseList[0], {
        nonNullable: true
      })
    });
  }

  handleCustomer(customer: Customer): void {
    this.message$.next(customer);
  }

  bootstrapPersona(templateId: string): void {
    this.message$.next('Lanuching Persona...');
    let script = this._renderer2.createElement('script');
    script.type = `text/javascript`;
    script.text = 'text';
    script.src = 'https://cdn.withpersona.com/dist/persona-v4.6.0.js';

    this._renderer2.appendChild(this._document.body, script);
    script.addEventListener('load', () => {
      // @ts-ignore
      const client = new Persona.Client({
        templateId: templateId,
        environment: 'sandbox',
        onReady: () => client.open(),
        // @ts-ignore
        onComplete: ({ inquiryId, status, fields }) => {
          console.log(
            'onComplete',
            'inquiryId: ' + inquiryId,
            'status: ' + status,
            fields
          );
        },
        // @ts-ignore
        onCancel: ({ inquiryId, sessionToken }) => {
          this.message$.next({
            inquiryId: inquiryId,
            sessionToken: sessionToken
          });
        },
        onError: (error: any) => console.log(error)
      });
    });
  }
}
