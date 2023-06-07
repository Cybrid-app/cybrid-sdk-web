import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';

import { Subject, takeUntil, tap } from 'rxjs';

import { Constants } from '@constants';
import { environment } from '../../../../../environments/environment';

import { AuthService } from '../../../../services/auth/auth.service';
import { ConfigService } from '../../../../services/config/config.service';
import { DemoViewerService } from '../../services/demo-viewer.service';

import { BankBankModel } from '@cybrid/cybrid-api-bank-angular';

@Component({
  selector: 'app-sdk',
  templateUrl: './demo-viewer.component.html',
  styleUrls: ['./demo-viewer.component.scss']
})
export class DemoViewerComponent implements OnInit {
  languageList = Constants.SUPPORTED_LOCALES;
  componentList = Constants.COMPONENTS_PLAID;

  languageGroup: FormGroup = new FormGroup({
    language: new FormControl(Constants.DEFAULT_CONFIG.locale)
  });
  componentGroup: FormGroup = new FormGroup({
    component: new FormControl(this.activatedRoute.snapshot)
  });

  message = '';
  config = Constants.DEFAULT_CONFIG;

  unsubscribe$ = new Subject();
  constructor(
    private demoViewerService: DemoViewerService,
    private activatedRoute: ActivatedRoute,
    private configService: ConfigService,
    private authService: AuthService,
    private location: Location,
    private router: Router
  ) {
    this.configService.config$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((config) => (this.config = config));
  }

  ngOnInit() {
    this.initComponentGroup();
    this.initLanguageGroup();
  }

  isBackstopped(): boolean {
    return this.config.features.includes(
      BankBankModel.FeaturesEnum.BackstoppedFundingSource
    );
  }

  getTooltip(component: string): string {
    if (component == 'account-details')
      return 'Disabled: Navigate via account-list';
    else if (
      this.authService.customer == environment.credentials.publicCustomerGuid &&
      component == 'identity-verification'
    )
      return 'Disabled: Sign in as a private user to access';
    else {
      if (this.isBackstopped() && this.isDisabled(component)) {
        return 'Component is unavailable to backstopped banks';
      } else return '';
    }
  }

  isDisabled(component: string): boolean {
    if (component == 'account-details') return true;
    else if (
      this.authService.customer == environment.credentials.publicCustomerGuid &&
      component == 'identity-verification'
    )
      return true;
    else {
      if (this.isBackstopped()) {
        return !Constants.COMPONENTS_BACKSTOPPED.includes(component);
      } else return false;
    }
  }

  initComponentGroup() {
    this.componentGroup
      .get('component')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        tap((component) => this.router.navigate([`demo/${component}`]))
      )
      .subscribe();

    this.demoViewerService.route$
      .pipe(
        tap((component) =>
          this.componentGroup.get('component')?.patchValue(component, {
            emitEvent: false,
            onlySelf: true
          })
        )
      )
      .subscribe();
  }

  initLanguageGroup() {
    this.languageGroup
      .get('language')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        tap((locale) =>
          this.configService.setConfig({ ...this.config, locale })
        )
      )
      .subscribe();
  }
}
