import { Injectable, OnDestroy } from '@angular/core';
import { Constants } from '../../constants/constants';
import { BehaviorSubject, Observable, Subject, takeUntil } from 'rxjs';
import { CODE, EventService, LEVEL } from '../event/event.service';
import { ErrorService } from '../error/error.service';
import { TranslateService } from '@ngx-translate/core';
import en from '../../i18n/en';
import fr from '../../i18n/fr';

export interface ComponentConfig {
  refreshInterval: number;
  locale: string;
  theme: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService implements OnDestroy {
  defaultConfig: ComponentConfig = {
    refreshInterval: Constants.REFRESH_INTERVAL,
    locale: Constants.LOCALE,
    theme: Constants.THEME
  };
  config$: BehaviorSubject<ComponentConfig> =
    new BehaviorSubject<ComponentConfig>(this.defaultConfig);
  private unsubscribe$ = new Subject();

  constructor(
    private eventService: EventService,
    private errorService: ErrorService,
    private translateService: TranslateService
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
      this.config$.next(this.defaultConfig);
      const err = new Error('Invalid host configuration: reset to default');
      this.eventService.handleEvent(
        LEVEL.ERROR,
        CODE.CONFIG_ERROR,
        'Invalid host configuration: reset to default'
      );
      this.errorService.handleError(err);
    }
  }

  getConfig$(): Observable<ComponentConfig> {
    return this.config$.asObservable();
  }

  validateConfig(hostConfig: object): hostConfig is ComponentConfig {
    const refreshInterval = (hostConfig as ComponentConfig).refreshInterval;
    const locale = (hostConfig as ComponentConfig).locale;
    const theme = (hostConfig as ComponentConfig).theme;
    return (
      refreshInterval !== undefined &&
      refreshInterval !== null &&
      locale !== undefined &&
      locale !== null &&
      Constants.SUPPORTED_LOCALES.includes(locale) &&
      theme !== undefined &&
      theme !== null
    );
  }

  initLocale(): void {
    this.translateService.setTranslation('en-US', en);
    this.translateService.setTranslation('fr-CA', fr);
    this.translateService.setDefaultLang(Constants.LOCALE);
    this.config$.pipe(takeUntil(this.unsubscribe$)).subscribe((cfg) => {
      this.translateService.use(cfg.locale);
    });
  }

  initStyle(): void {
    document.documentElement.style.setProperty('--cybrid-t-font', 'Roboto');
  }
}
