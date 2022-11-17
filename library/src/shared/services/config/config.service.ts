import { Injectable, OnDestroy } from '@angular/core';
import { Constants } from '@constants';
import { map, Observable, ReplaySubject, Subject, takeUntil } from 'rxjs';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';
import { TranslateService } from '@ngx-translate/core';
import en from '../../i18n/en';
import fr from '../../i18n/fr';
import { OverlayContainer } from '@angular/cdk/overlay';

export interface ComponentConfig {
  refreshInterval: number;
  locale: string;
  theme: string;
  routing: boolean;
  customer: string; // Temporary solution until the JWT embeds a customer GUID
  bank?: string;
  fiat: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements OnDestroy {
  config: ComponentConfig = Constants.DEFAULT_CONFIG;
  config$ = new ReplaySubject<ComponentConfig>(1);

  component$ = new ReplaySubject<string>(1);

  private unsubscribe$ = new Subject();

  constructor(
    private eventService: EventService,
    private errorService: ErrorService,
    private translateService: TranslateService,
    private overlay: OverlayContainer
  ) {
    this.initLocale();
    this.initStyle();
  }

  ngOnDestroy() {
    this.unsubscribe$.next('');
    this.unsubscribe$.complete();
  }

  setConfig(hostConfig: ComponentConfig) {
    if (this.validateConfig(hostConfig)) {
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
    const bank = (hostConfig as ComponentConfig).bank;
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
      bank !== null &&
      bank !== undefined
    );
  }

  initLocale(): void {
    this.translateService.setTranslation('en-US', en);
    this.translateService.setTranslation('fr-CA', fr);
    this.translateService.setDefaultLang(Constants.LOCALE);
    this.config$
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => {
          this.translateService.use(config!.locale);
        })
      )
      .subscribe();
  }

  initStyle(): void {
    document.documentElement.style.setProperty('--cybrid-t-font', 'Roboto');

    /*
    Toggles dark mode theme for Angular Material components that use overlays
    outside the scope of other component styles
    * */
    this.config$
      .pipe(
        takeUntil(this.unsubscribe$),
        map((config) => {
          const container = this.overlay.getContainerElement();

          // Angular Material typography styles
          container.classList.add('mat-typography');

          // Selected theme styles
          if (config!.theme === 'DARK') {
            container.classList.remove('cybrid-light-theme');
            container.classList.add('cybrid-dark-theme');
          } else {
            container.classList.remove('cybrid-dark-theme');
            container.classList.add('cybrid-light-theme');
          }
        })
      )
      .subscribe();
  }
}
