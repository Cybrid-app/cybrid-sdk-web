import {
  Component,
  ComponentRef,
  OnDestroy,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { BehaviorSubject, filter, map, Subject, take, takeUntil } from 'rxjs';

import { DemoConfigService } from '../../services/demo-config/demo-config.service';

// Library
import { AppComponent } from '@components';
import { CODE, ConfigService, EventLog } from '@services';
import { Constants } from '@constants';

// Components
import { DemoCredentials } from '../login/login.component';
import { BankBankModel } from '@cybrid/cybrid-api-bank-angular';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
  styleUrls: ['./demo.component.scss']
})
export class DemoComponent implements OnDestroy {
  @ViewChild('viewContainer', { static: true, read: ViewContainerRef })
  public viewContainer!: ViewContainerRef;

  isPublic: boolean = false;

  componentList = Constants.COMPONENTS_PLAID;

  languages = ['en-US', 'fr-CA'];
  bank$ = new BehaviorSubject<BankBankModel | null>(null);

  componentRef!: ComponentRef<AppComponent>;
  componentGroup: FormGroup = new FormGroup({
    component: new FormControl(Constants.DEFAULT_COMPONENT)
  });

  languageGroup: FormGroup = new FormGroup({
    language: new FormControl(Constants.DEFAULT_CONFIG.locale)
  });

  login$ = new BehaviorSubject(false);
  isLoading$ = new BehaviorSubject(true);

  private unsubscribe$ = new Subject();

  constructor(
    public demoConfigService: DemoConfigService,
    private configService: ConfigService
  ) {}

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  initBank() {
    this.configService
      .getBank$()
      .pipe(
        take(1),
        map((bank) => {
          this.bank$.next(bank);
          this.isLoading$.next(false);
        })
      )
      .subscribe();
  }

  isBackstopped(): boolean {
    return this.bank$
      .getValue()!
      .features.includes(BankBankModel.FeaturesEnum.BackstoppedFundingSource);
  }

  getTooltip(component: string): string {
    if (component == 'account-details')
      return 'Disabled: Navigate via account-list';
    else if (this.isPublic && component == 'identity-verification')
      return 'Disabled: Sign in as a private use to access';
    else {
      if (this.isBackstopped() && this.isDisabled(component)) {
        return 'Component is unavailable to backstopped banks';
      } else return '';
    }
  }

  isDisabled(component: string): boolean {
    if (component == 'account-details') return true;
    else if (this.isPublic && component == 'identity-verification') return true;
    else {
      if (this.isBackstopped()) {
        return !Constants.COMPONENTS_BACKSTOPPED.includes(component);
      } else return false;
    }
  }

  // Set component on changes
  initComponentGroup() {
    this.componentGroup
      .get('component')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        map((component) => {
          this.componentRef.instance.component = component;
        })
      )
      .subscribe();
  }

  // Set language on changes
  initLanguageGroup() {
    this.languageGroup
      .get('language')
      ?.valueChanges.pipe(
        takeUntil(this.unsubscribe$),
        map((language) => {
          let config = this.demoConfigService.config$.value;
          config.locale = language;
          this.demoConfigService.config$.next(config);
        })
      )
      .subscribe();
  }

  initDemo(credentials: DemoCredentials) {
    this.login$.next(true);

    let config = { ...Constants.DEFAULT_CONFIG };
    config.customer = credentials.customer;
    config.environment = credentials.environment;

    this.languageGroup.patchValue({ language: config.locale });
    this.demoConfigService.config$.next(config);

    // Create main app
    this.componentRef = this.viewContainer.createComponent(AppComponent);

    this.componentRef.instance.config = config;
    this.componentRef.instance.auth = credentials.token;
    this.componentRef.instance.component = Constants.DEFAULT_COMPONENT;

    // Set Public/Private
    this.isPublic = credentials.isPublic;

    // Subscribe to component configuration changes
    this.demoConfigService.config$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((config) => {
        this.componentRef.instance.config = config;
      });

    // Subscribe to routing events and set component selector value
    this.componentRef.instance.eventLog
      .pipe(
        takeUntil(this.unsubscribe$),
        filter((event: EventLog) => {
          return (
            event.code == CODE.ROUTING_END ||
            event.code == CODE.ROUTING_START ||
            event.code == CODE.ROUTING_REQUEST ||
            event.code == CODE.ROUTING_DENIED
          );
        }),
        map((event) => {
          this.componentGroup.get('component')?.patchValue(event.data.default, {
            emitEvent: false,
            onlySelf: true
          });
        })
      )
      .subscribe();

    // Subscribe to errors
    this.componentRef.instance.errorLog.subscribe((error) =>
      console.log(error)
    );

    this.initBank();
    this.initComponentGroup();
    this.initLanguageGroup();
  }
}
