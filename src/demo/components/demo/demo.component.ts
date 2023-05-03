import {
  Component,
  ComponentRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import {
  BehaviorSubject,
  catchError,
  filter,
  map,
  of,
  Subject,
  takeUntil
} from 'rxjs';

// Services
import { ConfigService } from '../../services/config/config.service';
import { AuthService } from '../../services/auth/auth.service';
import { LocalStorageService } from '../../services/local-storage/local-storage.service';

// Api
import { BankBankModel } from '@cybrid/cybrid-api-bank-angular';

// Library
import { Constants } from '@constants';
import { CODE, ComponentConfig, ErrorService, EventLog } from '@services';
import { AppComponent } from '@components';

// Utility
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnInit, OnDestroy {
  @ViewChild('viewContainer', { static: true, read: ViewContainerRef })
  public viewContainer!: ViewContainerRef;
  public componentRef!: ComponentRef<AppComponent>;

  config: ComponentConfig = this.configService.config$.getValue();
  component = Constants.DEFAULT_COMPONENT;
  auth = <string>this.localStorageService.get('customer');

  languages = ['en-US', 'fr-CA'];
  componentList = Constants.COMPONENTS_PLAID;

  componentGroup: FormGroup = new FormGroup({
    component: new FormControl(Constants.DEFAULT_COMPONENT)
  });

  languageGroup: FormGroup = new FormGroup({
    language: new FormControl(Constants.DEFAULT_CONFIG.locale)
  });

  message = '';

  isLoading$ = new BehaviorSubject(true);
  unsubscribe$ = new Subject();

  constructor(
    public configService: ConfigService,
    public authService: AuthService,
    private localStorageService: LocalStorageService,
    private errorService: ErrorService
  ) {}

  ngOnInit() {
    this.initDemo();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  isBackstopped(): boolean {
    return this.configService.config$
      .getValue()!
      .features.includes(BankBankModel.FeaturesEnum.BackstoppedFundingSource);
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
        map((component) => (this.componentRef.instance.component = component))
      )
      .subscribe();

    this.componentRef.instance.eventLog
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((event: EventLog) => event.code == CODE.ROUTING_END),
        map((event) => {
          this.componentGroup.get('component')?.patchValue(event.data.default, {
            emitEvent: false,
            onlySelf: true
          });
        })
      )
      .subscribe();
  }

  initLanguageGroup() {
    this.languageGroup
      .get('language')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        map((lang) => {
          let config = this.configService.config$.getValue();
          config.locale = lang;

          this.configService.setConfig(config);
        }),
        catchError((err) => {
          this.errorService.handleError(err);
          return of(err);
        })
      )
      .subscribe();
  }

  initDemo() {
    this.configService
      .getConfig()
      .pipe(
        map((config) => {
          this.componentRef = this.viewContainer.createComponent(AppComponent);

          this.componentRef.instance.config = config;
          this.componentRef.instance.auth = this.auth;
          this.componentRef.instance.component = this.component;
        }),
        map(() => {
          this.initComponentGroup();
          this.initLanguageGroup();
        }),
        catchError((err) => {
          this.errorService.handleError(err);
          this.authService.destroySession();
          return of(err);
        })
      )
      .subscribe(() => this.isLoading$.next(false));

    this.configService.config$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((config) => {
        this.componentRef.instance.config = config;
      });
  }
}
