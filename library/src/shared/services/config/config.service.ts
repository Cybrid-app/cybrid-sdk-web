import { Injectable, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import en from '../../i18n/en';
import fr from '../../i18n/fr';
import { OverlayContainer } from '@angular/cdk/overlay';

import {
  map,
  Observable,
  ReplaySubject,
  Subject,
  switchMap,
  takeUntil,
  timer
} from 'rxjs';

// Services
import { ErrorService, CODE, EventService, LEVEL } from '@services';
import {
  BanksService,
  Configuration,
  CustomerBankModel,
  CustomersService
} from '@cybrid/cybrid-api-bank-angular';

// Utility
import { Constants } from '@constants';
import { environment } from '@environment';

export type Environment = 'local' | 'staging' | 'sandbox' | 'production';

export interface ComponentConfig {
  refreshInterval: number;
  locale: string;
  theme: string;
  routing: boolean;
  customer: string; // Temporary solution until the JWT embeds a customer GUID
  fiat: string;
  features: Array<string>;
  environment: Environment;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements OnDestroy {
  config: ComponentConfig = Constants.DEFAULT_CONFIG;
  config$ = new ReplaySubject<ComponentConfig>(1);

  component$ = new ReplaySubject<string>(1);

  customer$ = new ReplaySubject<CustomerBankModel>(1);

  private unsubscribe$ = new Subject();

  constructor(
    private eventService: EventService,
    private errorService: ErrorService,
    private translateService: TranslateService,
    private overlay: OverlayContainer,
    private banksService: BanksService,
    private customersService: CustomersService,
    private configuration: Configuration
  ) {
    this.initLocale();
    this.initStyle();
    this.initPlatformData();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  setConfig(hostConfig: ComponentConfig) {
    if (this.validateConfig(hostConfig) && this.setEnvironment(hostConfig)) {
      this.eventService.handleEvent(
        LEVEL.INFO,
        CODE.CONFIG_SET,
        'Component configuration has been set'
      );
      this.config$.next(hostConfig);
    } else {
      this.eventService.handleEvent(
        LEVEL.ERROR,
        CODE.CONFIG_ERROR,
        'Invalid host configuration'
      );
      this.errorService.handleError({
        code: CODE.CONFIG_ERROR,
        message: 'Invalid host configuration'
      });
    }
  }

  getConfig$(): Observable<ComponentConfig> {
    return this.config$.asObservable();
  }

  setComponent(selector: string) {
    this.component$.next(selector);
  }

  getComponent$(): Observable<string> {
    return this.component$.asObservable();
  }

  validateConfig(hostConfig: object): hostConfig is ComponentConfig {
    const refreshInterval = (hostConfig as ComponentConfig).refreshInterval;
    const locale = (hostConfig as ComponentConfig).locale;
    const theme = (hostConfig as ComponentConfig).theme;
    const routing = (hostConfig as ComponentConfig).routing;
    const customer = (hostConfig as ComponentConfig).customer;
    const fiat = (hostConfig as ComponentConfig).fiat;
    const environment = (hostConfig as ComponentConfig).environment;
    return (
      refreshInterval !== undefined &&
      refreshInterval !== null &&
      locale !== undefined &&
      locale !== null &&
      Constants.SUPPORTED_LOCALES.includes(locale) &&
      routing !== undefined &&
      routing !== null &&
      theme !== undefined &&
      theme !== null &&
      customer !== null &&
      customer !== undefined &&
      fiat !== null &&
      fiat !== undefined &&
      environment !== null &&
      environment !== undefined
    );
  }

  setEnvironment(config: ComponentConfig): boolean {
    switch (config.environment) {
      case 'local':
        this.configuration.basePath = environment.localBankApiBasePath;
        return true;
      case 'staging':
        this.configuration.basePath = environment.stagingBankApiBasePath;
        return true;
      case 'sandbox':
        this.configuration.basePath = environment.sandboxBankApiBasePath;
        return true;
      case 'production':
        this.configuration.basePath = environment.productionBankApiBasePath;
        return true;
    }
  }

  initLocale(): void {
    this.translateService.setTranslation('en-US', en);
    this.translateService.setTranslation('fr-CA', fr);
    this.translateService.setDefaultLang(Constants.LOCALE);
    this.getConfig$()
      .pipe(
        map((config) => this.translateService.use(config.locale)),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  initStyle(): void {
    document.documentElement.style.setProperty('--cybrid-t-font', 'Roboto');

    /*
    Toggles dark mode theme for Angular Material components that use overlays
    outside the scope of other component styles
    * */
    this.getConfig$()
      .pipe(
        map((config) => {
          const container = this.overlay.getContainerElement();

          // Angular Material typography styles
          container.classList.add('mat-typography');

          // Global styles
          container.classList.add('cybrid-global');

          // Selected theme styles
          if (config!.theme === 'DARK') {
            container.classList.remove('cybrid-light-theme');
            container.classList.add('cybrid-dark-theme');
          } else {
            container.classList.remove('cybrid-dark-theme');
            container.classList.add('cybrid-light-theme');
          }
        }),
        takeUntil(this.unsubscribe$)
      )
      .subscribe();
  }

  initPlatformData(): void {
    timer(0, Constants.PLATFORM_REFRESH_INTERVAL)
      .pipe(
        takeUntil(this.unsubscribe$),
        switchMap(() => this.config$),
        switchMap((config) => {
          return this.customersService.getCustomer(config.customer);
        }),
        map((customer: CustomerBankModel) => {
          this.customer$.next(customer);
        })
      )
      .subscribe();
  }

  getCustomer$(): Observable<CustomerBankModel> {
    return this.customer$.asObservable();
  }
}
