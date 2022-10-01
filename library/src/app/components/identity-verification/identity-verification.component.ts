import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

// Services
import { IdentityVerificationService } from '@services';

@Component({
  selector: 'app-identity-verification',
  templateUrl: './identity-verification.component.html',
  styleUrls: ['./identity-verification.component.scss']
})
export class IdentityVerificationComponent implements OnInit {
  constructor(
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document,
    private identityVerificationService: IdentityVerificationService
  ) {}

  ngOnInit(): void {
    this.identityVerificationService.checkForKyc().subscribe((templateID) => {
      if (templateID) {
        this.bootstrapPersona(templateID);
      }
    });
  }

  bootstrapPersona(templateId: string): void {
    let script = this._renderer2.createElement('script');
    script.type = `text/javascript`;
    script.text = 'text';
    script.src = 'https://cdn.withpersona.com/dist/persona-v4.6.0.js';

    this._renderer2.appendChild(this._document.body, script);
    script.addEventListener('load', () => {
      afterload();
    });

    function afterload() {
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
        onCancel: ({ inquiryId, sessionToken }) =>
          console.log(
            'onCancel',
            'inquiryId: ' + inquiryId,
            'sessionToken: ' + sessionToken
          ),
        onError: (error: any) => console.log(error)
      });
    }
  }
}
